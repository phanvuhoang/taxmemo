import LoadingSpinner from './LoadingSpinner.jsx';
import RiskBadge from './RiskBadge.jsx';
import ExportButton from './ExportButton.jsx';

const PRIORITY_BADGE = {
  'cao': 'bg-red-100 text-red-700',
  'trung bình': 'bg-yellow-100 text-yellow-700',
  'thấp': 'bg-green-100 text-green-700',
};

const RELIABILITY_CONFIG = {
  'cao': { dot: '🟢', cls: 'text-green-700 bg-green-50 border-green-200' },
  'trung bình': { dot: '🟡', cls: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
  'thấp': { dot: '🔴', cls: 'text-red-700 bg-red-50 border-red-200' },
};

function getReliability(val) {
  const v = (val || '').toLowerCase();
  return RELIABILITY_CONFIG[v] || { dot: '⚪', cls: 'text-slate-600 bg-slate-50 border-slate-200' };
}

function getPriorityBadge(val) {
  const v = (val || '').toLowerCase();
  return PRIORITY_BADGE[v] || 'bg-slate-100 text-slate-600';
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function memoText(result) {
  if (!result) return '';
  return JSON.stringify(result, null, 2);
}

export default function MemoResult({ result, loading, error }) {
  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400">
        <span className="text-4xl mb-3">📋</span>
        <p className="text-sm">Nhập tình huống và nhấn <strong>Phân tích thuế</strong> để xem kết quả tư vấn.</p>
      </div>
    );
  }

  const {
    muc_rui_ro,
    ly_do_rui_ro,
    tom_tat,
    cac_loai_thue = [],
    can_cu_phap_ly = [],
    rui_ro_phat = {},
    van_de_chuyen_gia,
    khuyen_nghi = [],
    can_xac_nhan_them = [],
    disclaimer
  } = result;

  return (
    <div id="memo-result" className="space-y-4">
      {/* 1. Header */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <RiskBadge level={muc_rui_ro} />
          <span className="text-slate-700 font-medium text-sm">Mức rủi ro: {muc_rui_ro}</span>
          <div className="ml-auto flex gap-2 no-print">
            <ExportButton targetId="memo-result" />
            <button
              onClick={() => copyToClipboard(memoText(result))}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition"
            >
              📋 Copy
            </button>
          </div>
        </div>
        {ly_do_rui_ro && (
          <p className="text-slate-600 text-sm">
            <span className="font-medium">Lý do:</span> {ly_do_rui_ro}
          </p>
        )}
      </div>

      {/* 2. Tóm tắt */}
      {tom_tat && (
        <div className="bg-slate-100 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-1 uppercase tracking-wide">Tóm tắt</h2>
          <p className="text-slate-700 text-sm leading-relaxed">{tom_tat}</p>
        </div>
      )}

      {/* 3. Các loại thuế */}
      {cac_loai_thue.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Các loại thuế áp dụng</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left">
                  <th className="px-3 py-2 font-medium text-slate-600 rounded-l">Loại thuế</th>
                  <th className="px-3 py-2 font-medium text-slate-600">Thuế suất</th>
                  <th className="px-3 py-2 font-medium text-slate-600">Cơ sở tính</th>
                  <th className="px-3 py-2 font-medium text-slate-600 rounded-r">Ước tính</th>
                </tr>
              </thead>
              <tbody>
                {cac_loai_thue.map((t, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-medium text-slate-800">{t.loai_thue || t.ten}</td>
                    <td className="px-3 py-2 text-slate-600">{t.thue_suat || t.rate}</td>
                    <td className="px-3 py-2 text-slate-600">{t.co_so_tinh || t.basis}</td>
                    <td className="px-3 py-2 text-slate-600">{t.uoc_tinh || t.estimate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Căn cứ pháp lý */}
      {can_cu_phap_ly.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Căn cứ pháp lý</h2>
          <ul className="space-y-2">
            {can_cu_phap_ly.map((item, i) => {
              const rel = getReliability(item.do_tin_cay || item.reliability);
              return (
                <li key={i} className={`flex items-start gap-2 text-sm border rounded-lg px-3 py-2 ${rel.cls}`}>
                  <span>{rel.dot}</span>
                  <span>
                    {item.loai && <span className="font-medium">[{item.loai}] </span>}
                    {item.so_hieu && <span className="font-medium">{item.so_hieu} — </span>}
                    {item.noi_dung || item.content || item.description}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* 5. Rủi ro phạt */}
      {rui_ro_phat && Object.keys(rui_ro_phat).length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Rủi ro phạt</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <PenaltyCard
              title="Lãi chậm nộp"
              content={rui_ro_phat.lai_cham_nop || rui_ro_phat.late_payment_interest}
            />
            <PenaltyCard
              title="Phạt tự khai bổ sung (20%)"
              content={rui_ro_phat.phat_tu_khai_bo_sung || rui_ro_phat.voluntary_amendment_penalty}
            />
            <PenaltyCard
              title="Phạt nếu bị kiểm tra (75–150%)"
              content={rui_ro_phat.phat_bi_kiem_tra || rui_ro_phat.audit_penalty}
            />
          </div>
        </div>
      )}

      {/* 6. Vấn đề chuyển giá */}
      {van_de_chuyen_gia && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-orange-800 mb-2 uppercase tracking-wide">⚠️ Vấn đề chuyển giá</h2>
          <p className="text-orange-700 text-sm leading-relaxed">{van_de_chuyen_gia}</p>
        </div>
      )}

      {/* 7. Khuyến nghị */}
      {khuyen_nghi.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3 uppercase tracking-wide">Khuyến nghị</h2>
          <ol className="space-y-2">
            {khuyen_nghi.map((item, i) => {
              const pri = item.priority || item.uu_tien;
              return (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-100 text-primary-700 font-bold flex items-center justify-center text-xs">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      {pri && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadge(pri)}`}>
                          {pri}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700">{item.hanh_dong || item.action || item.content}</p>
                    {(item.thoi_han || item.deadline) && (
                      <p className="text-slate-400 text-xs mt-0.5">Thời hạn: {item.thoi_han || item.deadline}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* 8. Cần xác nhận thêm */}
      {can_xac_nhan_them.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-slate-600 mb-2 uppercase tracking-wide">Cần xác nhận thêm</h2>
          <ul className="space-y-1">
            {can_xac_nhan_them.map((item, i) => (
              <li key={i} className="text-slate-600 text-sm flex items-start gap-2">
                <span className="text-slate-400 mt-0.5">•</span>
                <span>{typeof item === 'string' ? item : item.noi_dung || item.content}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 9. Disclaimer */}
      {disclaimer && (
        <p className="text-xs text-slate-400 italic leading-relaxed px-1 pb-2">{disclaimer}</p>
      )}
    </div>
  );
}

function PenaltyCard({ title, content }) {
  return (
    <div className="bg-red-50 border border-red-100 rounded-lg p-3">
      <p className="text-xs font-semibold text-red-700 mb-1">{title}</p>
      <p className="text-sm text-red-600">{content || '—'}</p>
    </div>
  );
}
