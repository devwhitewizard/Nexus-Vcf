import React, { useState } from 'react';
import { Copy, Check, MessageCircle } from 'lucide-react';

const DEFAULT_GROUP_URL = 'https://chat.whatsapp.com/DCsD3lqaanU7vPJ3qMDq14?s=cl&p=a&ilr=0';

interface ShareButtonProps {
  groupUrl?: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ groupUrl }) => {
  const [copied, setCopied] = useState(false);

  const getCleanGroupUrl = (rawUrl?: string): string => {
    if (!rawUrl || !rawUrl.trim()) return DEFAULT_GROUP_URL;
    let trimmed = rawUrl.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      trimmed = `https://${trimmed}`;
    }
    if (trimmed.includes('vercel.app') || trimmed.includes('CtjtkaQ1zCw4atCHSiFBQwhtt') || trimmed.includes('Jk88X19Kls92K109s8')) {
      return DEFAULT_GROUP_URL;
    }
    return trimmed;
  };

  const targetUrl = getCleanGroupUrl(groupUrl);
  const shareMessage = `Join the official Nexus VCF WhatsApp group to receive the compiled contact directory file! Join here: ${targetUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(targetUrl).then(() => {
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
        title="Share official WhatsApp group link directly"
      >
        <MessageCircle className="w-5 h-5 fill-emerald-400 text-emerald-400" />
      </a>

      {/* Direct Copy Button */}
      <button
        onClick={handleCopyLink}
        className="p-3.5 rounded-xl bg-cmd-surface border border-cmd-border text-gray-300 hover:text-white hover:border-purple-400 transition-colors text-xs font-semibold flex items-center justify-center shrink-0"
        title="Copy Official WhatsApp Group Link"
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
