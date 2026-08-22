import React from 'react';
import { TypewriterText } from './TypewriterText';
import { ShieldCheck, Download, Users, Sparkles } from 'lucide-react';

interface HeaderCardProps {
  contactCount: number;
}

export const HeaderCard: React.FC<HeaderCardProps> = ({ contactCount }) => {
  return (
    <div className="w-full glass-panel rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-purple-500/30">
      {/* Background glow effects */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-6">
  

        {/* Brand Main Title */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            <span className="gradient-text drop-shadow-lg">NEXUS VCF</span>
          </h1>
          <div className="flex items-center justify-center pt-1">
            <TypewriterText words={['Nexus Tech', 'Nexus VCF', 'Nexus Projects']} />
          </div>
        </div>

        {/* Brief Description */}
        <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Submit your contact details to our directory and receive consolidated smartphone contact cards automatically!
        </p>

        {/* Highlights */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-gray-300 pt-2">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cmd-surface/80 border border-cmd-border">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% Unique Normalized Numbers</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cmd-surface/80 border border-cmd-border">
            <Download className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>One-Click Smartphone Import</span>
          </div>
        </div>
      </div>
    </div>
  );
};
