import { FileText, Image, Presentation, File, Download, Trash2, Calendar, User, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function FileCard({ file, onDelete, onOpenComments }) {
  const { user } = useAuth();

  const isOwner =
    user && (user._id === file.uploadedBy?._id || user._id === file.uploadedBy);

  // Formater la taille du fichier
  const formatSize = (bytes) => {
    if (!bytes) return '0 Ko';
    const k = 1024;
    const sizes = ['Octets', 'Ko', 'Mo', 'Go'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Sélectionner l'icône et la couleur selon l'extension
  const getFileBadge = (type) => {
    const t = (type || '').toLowerCase();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(t)) {
      return {
        icon: <Image className="w-5 h-5 text-emerald-600" />,
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: t.toUpperCase()
      };
    }
    if (['pdf'].includes(t)) {
      return {
        icon: <FileText className="w-5 h-5 text-rose-600" />,
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        label: 'PDF'
      };
    }
    if (['doc', 'docx'].includes(t)) {
      return {
        icon: <FileText className="w-5 h-5 text-blue-600" />,
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        label: 'WORD'
      };
    }
    if (['ppt', 'pptx'].includes(t)) {
      return {
        icon: <Presentation className="w-5 h-5 text-amber-600" />,
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        label: 'PPT'
      };
    }
    return {
      icon: <File className="w-5 h-5 text-indigo-600" />,
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      label: t.toUpperCase() || 'DOC'
    };
  };

  const badge = getFileBadge(file.fileType);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between group">
      <div>
        {/* En-tête : Badge extension + Matière */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${badge.bg}`}>
            {badge.icon}
            <span>{badge.label}</span>
          </span>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium truncate max-w-[140px]">
            {file.subject}
          </span>
        </div>

        {/* Titre cliquable pour ouvrir les commentaires */}
        <h4
          onClick={() => onOpenComments && onOpenComments(file)}
          className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition line-clamp-2 mb-1 cursor-pointer"
          title={`${file.title} (cliquez pour ouvrir les commentaires)`}
        >
          {file.title}
        </h4>

        {/* Badge Chapitre si présent */}
        {file.chapter && (
          <div className="mb-2">
            <span className="inline-block text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-full">
              📑 {file.chapter}
            </span>
          </div>
        )}

        {/* Métadonnées */}
        <div className="space-y-1.5 text-xs text-slate-500 mb-4">
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{file.uploadedBy?.name || 'Inconnu'}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(file.createdAt).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>
            <span className="font-medium text-slate-500">{formatSize(file.fileSize)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 w-full">
        <a
          href={file.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          download
          className="flex-1 min-w-[110px] inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-600 text-indigo-700 hover:text-white rounded-xl text-xs font-semibold transition min-h-[42px]"
          title="Télécharger le fichier"
        >
          <Download className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">Télécharger</span>
        </a>

        <button
          type="button"
          onClick={() => onOpenComments && onOpenComments(file)}
          className="flex-1 min-w-[105px] inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl text-xs font-semibold transition min-h-[42px]"
          title="Voir et ajouter des commentaires"
        >
          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">Commenter</span>
        </button>

        {isOwner && (
          <button
            onClick={() => onDelete(file._id)}
            className="flex-shrink-0 p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition min-h-[42px] min-w-[42px] flex items-center justify-center"
            title="Supprimer mon fichier"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
