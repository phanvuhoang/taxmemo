import { useState } from 'react';
import InputForm from './components/InputForm.jsx';
import MemoResult from './components/MemoResult.jsx';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      } else {
        setResult(data.result);
      }
    } catch {
      setError('Không thể kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left panel - Input form (40%) */}
        <div className="w-full md:w-2/5 p-4 md:p-6 md:border-r border-slate-200 no-print">
          <InputForm onAnalyze={handleAnalyze} loading={loading} />
        </div>

        {/* Right panel - Result (60%) */}
        <div className="w-full md:w-3/5 p-4 md:p-6 overflow-auto">
          <MemoResult result={result} loading={loading} error={error} />
        </div>
      </div>
    </div>
  );
}
