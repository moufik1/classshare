import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AvatarAdjusterModal from '../components/AvatarAdjusterModal';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ArrowLeft,
  Camera,
  User,
  Mail,
  Lock,
  Calendar,
  BookOpen,
  Check,
  AlertCircle,
  Loader2,
  Save
} from 'lucide-react';

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Gestion de l'avatar et du recadrage
  const [rawImageSrc, setRawImageSrc] = useState(null);
  const [croppedFile, setCroppedFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl || '');
  const [isAdjusterOpen, setIsAdjusterOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);

  // Déclencher la sélection d'un fichier image
  const handleAvatarFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrorMessage('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setRawImageSrc(reader.result);
        setIsAdjusterOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Callback lorsque le recadrage est validé
  const handleCropComplete = (file, previewUrl) => {
    setCroppedFile(file);
    setAvatarPreview(previewUrl);
    setSuccessMessage('Photo recadrée. Cliquez sur "Enregistrer les modifications" pour valider.');
  };

  // Soumission du formulaire de mise à jour du profil
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword) {
      if (newPassword.length < 6) {
        setErrorMessage('Le nouveau mot de passe doit comporter au moins 6 caractères.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('Les nouveaux mots de passe ne correspondent pas.');
        return;
      }
      if (!currentPassword) {
        setErrorMessage('Veuillez renseigner votre mot de passe actuel.');
        return;
      }
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('email', email.trim().toLowerCase());

      if (croppedFile) {
        formData.append('avatar', croppedFile);
      }

      if (newPassword && currentPassword) {
        formData.append('currentPassword', currentPassword);
        formData.append('newPassword', newPassword);
      }

      const res = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Mise à jour de l'état global et du localStorage
      updateUser(res.data.data);
      setSuccessMessage('Votre profil a été mis à jour avec succès !');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setCroppedFile(null);
    } catch (err) {
      console.error('Erreur mise à jour profil :', err);
      setErrorMessage(err.response?.data?.message || 'Erreur lors de la mise à jour de votre profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation retour */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour au tableau de bord</span>
        </Link>

        {/* Messages d'état */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in">
            <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center gap-3 text-sm animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Colonne gauche : Carte Avatar & Statuts */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col items-center text-center">
              {/* Photo de profil avec bouton d'upload */}
              <div className="relative mb-4 group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-indigo-100 shadow-md bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-3xl font-extrabold">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt={user?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
                  )}
                </div>

                {/* Bouton déclencheur caméra */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg border-2 border-white transition min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                  title="Changer la photo de profil"
                >
                  <Camera className="w-4 h-4" />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarFileSelect}
                />
              </div>

              <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-full">{user?.email}</p>

              <div className="w-full border-t border-slate-100 mt-6 pt-6 space-y-3 text-left">
                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <BookOpen className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>
                    <strong className="text-slate-800">{user?.classes?.length || 0}</strong> classe(s) inscrite(s)
                  </span>
                </div>

                <div className="flex items-center gap-2.5 text-xs text-slate-600">
                  <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>
                    Membre depuis le{' '}
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
                          month: 'long',
                          year: 'numeric'
                        })
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite : Formulaire de modification */}
          <div className="md:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Bloc 1 : Informations de base */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Informations personnelles</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Nom complet
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Adresse email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bloc 2 : Sécurité & Mot de passe */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-2 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>Sécurité & Mot de passe</span>
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Laissez ces champs vides si vous ne souhaitez pas modifier votre mot de passe.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Mot de passe actuel
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition min-h-[44px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Nouveau mot de passe
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Confirmer le mot de passe
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bouton de sauvegarde */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-indigo-200 transition min-h-[48px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enregistrement en cours...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Enregistrer les modifications</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Modale d'ajustement / recadrage de l'avatar */}
      <AvatarAdjusterModal
        isOpen={isAdjusterOpen}
        imageSrc={rawImageSrc}
        onClose={() => setIsAdjusterOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
