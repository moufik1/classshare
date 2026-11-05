import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Trash2, Loader2, User, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CommentsSection({ file, onClose }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [error, setError] = useState('');
  const commentsEndRef = useRef(null);

  // Charger les commentaires du fichier
  const fetchComments = async () => {
    if (!file?._id) return;
    try {
      setLoading(true);
      const res = await api.get(`/comments/file/${file._id}`);
      setComments(res.data.data);
      setError('');
    } catch (err) {
      console.error('Erreur chargement commentaires :', err);
      setError(err.response?.data?.message || 'Impossible de charger les commentaires.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [file?._id]);

  // Défilement automatique vers le dernier commentaire
  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [comments, loading]);

  // Ajouter un nouveau commentaire
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || submitting) return;

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/comments', {
        fileId: file._id,
        text: newCommentText.trim()
      });

      setComments((prev) => [...prev, res.data.data]);
      setNewCommentText('');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi du commentaire");
    } finally {
      setSubmitting(false);
    }
  };

  // Supprimer un commentaire
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce commentaire ?')) return;

    try {
      await api.delete(`/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // Formatage de la date en français
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* En-tête */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Commentaires</span>
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">
                {comments.length} message{comments.length > 1 ? 's' : ''}
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 truncate" title={file.title}>
              {file.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 truncate">
              {file.subject} {file.chapter && `• ${file.chapter}`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div className="m-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* Corps de la conversation */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <span className="text-xs">Chargement des commentaires...</span>
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-slate-400">
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-3">
                <MessageSquare className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700">Aucun commentaire pour l'instant</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Posez une question sur ce cours ou partagez des précisions avec votre classe !
              </p>
            </div>
          ) : (
            comments.map((comment) => {
              const isAuthor =
                user &&
                (user._id === comment.author?._id || user._id === comment.author);

              return (
                <div
                  key={comment._id}
                  className={`flex gap-3 p-3.5 rounded-2xl transition ${
                    isAuthor ? 'bg-indigo-50/50 border border-indigo-100' : 'bg-slate-50 border border-slate-100'
                  }`}
                >
                  {/* Avatar avec initiale */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white font-bold text-xs flex items-center justify-center shadow-sm flex-shrink-0">
                    {comment.author?.name ? comment.author.name.charAt(0).toUpperCase() : 'U'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-semibold text-slate-800">
                          {comment.author?.name || 'Élève'}
                        </span>
                        {isAuthor && (
                          <span className="px-1.5 py-0.5 bg-indigo-200/60 text-indigo-800 rounded text-[10px] font-medium">
                            Vous
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {formatDate(comment.createdAt)}
                        </span>
                        {isAuthor && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-slate-400 hover:text-rose-600 transition p-0.5 rounded"
                            title="Supprimer mon commentaire"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 whitespace-pre-wrap break-words leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Formulaire d'envoi */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form onSubmit={handleAddComment} className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="Écrire un commentaire ou une question..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
            <button
              type="submit"
              disabled={submitting || !newCommentText.trim()}
              className="inline-flex items-center justify-center p-2.5 sm:px-4 sm:py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl shadow-md shadow-indigo-200 transition"
              title="Envoyer"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
