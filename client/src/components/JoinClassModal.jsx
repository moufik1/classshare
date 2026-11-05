import { useState } from 'react';
import { X, KeyRound, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function JoinClassModal({ isOpen, onClose, onClassJoined }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.trim().length !== 6) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/classes/join', { code: code.trim().toUpperCase() });
      onClassJoined(res.data.data);
      setCode('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Code invalide ou erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">Rejoindre une classe</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Code de la classe (6 caractères)
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="ex: X8Y3KZ"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-center text-lg tracking-widest font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition min-h-[48px]"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 text-center">
              Demandez ce code à l'administrateur ou à un élève de la classe.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition min-h-[44px]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || code.trim().length !== 6}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition min-h-[44px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Vérification...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Rejoindre</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
