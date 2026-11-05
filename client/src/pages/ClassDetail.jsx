import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FileCard from '../components/FileCard';
import UploadFileModal from '../components/UploadFileModal';
import CommentsSection from '../components/CommentsSection';
import api from '../services/api';
import {
  ArrowLeft,
  UploadCloud,
  Users,
  Copy,
  Check,
  Search,
  Filter,
  FileQuestion,
  Loader2,
  BookOpen
} from 'lucide-react';

export default function ClassDetail() {
  const { classId } = useParams();
  const [classInfo, setClassInfo] = useState(null);
  const [files, setFiles] = useState([]);
  const [availableSubjects, setAvailableSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeFileForComments, setActiveFileForComments] = useState(null);

  // Charger les informations de la classe
  const fetchClassInfo = async () => {
    try {
      const res = await api.get(`/classes/${classId}`);
      setClassInfo(res.data.data);
    } catch (err) {
      console.error('Erreur chargement classe :', err);
    }
  };

  // Charger les fichiers avec filtre optionnel par matière
  const fetchFiles = async () => {
    try {
      const params = {};
      if (selectedSubject) params.subject = selectedSubject;
      const res = await api.get(`/files/class/${classId}`, { params });
      setFiles(res.data.data);
      if (res.data.availableSubjects) {
        setAvailableSubjects(res.data.availableSubjects);
      }
    } catch (err) {
      console.error('Erreur chargement fichiers :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassInfo();
  }, [classId]);

  useEffect(() => {
    fetchFiles();
  }, [classId, selectedSubject]);

  const handleCopyCode = () => {
    if (classInfo?.code) {
      navigator.clipboard.writeText(classInfo.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleFileUploaded = (newFile) => {
    setFiles((prev) => [newFile, ...prev]);
    // Ajouter la matière si elle n'existait pas encore
    if (!availableSubjects.includes(newFile.subject)) {
      setAvailableSubjects((prev) => [...prev, newFile.subject]);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer définitivement ce fichier ?')) {
      return;
    }

    try {
      await api.delete(`/files/${fileId}`);
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  // Filtre local additionnel par titre avec la barre de recherche
  const filteredFiles = files.filter((f) =>
    f.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Vérifier si des fichiers ont des chapitres renseignés
  const hasChapters = filteredFiles.some((f) => f.chapter && f.chapter.trim() !== '');

  // Regroupement par chapitres
  const groupedByChapter = filteredFiles.reduce((acc, file) => {
    const chapterName = file.chapter && file.chapter.trim() !== '' ? file.chapter.trim() : 'Autres documents';
    if (!acc[chapterName]) {
      acc[chapterName] = [];
    }
    acc[chapterName].push(file);
    return acc;
  }, {});

  // Trier les chapitres pour placer 'Autres documents' à la fin
  const sortedChapterNames = Object.keys(groupedByChapter).sort((a, b) => {
    if (a === 'Autres documents') return 1;
    if (b === 'Autres documents') return -1;
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation retour */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à mes classes</span>
        </Link>

        {/* En-tête de la classe */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {classInfo?.name || 'Chargement...'}
              </h1>

              {classInfo?.code && (
                <button
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-mono font-bold transition"
                  title="Copier le code pour inviter des élèves"
                >
                  <span>Code : {classInfo.code}</span>
                  {copiedCode ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                </button>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />
                {classInfo?.members?.length || 1} membre{(classInfo?.members?.length || 1) > 1 ? 's' : ''}
              </span>
              <span>•</span>
              <span>Créé par {classInfo?.createdBy?.name || 'Inconnu'}</span>
            </div>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-indigo-200 transition"
          >
            <UploadCloud className="w-5 h-5" />
            <span>Partager un document</span>
          </button>
        </div>

        {/* Barre d'outils : Recherche & Filtre par Matière */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Recherche textuelle */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher par titre de fichier..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Filtres par matière */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <button
              onClick={() => setSelectedSubject('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedSubject === ''
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Toutes les matières
            </button>
            {availableSubjects.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedSubject === sub
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Grille des fichiers */}
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <span className="text-sm">Chargement des documents...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FileQuestion className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                Aucun document trouvé
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {selectedSubject || searchQuery
                  ? 'Aucun document ne correspond à vos critères de recherche.'
                  : 'Aucun cours ni document n’a encore été partagé dans cette classe.'}
              </p>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Publier le premier cours</span>
              </button>
            </div>
          ) : hasChapters ? (
            /* Affichage structuré regroupé par chapitres */
            <div className="space-y-10">
              {sortedChapterNames.map((chapterName) => (
                <section key={chapterName} className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shadow-xs">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        {chapterName}
                      </h2>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {groupedByChapter[chapterName].length} doc{groupedByChapter[chapterName].length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {groupedByChapter[chapterName].map((file) => (
                      <FileCard
                        key={file._id}
                        file={file}
                        onDelete={handleDeleteFile}
                        onOpenComments={(f) => setActiveFileForComments(f)}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            /* Affichage en grille classique si aucun chapitre n'est renseigné */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredFiles.map((file) => (
                <FileCard
                  key={file._id}
                  file={file}
                  onDelete={handleDeleteFile}
                  onOpenComments={(f) => setActiveFileForComments(f)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modale d'upload */}
      <UploadFileModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        classId={classId}
        availableSubjects={availableSubjects}
        onFileUploaded={handleFileUploaded}
      />

      {/* Volet latéral des commentaires */}
      {activeFileForComments && (
        <CommentsSection
          file={activeFileForComments}
          onClose={() => setActiveFileForComments(null)}
        />
      )}
    </div>
  );
}
