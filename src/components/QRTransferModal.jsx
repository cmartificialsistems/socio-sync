import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import LZString from 'lz-string';
import { QrCode, Copy, Check, Share2, Smartphone, Zap, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QRTransferModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { partners, dailySchedule, meetings, topics, actionItems, ideas } = useApp();
  const [copied, setCopied] = useState(false);

  // Pack and compress current state
  const payload = {
    ts: Date.now(),
    partners,
    dailySchedule,
    meetings,
    topics,
    actionItems,
    ideas
  };

  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(payload));
  const baseUrl = window.location.origin + window.location.pathname;
  const syncUrl = `${baseUrl}?importData=${compressed}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(syncUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`👋 Hola Socio, aquí tienes el enlace actualizado para sincronizar nuestros datos de SocioSync:\n\n${syncUrl}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-[#E6E0D4] max-w-md w-full p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in duration-200">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#6E685F] hover:text-[#1C1B1A] bg-[#F5F2EB] hover:bg-[#EFEAE1] rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#D95338]/10 text-[#C84B31] rounded-2xl">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-extrabold text-[#1C1B1A]">Sincronizar Celular</h3>
            <p className="text-xs text-[#6E685F]">Transfiere todos los datos de tu PC al celular al instante</p>
          </div>
        </div>

        {/* QR Display */}
        <div className="flex flex-col items-center justify-center p-5 bg-[#F9F7F2] border border-[#E6E0D4] rounded-2xl space-y-3 text-center">
          <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-[#E6E0D4]">
            <QRCodeSVG value={syncUrl} size={180} level="M" />
          </div>
          <p className="text-xs text-[#1C1B1A] font-medium max-w-xs">
            Escanea este código QR con la cámara de tu celular para abrir SocioSync con <strong>todos tus datos actualizados</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#D95338] hover:bg-[#C84B31] text-white font-extrabold text-xs rounded-2xl shadow-xs transition-all"
          >
            {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Enlace copiado al portapapeles!' : 'Copiar Enlace Directo de Sincronización'}</span>
          </button>

          <button
            onClick={handleWhatsAppShare}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs rounded-2xl shadow-xs transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Enviar por WhatsApp a tu Socio</span>
          </button>
        </div>

        {/* Direct Peer Badge */}
        <div className="p-3 bg-[#2E5A44]/10 rounded-xl border border-[#2E5A44]/20 flex items-center gap-2 text-xs text-[#2E5A44] font-medium">
          <Zap className="w-4 h-4 shrink-0 text-[#2E5A44]" />
          <span>Al abrir el enlace o código QR en el celular, ambos dispositivos quedan guardados y sincronizados.</span>
        </div>

      </div>
    </div>
  );
};
