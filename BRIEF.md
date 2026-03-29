# BRIEF: TaxMemo — Vietnam Tax Review Memo Generator

## Tổng quan
Web app cho phép tư vấn thuế nhập mô tả tình huống → AI phân tích → hiển thị draft memo tư vấn thuế chuyên nghiệp → export PDF.

## Tech Stack
- **Frontend:** React 18 + Vite + TailwindCSS
- **Backend:** Node.js + Express (proxy API call, ẩn API key)
- **Deploy:** Single repo, Docker Compose (frontend build tĩnh, backend serve)
- **Port:** 3000 (backend serves frontend build + API routes)

## File Structure
```
taxmemo/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── components/
│   │   │   ├── InputForm.jsx
│   │   │   ├── MemoResult.jsx
│   │   │   ├── RiskBadge.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ExportButton.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Backend (server.js)
Express server với 2 routes:

### POST /api/analyze
- Nhận: `{ tinh_huong, loai_hinh_dn, nganh_nghe }`
- Validate: `tinh_huong` required, min 20 chars
- Gọi SharpAPI: `POST https://sharpapi.com/api/v1/custom/vietnam-tax-review-memo`
  - Header: `Authorization: Bearer ${SHARPAPI_KEY}`
  - Poll status URL mỗi 3s, timeout 120s
- Trả về JSON result khi success, error nếu fail

### GET /api/health
- Trả về `{ status: "ok" }`

### ENV vars (.env):
```
SHARPAPI_KEY=your_key_here
PORT=3000
```

## Frontend UI

### Layout
Split panel trên desktop, stacked trên mobile:
- **Trái (40%):** Input form
- **Phải (60%):** Kết quả memo

### InputForm.jsx
```
┌─────────────────────────────────────┐
│  🏛️  TaxMemo                        │
│  AI Tax Advisory for Vietnam        │
├─────────────────────────────────────┤
│  Mô tả tình huống *                 │
│  ┌─────────────────────────────┐    │
│  │ Textarea, 5 rows,           │    │
│  │ placeholder: "Công ty..."   │    │
│  └─────────────────────────────┘    │
│                                     │
│  Loại hình DN          Ngành nghề   │
│  ┌──────────────┐  ┌─────────────┐  │
│  │ Select ▼     │  │ Text input  │  │
│  └──────────────┘  └─────────────┘  │
│                                     │
│  [  🔍 Phân tích thuế  ]            │
└─────────────────────────────────────┘
```

**Loại hình DN options:** FDI, Doanh nghiệp nội địa, Hộ kinh doanh, Cá nhân, Khác

**Validation:** Textarea min 20 chars, hiện character count

### MemoResult.jsx — Hiển thị kết quả

Khi đang load: spinner + text "Đang phân tích..."

Khi có kết quả, hiển thị các section theo thứ tự:

**1. Header**
```
┌──────────────────────────────────────────┐
│  [RiskBadge]  Mức rủi ro: CAO            │
│  Lý do: [ly_do_rui_ro]                   │
│  [Export PDF]  [Copy]                    │
└──────────────────────────────────────────┘
```

**2. Tóm tắt** — card xám nhạt, text `tom_tat`

**3. Các loại thuế áp dụng** — table:
| Loại thuế | Thuế suất | Cơ sở tính | Ước tính |
|-----------|-----------|------------|---------|

**4. Căn cứ pháp lý** — list với badge độ tin cậy:
- 🟢 Cao — màu xanh
- 🟡 Trung bình — màu vàng  
- 🔴 Thấp — màu đỏ
- Mỗi item: `[Loại] [Số hiệu] — Nội dung`

**5. Rủi ro phạt** — 3 cards ngang:
- Lãi chậm nộp
- Phạt tự khai bổ sung (20%)
- Phạt nếu bị kiểm tra (75-150%)

**6. Vấn đề chuyển giá** — chỉ hiện nếu có nội dung, card màu cam

**7. Khuyến nghị** — numbered list với badge priority:
- 🔴 Cao
- 🟡 Trung bình
- 🟢 Thấp
- Mỗi item: `[N] Hành động — Thời hạn: X`

**8. Cần xác nhận thêm** — bullet list màu xám

**9. Disclaimer** — text nhỏ, italic, màu xám nhạt ở cuối

### RiskBadge.jsx
- **THẤP** → bg-green-100 text-green-800
- **TRUNG BÌNH** → bg-yellow-100 text-yellow-800
- **CAO** → bg-red-100 text-red-800
- **RẤT CAO** → bg-red-200 text-red-900 font-bold + pulsing border

### ExportButton.jsx
Dùng `window.print()` với CSS `@media print` ẩn form, chỉ in memo.
Hoặc dùng `html2pdf.js` nếu muốn PDF đẹp hơn — dùng `html2pdf.js`.

## Dockerfile
```dockerfile
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --production
COPY backend/ .
COPY --from=frontend-build /app/frontend/dist ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

Backend serve frontend từ `./public` (static files).

## docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - SHARPAPI_KEY=${SHARPAPI_KEY}
      - PORT=3000
    restart: unless-stopped
```

## Styling notes
- Font: Inter (Google Fonts)
- Primary color: `#1e40af` (blue-800) — professional
- Background: `#f8fafc` (slate-50)
- Cards: white với shadow-sm, rounded-lg
- Responsive: mobile-first, md:flex-row cho split panel

## Error handling
- Network error → "Không thể kết nối. Vui lòng thử lại."
- Timeout (>120s) → "Phân tích mất quá lâu. Vui lòng thử lại."
- SharpAPI error → hiển thị message từ API
- Empty result → "Không có kết quả. Vui lòng mô tả chi tiết hơn."

## Sample test case (để test sau khi build)
```json
{
  "tinh_huong": "Công ty FDI sản xuất tại Hà Nội trả phí dịch vụ quản lý 3 tỷ VND/năm cho công ty mẹ tại Singapore. Hợp đồng ký từ năm 2020. Công ty chưa kê khai và nộp thuế nhà thầu (FCT) cho khoản phí này bao giờ. Hiện đang bị thanh tra thuế.",
  "loai_hinh_dn": "FDI",
  "nganh_nghe": "Sản xuất"
}
```

## Sau khi build xong
1. Push lên GitHub `phanvuhoang/taxmemo`
2. Nhắn Thanh "deploy taxmemo" → Thanh setup Coolify + domain `taxmemo.gpt4vn.com`
3. Set env var `SHARPAPI_KEY` trong Coolify dashboard
