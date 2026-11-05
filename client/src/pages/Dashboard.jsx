import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import CreateClassModal from '../components/CreateClassModal';
import JoinClassModal from '../components/JoinClassModal';
import api from '../services/api';
import { Plus, KeyRound, Users, Copy, Check, ArrowRight, BookOpen, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes');
      setClasses(res.data.data);
    } catch (err) {
      console.error('Erreur chargement des classes :', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCopyCode = (code, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleClassCreated = (newClass) => {
    setClasses((prev) => [newClass, ...prev]);
  };

  const handleClassJoined = (joinedClass) => {
    setClasses((prev) => [joinedClass, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* En-tête du tableau de bord */}
        <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl shadow-indigo-200/50 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Bonjour, {user?.name} 👋
            </h1>
            <p className="mt-2 text-indigo-100 text-sm sm:text-base max-w-xl">
              Retrouvez toutes vos classes et partagez facilement vos cours, fiches et devoirs avec vos camarades.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsJoinOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-2xl backdrop-blur-md transition border border-white/20"
            >
              <KeyRound className="w-4 h-4" />
              <span>Rejoindre avec un code</span>
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-700 hover:bg-indigo-50 text-sm font-semibold rounded-2xl shadow-md transition"
            >
              <Plus className="w-4 h-4" />
              <span>Créer une classe</span>
            </button>
          </div>
        </div>

        {/* Section Liste des classes */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Vos Classes ({classes.length})</span>
            </h2>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
              <span className="text-sm">Chargement de vos classes...</span>
            </div>
          ) : classes.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">
                Aucune classe enregistrée
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Vous ne faites partie d'aucune classe pour le moment. Rejoignez votre promo avec un code ou créez votre premier espace partagé !
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => setIsJoinOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition"
                >
                  Entrer un code
                </button>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition"
                >
                  Créer ma classe
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls) => (
                <div
                  key={cls._id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between group"
                >
                  <div>
                    {/* Header de la carte */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                        <Users className="w-3.5 h-3.5" />
                        <span>{cls.members?.length || 1} membre{(cls.members?.length || 1) > 1 ? 's' : ''}</span>
                      </span>

                      {/* Code badge avec bouton copier */}
                      <button
                        onClick={(e) => handleCopyCode(cls.code, e)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-mono font-bold transition"
                        title="Copier le code d'invitation"
                      >
                        <span>{cls.code}</span>
                        {copiedCode === cls.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </button>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition mb-2">
                      {cls.name}
                    </h3>
                    <p className="text-xs text-slate-400 mb-6">
                      Créée par {cls.createdBy?.name || 'Vous'}
                    </p>
                  </div>

                  {/* Bouton d'accès */}
                  <Link
                    to={`/classes/${cls._id}`}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 group-hover:bg-indigo-600 text-indigo-700 group-hover:text-white rounded-xl text-sm font-semibold transition"
                  >
                    <span>Consulter les fichiers</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Modales */}
      <CreateClassModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onClassCreated={handleClassCreated}
      />
      <JoinClassModal
        isOpen={isJoinOpen}
        onClose={() => setIsJoinOpen(false)}
        onClassJoined={handleClassJoined}
      />
    </div>
  );
}
