import React from 'react';
import { TypewriterText } from './TypewriterText';
import { ShieldCheck, Download } from 'lucide-react';

interface HeaderCardProps {
  contactCount: number;
}

export const HeaderCard: React.FC<HeaderCardProps> = ({ contactCount }) => {
  return (
    <div className="w-full glass-panel rounded-2xl p-6 sm:p-8 shadow-card-glow relative overflow-hidden border border-sky-100">
      {/* Subtle background accents */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-sky-100/60 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-6">

        {/* Brand Main Title */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            <span className="gradient-text drop-shadow-sm">NEXUS VCF</span>
          </h1>
          <div className="flex items-center justify-center pt-1">
            <TypewriterText words={['Nexus Tech', 'Nexus VCF', 'Nexus Projects']} />
          </div>
        </div>

        {/* Brief Description */}
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
          Submit your contact details to our directory and receive consolidated smartphone contact cards automatically!
        </p>

        {/* Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-slate-700 pt-2">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% Unique Normalized Numbers</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 border border-sky-200 text-sky-800">
            <Download className="w-4 h-4 text-sky-600 shrink-0" />
            <span>One-Click Smartphone Import</span>
          </div>
        </div>
      </div>
    </div>
  );
};
