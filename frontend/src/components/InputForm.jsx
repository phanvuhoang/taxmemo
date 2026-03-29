import { useState } from 'react';

const LOAI_HINH_OPTIONS = [
  { value: '', label: 'Chọn loại hình...' },
  { value: 'FDI', label: 'FDI' },
  { value: 'Doanh nghiệp nội địa', label: 'Doanh nghiệp nội địa' },
  { value: 'Hộ kinh doanh', label: 'Hộ kinh doanh' },
  { value: 'Cá nhân', label: 'Cá nhân' },
  { value: 'Khác', label: 'Khác' },
];

const MIN_LENGTH = 20;

export default function InputForm({ onAnalyze, loading }) {
  const [tinhHuong, setTinhHuong] = useState('');
  const [loaiHinhDn, setLoaiHinhDn] = useState('');
  const [nganhNghe, setNganhNghe] = useState('');
  const [touched, setTouched] = useState(false);

  const isValid = tinhHuong.trim().length >= MIN_LENGTH;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    onAnalyze({
      tinh_huong: tinhHuong.trim(),
      loai_hinh_dn: loaiHinhDn,
      nganh_nghe: nganhNghe.trim()
    });
  };

  const charCount = tinhHuong.length;
  const showError = touched && !isValid;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🏛️</span>
          <h1 className="text-2xl font-bold text-primary-700">TaxMemo</h1>
        </div>
        <p className="text-slate-500 text-sm">AI Tax Advisory for Vietnam</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
        {/* Mô tả tình huống */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mô tả tình huống <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={5}
            value={tinhHuong}
            onChange={e => setTinhHuong(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder="Công ty FDI sản xuất tại Hà Nội trả phí dịch vụ quản lý cho công ty mẹ tại Singapore..."
            className={`w-full rounded-lg border px-3 py-2 text-sm text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 transition ${
              showError ? 'border-red-400 bg-red-50' : 'border-slate-300 bg-white'
            }`}
          />
          <div className="flex justify-between mt-1">
            {showError ? (
              <p className="text-xs text-red-500">Vui lòng nhập ít nhất {MIN_LENGTH} ký tự.</p>
            ) : (
              <span />
            )}
            <span className={`text-xs ml-auto ${charCount < MIN_LENGTH ? 'text-slate-400' : 'text-green-600'}`}>
              {charCount} ký tự
            </span>
          </div>
        </div>

        {/* Loại hình DN + Ngành nghề */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Loại hình DN</label>
            <select
              value={loaiHinhDn}
              onChange={e => setLoaiHinhDn(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {LOAI_HINH_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Ngành nghề</label>
            <input
              type="text"
              value={nganhNghe}
              onChange={e => setNganhNghe(e.target.value)}
              placeholder="Sản xuất, Thương mại..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="mt-auto w-full flex items-center justify-center gap-2 bg-primary-700 hover:bg-primary-600 disabled:bg-primary-200 text-white font-semibold rounded-lg px-4 py-3 text-sm transition"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Đang phân tích...
            </>
          ) : (
            <>🔍 Phân tích thuế</>
          )}
        </button>
      </form>
    </div>
  );
}
