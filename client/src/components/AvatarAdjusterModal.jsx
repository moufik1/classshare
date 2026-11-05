import { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Check, Move } from 'lucide-react';

export default function AvatarAdjusterModal({ isOpen, imageSrc, onClose, onCropComplete }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (imageSrc) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
      img.onload = () => {
        imageRef.current = img;
        setZoom(1);
        setRotation(0);
        setOffset({ x: 0, y: 0 });
      };
    }
  }, [imageSrc]);

  if (!isOpen || !imageSrc) return null;

  // Gestion du glisser-déposer (mouse / touch) pour centrer l'avatar
  const handlePointerDown = (e) => {
    setIsDragging(true);
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    setDragStart({ x: clientX - offset.x, y: clientY - offset.y });
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
    setOffset({
      x: clientX - dragStart.x,
      y: clientY - dragStart.y
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Génération du rendu final sur Canvas en format 400x400
  const handleConfirmCrop = () => {
    const img = imageRef.current;
    if (!img) return;

    const exportSize = 400;
    const canvas = document.createElement('canvas');
    canvas.width = exportSize;
    canvas.height = exportSize;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, exportSize, exportSize);

    // Déplacement au centre du canvas
    ctx.translate(exportSize / 2, exportSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    // Calcul de l'échelle relative
    const minDimension = Math.min(img.width, img.height);
    const baseScale = (exportSize / minDimension) * zoom;

    ctx.drawImage(
      img,
      offset.x * (exportSize / 256) - (img.width * baseScale) / 2,
      offset.y * (exportSize / 256) - (img.height * baseScale) / 2,
      img.width * baseScale,
      img.height * baseScale
    );

    // Conversion en Blob
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        onCropComplete(file, URL.createObjectURL(blob));
        onClose();
      }
    }, 'image/jpeg', 0.92);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 flex flex-col items-center">
        {/* En-tête */}
        <div className="w-full flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Ajuster votre photo</h3>
            <p className="text-xs text-slate-400">Glissez pour recentrer et utilisez le zoom</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zone de prévisualisation circulaire avec masque */}
        <div
          className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-indigo-600 shadow-inner bg-slate-100 cursor-grab active:cursor-grabbing select-none touch-none mb-6 flex items-center justify-center"
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        >
          {imageSrc && (
            <img
              src={imageSrc}
              alt="Aperçu recadrage"
              className="max-w-none pointer-events-none transition-transform duration-75"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
                transformOrigin: 'center center'
              }}
            />
          )}

          {/* Grille discrète d'alignement */}
          <div className="absolute inset-0 pointer-events-none border border-white/30 rounded-full flex items-center justify-center">
            <div className="w-full h-[1px] bg-white/20"></div>
            <div className="h-full w-[1px] bg-white/20 absolute"></div>
          </div>
        </div>

        {/* Contrôles d'ajustement */}
        <div className="w-full space-y-4 mb-6">
          {/* Zoom */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
              <span className="flex items-center gap-1">
                <ZoomIn className="w-3.5 h-3.5 text-indigo-600" /> Zoom
              </span>
              <span>{Math.round(zoom * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="3"
              step="0.05"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          {/* Boutons Rotation & Recentrage */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Pivoter (90°)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setOffset({ x: 0, y: 0 });
                setZoom(1);
                setRotation(0);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              <Move className="w-3.5 h-3.5" />
              <span>Réinitialiser</span>
            </button>
          </div>
        </div>

        {/* Actions de validation */}
        <div className="w-full flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirmCrop}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 transition"
          >
            <Check className="w-4 h-4" />
            <span>Valider le recadrage</span>
          </button>
        </div>
      </div>
    </div>
  );
}
