import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import LZString from 'lz-string';
import { QrCode, Copy, Check, Share2, Smartphone, Zap, X, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const QRTransferModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { workspaceId, partners, dailySchedule, meetings, topics, actionItems, ideas, workspacePin } = useApp();
  const [copied, setCopied] = useState(false);

  // Pack and compress current state for this specific workspace
  const payload = {
    ts: Date.now(),
    workspaceId,
    pin: workspacePin || '',
    partners,
    dailySchedule,
    meetings,
    topics,
    actionItems,
    ideas
  };

  const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(payload));
  const baseUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://socio-sync-three.vercel.app/';
  const syncUrl = `${baseUrl}?workspaceId=${encodeURIComponent(workspaceId)}&importData=${compressed}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(syncUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = syncUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch(e) {
      alert('Copia este enlace de la barra de direcciones.');
    }
  };

  const handleWhatsAppShare = () => {
    const shareText = `👋 Hola Socio, aquí tienes el enlace de sincronización en tiempo real para nuestra sesión de SocioSync (${workspaceId.toUpperCase()}):\n\n${syncUrl}`;
    const encodedText = encodeURIComponent(shareText);
    window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `SocioSync - ${workspaceId.toUpperCase()}`,
          text: `👋 Hola Socio, ingresa a nuestra sesión de SocioSync (${workspaceId.toUpperCase()}):`,
          url: syncUrl
        });
        return;
      } catch (e) {
        console.warn('Native share cancelled:', e);
      }
    }
    handleWhatsAppShare();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#E6E0D4] max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 relative animate-in fade-in zoom-in duration-200 my-auto max-h-[90vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#6E685F] hover:text-[#1C1B1A] bg-[#F5F2EB] hover:bg-[#EFEAE1] rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pr-8">
          <div className="p-3 bg-[#D95338]/10 text-[#C84B31] rounded-2xl shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display text-lg font-extrabold text-[#1C1B1A]">Código QR y Enlace de Sincronización</h3>
            <p className="text-xs text-[#6E685F]">Transfiere todos tus datos al celular en 1 segundo</p>
          </div>
        </div>

        {/* QR Display */}
        <div className="flex flex-col items-center justify-center p-4 bg-[#F9F7F2] border border-[#E6E0D4] rounded-2xl space-y-3 text-center">
          <div className="bg-white p-3 rounded-2xl shadow-md border border-[#E6E0D4] inline-block">
            <QRCodeSVG value={syncUrl} size={180} level="M" />
          </div>
          <p className="text-xs text-[#1C1B1A] font-bold max-w-xs">
            Escanea este código QR con la cámara de tu celular para abrir la sesión <span className="text-[#D95338] capitalize">{workspaceId}</span>.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleNativeShare}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#20bd5a] text-white font-extrabold text-xs rounded-2xl shadow-md shadow-[#25D366]/20 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Compartir por WhatsApp / Celular</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#F5F2EB] hover:bg-[#EFEAE1] text-[#1C1B1A] border border-[#E6E0D4] font-bold text-xs rounded-2xl transition-all cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-[#2E5A44]" /> : <Copy className="w-4 h-4 text-[#D95338]" />}
            <span>{copied ? '¡Enlace copiado al portapapeles!' : 'Copiar Enlace de Sincronización'}</span>
          </button>
        </div>

        {/* Info Badge */}
        <div className="p-3 bg-[#2E5A44]/10 rounded-xl border border-[#2E5A44]/20 flex items-center gap-2 text-xs text-[#2E5A44] font-medium">
          <Zap className="w-4 h-4 shrink-0 text-[#2E5A44]" />
          <span>Al abrir el enlace o escanear el QR, tus datos se guardan y sincronizan automáticamente.</span>
        </div>

      </div>
    </div>
  );
};
