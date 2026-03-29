export default function RiskBadge({ level }) {
  const normalized = (level || '').toUpperCase();

  const styles = {
    'THẤP': 'bg-green-100 text-green-800',
    'TRUNG BÌNH': 'bg-yellow-100 text-yellow-800',
    'CAO': 'bg-red-100 text-red-800',
    'RẤT CAO': 'bg-red-200 text-red-900 font-bold animate-pulse border-2 border-red-500',
  };

  const cls = styles[normalized] || 'bg-slate-100 text-slate-700';

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${cls}`}>
      {level || 'Không xác định'}
    </span>
  );
}
