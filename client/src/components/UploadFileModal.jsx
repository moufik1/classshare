import { useState } from 'react';
import { X, UploadCloud, File, Loader2 } from 'lucide-react';
import api from '../services/api';

export default function UploadFileModal({
  isOpen,
  onClose,
  classId,
  availableSubjects = [],
  onFileUploaded
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setError('Le fichier dépasse la limite autorisée de 20 Mo.');
        return;
      }
      setSelectedFile(file);
      setError('');
      // Pré-remplir le titre si vide
      if (!title) {
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
        setTitle(nameWithoutExt);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !title.trim() || !subject.trim()) {
      setError('Veuillez sélectionner un fichier, un titre et une matière.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title.trim());
      formData.append('subject', subject.trim());
      if (chapter.trim()) {
        formData.append('chapter', chapter.trim());
      }
      formData.append('classId', classId);

      const res = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      onFileUploaded(res.data.data);
      setSelectedFile(null);
      setTitle('');
      setSubject('');
      setChapter('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'upload du fichier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-slate-900">Ajouter un document</h3>
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
          {/* Zone de sélection du fichier */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Fichier (PDF, Image, Word, PowerPoint - max 20 Mo)
            </label>
            <label className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/40 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition">
              <UploadCloud className="w-8 h-8 text-indigo-500 mb-2" />
              <span className="text-sm font-medium text-slate-700">
                {selectedFile ? selectedFile.name : 'Cliquez pour choisir un document'}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                {selectedFile
                  ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} Mo`
                  : 'PDF, JPG, PNG, DOC, DOCX, PPT, PPTX'}
              </span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.ppt,.pptx"
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Titre du document */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Titre du fichier
            </label>
            <input
              type="text"
              placeholder="ex: TD 4 Corrigé, Fiche de révision Chapitre 2..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Matière */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Matière
            </label>
            <input
              type="text"
              placeholder="ex: Mathématiques, Histoire, Physique, Anglais..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />

            {/* Suggestions de matières déjà existantes dans la classe */}
            {availableSubjects.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400">Suggestions :</span>
                {availableSubjects.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setSubject(sub)}
                    className="px-2 py-0.5 bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-600 rounded-md text-[11px] transition"
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chapitre (optionnel) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Chapitre <span className="text-slate-400 font-normal">(optionnel)</span>
            </label>
            <input
              type="text"
              placeholder="ex: Chapitre 1 : Limites et Continuité"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Permet de regrouper et structurer vos cours dans la classe.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition min-h-[44px]"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !selectedFile || !title.trim() || !subject.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition min-h-[44px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Téléversement Cloudinary...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Publier le fichier</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
