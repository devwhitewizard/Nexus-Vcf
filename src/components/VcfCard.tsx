import React from 'react';
import { VcfContainer } from '../types';
import { Users, Layers, AlertCircle, CheckCircle, Archive, Calendar, ArrowRight, Download } from 'lucide-react';

interface VcfCardProps {
  vcf: VcfContainer;
  onManage: (vcf: VcfContainer) => void;
  onDownloadVcf: (vcf: VcfContainer) => void;
}

export const VcfCard: React.FC<VcfCardProps> = ({ vcf, onManage, onDownloadVcf }) => {
  const isFull = vcf.status === 'FULL' || vcf.current_count >= vcf.capacity;
  const isArchived = vcf.status === 'ARCHIVED';

  return (
    <div
      className={`glass-panel rounded-3xl p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden group ${
        isFull
          ? 'border-amber-500/50 shadow-amber-glow bg-amber-950/20'
          : isArchived
          ? 'border-gray-700/40 opacity-75'
          : 'border-purple-500/30 hover:border-purple-400/60 shadow-card-glow'
      }`}
    >
      {/* Background Accent Flares */}
      {isFull ? (
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/20 rounded-full blur-2xl pointer-events-none"></div>
      ) : (
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-purple-600/15 rounded-full blur-2xl pointer-events-none"></div>
      )}

      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          
          {/* Cover Thumbnail / Gradient Avatar */}
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-cmd-dark border border-purple-500/30 shrink-0 shadow-md flex items-center justify-center">
            {vcf.image_url ? (
              <img
                src={vcf.image_url}
                alt={vcf.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-purple-900 to-indigo-900 flex items-center justify-center">
                <Layers className="w-7 h-7 text-purple-300" />
              </div>
            )}
          </div>

          {/* Status Badge */}
          {isFull ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black tracking-wider shadow-md animate-pulse">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>FULL (100%)</span>
            </div>
          ) : isArchived ? (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-800/80 border border-gray-600/50 text-gray-300 text-xs font-semibold">
              <Archive className="w-3.5 h-3.5 text-gray-400" />
              <span>ARCHIVED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>ACTIVE</span>
            </div>
          )}

        </div>

        {/* Title & Description */}
        <h4 className="text-lg sm:text-xl font-extrabold text-white group-hover:text-purple-300 transition-colors truncate">
          {vcf.name}
        </h4>

        {/* Emoji Format Pill */}
        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-purple-300 bg-purple-950/40 border border-purple-500/25 px-2.5 py-0.5 rounded-lg w-fit">
          <span className="text-[10px] text-gray-400">VCF Format:</span>
          <span className="font-semibold font-mono text-emerald-300">
            {vcf.name_prefix ?? '🩸🩸 '}John Doe{vcf.name_suffix ?? ''}
          </span>
        </div>

        <p className="text-xs text-gray-400 mt-1 line-clamp-2 min-h-[2rem]">
          {vcf.description || 'No description provided for this container.'}
        </p>

        {/* Capacity Numbers & Progress Bar */}
        <div className="my-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-gray-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              Capacity
            </span>
            <span className="font-mono text-purple-300">
              {vcf.current_count.toLocaleString()} / {vcf.capacity.toLocaleString()} contacts
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-cmd-dark h-3 rounded-full overflow-hidden p-0.5 border border-purple-500/20">
            <div
              className={`h-full rounded-full transition-all duration-700 shadow-purple-glow ${
                isFull
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                  : 'bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-400'
              }`}
              style={{ width: `${vcf.percentage_filled}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5">
            <span>{vcf.remaining_capacity.toLocaleString()} slots remaining</span>
            <span className="font-bold text-white">{vcf.percentage_filled}% Filled</span>
          </div>
        </div>
      </div>

      {/* Footer Info & Manage Button */}
      <div className="pt-3 border-t border-cmd-border flex items-center justify-between gap-2">
        <span className="text-[10px] text-gray-400 flex items-center gap-1">
          <Calendar className="w-3 h-3 text-purple-400" />
          {new Date(vcf.created_at).toLocaleDateString()}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDownloadVcf(vcf)}
            className="p-2 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 hover:text-white hover:border-purple-400 transition-all"
            title="Download .VCF file for this container"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => onManage(vcf)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
              isFull
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'btn-purple'
            }`}
          >
            <span>{isFull ? 'View Details' : 'Manage'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
