import React from 'react';
import { Users, TrendingUp, Sparkles, CheckCircle } from 'lucide-react';

interface ContactCounterProps {
  count: number;
}

export const ContactCounter: React.FC<ContactCounterProps> = ({ count }) => {
  // Target release batch goal e.g. 500 or next 100 milestone
  const milestoneTarget = Math.max(500, Math.ceil((count + 1) / 100) * 100);
  const progressPercent = Math.min(100, Math.round((count / milestoneTarget) * 100));

  return (
    <div id="counter" className="w-full max-w-4xl mx-auto my-10">
      <div className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        
        {/* Background glow effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          
          {/* Left Column: Big Counter Display */}
          <div className="text-center md:text-left space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Live Community Counter
            </div>
            
            <div className="flex items-baseline justify-center md:justify-start gap-3">
              <span className="text-4xl sm:text-6xl font-black tracking-tight text-white font-mono drop-shadow-md">
                {count.toLocaleString()}
              </span>
              <span className="text-lg sm:text-2xl font-bold gradient-text">
                Participants Registered
              </span>
            </div>

            <p className="text-xs sm:text-sm text-gray-400 max-w-md">
              People from across multiple countries have added their contact details. The final combined VCF file will be released once target maturity is reached.
            </p>
          </div>

          {/* Right Column: Goal Milestone Card */}
          <div className="w-full md:w-80 bg-cmd-dark/70 rounded-2xl p-4 border border-cmd-border space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                VCF File Target
              </span>
              <span className="text-purple-400 font-mono">{count} / {milestoneTarget}</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-cmd-surface h-3 rounded-full overflow-hidden p-0.5 border border-purple-500/20">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400 transition-all duration-700 shadow-purple-glow"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <CheckCircle className="w-3 h-3" /> Auto Sync Ready
              </span>
              <span className="text-purple-300 font-semibold">{progressPercent}% Achieved</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
