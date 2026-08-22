import React from 'react';
import { MessageSquare, ArrowUpRight, Bell, FileText, ShieldCheck } from 'lucide-react';
import { ShareButton } from './ShareButton';

interface GroupJoinCardProps {
  groupUrl: string;
}

export const GroupJoinCard: React.FC<GroupJoinCardProps> = ({ groupUrl }) => {
  return (
    <div id="group-join" className="w-full max-w-4xl mx-auto my-10">
      <div className="relative glass-panel rounded-3xl p-6 sm:p-8 border border-cyan-500/30 overflow-hidden shadow-cyan-glow">
        
        {/* Ambient Gradient Flares */}
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 space-y-6">
          
          {/* Header Info Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold w-fit">
              <Bell className="w-3.5 h-3.5 animate-bounce text-cyan-400" />
              <span>Official Delivery Channel</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Official Community Link (Configured)</span>
            </div>
          </div>

          {/* Titles & Description */}
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Join the Official <span className="gradient-text">Nexus VCF Group</span>
            </h3>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-2xl">
              The compiled VCF contact file will be automatically dropped in the WhatsApp group. Join the official group and share with your network!
            </p>
          </div>

          {/* Integrated Action Buttons Bar */}
          <div className="p-4 rounded-2xl bg-cmd-dark/70 border border-purple-500/25 shadow-inner flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Main Join Group Button */}
            <a
              href={groupUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-6 py-3.5 rounded-xl btn-emerald font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg group hover:scale-[1.01] transition-transform"
            >
              <MessageSquare className="w-5 h-5 fill-current text-white" />
              <span>Join Official Group Now</span>
              <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* Share / Copy Quick Icon Buttons */}
            <div className="flex items-center justify-center shrink-0">
              <ShareButton />
            </div>

          </div>

          {/* Benefit Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-2.5 text-xs text-gray-300 bg-cmd-dark/50 p-3 rounded-xl border border-cmd-border/60">
              <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Instant .VCF Import File</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-300 bg-cmd-dark/50 p-3 rounded-xl border border-cmd-border/60">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Verified Clean Contacts Only</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
