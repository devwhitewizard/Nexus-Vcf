import React from 'react';
import { MessageSquare, ArrowUpRight, Bell, FileText, ShieldCheck } from 'lucide-react';
import { ShareButton } from './ShareButton';

interface GroupJoinCardProps {
  groupUrl: string;
}

const DEFAULT_GROUP_URL = 'https://chat.whatsapp.com/CtjtkaQ1zCw4atCHSiFBQwhtt';

export const GroupJoinCard: React.FC<GroupJoinCardProps> = ({ groupUrl }) => {
  const getFormattedUrl = (rawUrl?: string): string => {
    if (!rawUrl || !rawUrl.trim()) return DEFAULT_GROUP_URL;
    let trimmed = rawUrl.trim();
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      trimmed = `https://${trimmed}`;
    }
    if (trimmed.includes('vercel.app') || (!trimmed.includes('chat.whatsapp.com') && !trimmed.includes('wa.me'))) {
      return DEFAULT_GROUP_URL;
    }
    return trimmed;
  };

  const finalUrl = getFormattedUrl(groupUrl);

  return (
    <div id="group-join" className="w-full max-w-4xl mx-auto my-10">
      <div className="relative glass-panel rounded-3xl p-6 sm:p-8 border border-emerald-100 overflow-hidden shadow-emerald-glow">
        
        {/* Ambient Gradient Flares */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-sky-100/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          
          {/* Header Info Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold w-fit">
              <Bell className="w-3.5 h-3.5 animate-bounce text-emerald-600" />
              <span>Official Delivery Channel</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Official Community Link (Configured)</span>
            </div>
          </div>

          {/* Titles & Description */}
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Join the Official <span className="gradient-text">Nexus VCF Group</span>
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl font-medium">
              The compiled VCF contact file will be automatically dropped in the WhatsApp group. Join the official group and share with your network!
            </p>
          </div>

          {/* Integrated Action Buttons Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Main Join Group Button */}
            <a
              href={finalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3.5 rounded-xl btn-emerald font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg group hover:scale-[1.01] transition-transform"
            >
              <MessageSquare className="w-5 h-5 fill-current text-white" />
              <span>Join Official Group Now</span>
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* Share Button */}
            <div className="flex items-center justify-center shrink-0">
              <ShareButton groupUrl={finalUrl} />
            </div>

          </div>

          {/* Benefit Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium bg-sky-50 p-3 rounded-xl border border-sky-200">
              <FileText className="w-4 h-4 text-sky-600 shrink-0" />
              <span>Instant .VCF Import File</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-600 font-medium bg-emerald-50 p-3 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified Clean Contacts Only</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
