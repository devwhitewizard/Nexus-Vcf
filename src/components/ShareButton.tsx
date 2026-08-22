import React, { useState } from 'react';
import { Copy, Check, MessageCircle } from 'lucide-react';

export const ShareButton: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const siteUrl = window.location.origin;
  const shareMessage = `Join the official VCF contact list and get the final compiled VCF file when it's ready! Register your contact here: ${siteUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(siteUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  return (
    <div className="flex items-center gap-2.5">
      {/* WhatsApp Quick Share Button */}
      <a
        href={whatsappShareUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-3.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/40 transition-colors text-xs font-semibold flex items-center justify-center shrink-0"
        title="Share directly via WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-emerald-400 text-emerald-400" />
      </a>

      {/* Direct Copy Button */}
      <button
        onClick={handleCopyLink}
        className="p-3.5 rounded-xl bg-cmd-surface border border-cmd-border text-gray-300 hover:text-white hover:border-purple-400 transition-colors text-xs font-semibold flex items-center justify-center shrink-0"
        title="Copy Page Link"
      >
        {copied ? (
          <Check className="w-5 h-5 text-emerald-400" />
        ) : (
          <Copy className="w-5 h-5 text-purple-400" />
        )}
      </button>
    </div>
  );
};
