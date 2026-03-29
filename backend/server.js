require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const SHARPAPI_KEY = process.env.SHARPAPI_KEY;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/analyze', async (req, res) => {
  const { tinh_huong, loai_hinh_dn, nganh_nghe } = req.body;

  if (!tinh_huong || tinh_huong.trim().length < 20) {
    return res.status(400).json({
      error: 'Mô tả tình huống phải có ít nhất 20 ký tự.'
    });
  }

  if (!SHARPAPI_KEY) {
    return res.status(500).json({ error: 'Server chưa được cấu hình API key.' });
  }

  try {
    // Step 1: Submit job to SharpAPI
    const submitRes = await fetch('https://sharpapi.com/api/v1/custom/vietnam-tax-review-memo', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SHARPAPI_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ tinh_huong, loai_hinh_dn, nganh_nghe })
    });

    if (!submitRes.ok) {
      const errText = await submitRes.text();
      console.error('SharpAPI submit error:', submitRes.status, errText);
      return res.status(502).json({ error: 'Lỗi khi gửi yêu cầu phân tích. Vui lòng thử lại.' });
    }

    const submitData = await submitRes.json();
    const statusUrl = submitData?.data?.status_url || submitData?.status_url;

    if (!statusUrl) {
      console.error('No status_url in response:', submitData);
      return res.status(502).json({ error: 'Phản hồi API không hợp lệ.' });
    }

    // Step 2: Poll status URL
    const POLL_INTERVAL = 3000;
    const TIMEOUT = 120000;
    const startTime = Date.now();

    while (Date.now() - startTime < TIMEOUT) {
      await new Promise(r => setTimeout(r, POLL_INTERVAL));

      const statusRes = await fetch(statusUrl, {
        headers: {
          'Authorization': `Bearer ${SHARPAPI_KEY}`,
          'Accept': 'application/json'
        }
      });

      if (!statusRes.ok) {
        console.error('SharpAPI poll error:', statusRes.status);
        continue;
      }

      const statusData = await statusRes.json();
      const jobStatus = statusData?.data?.status || statusData?.status;

      if (jobStatus === 'success') {
        const result = statusData?.data?.result ?? statusData?.result;
        return res.json({ result });
      }

      if (jobStatus === 'failed') {
        const errMsg = statusData?.data?.message || 'Phân tích thất bại.';
        return res.status(502).json({ error: errMsg });
      }
    }

    return res.status(504).json({ error: 'Phân tích mất quá lâu. Vui lòng thử lại.' });

  } catch (err) {
    console.error('Unexpected error:', err);
    return res.status(500).json({ error: 'Không thể kết nối. Vui lòng thử lại.' });
  }
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`TaxMemo server running on port ${PORT}`);
});
