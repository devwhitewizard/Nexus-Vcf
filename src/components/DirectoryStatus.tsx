import React from 'react';
import { DirectoryStatusData } from '../types';
import { TrendingUp, Users, Clock, Database } from 'lucide-react';

interface DirectoryStatusProps {
  status: DirectoryStatusData;
}

export const DirectoryStatus: React.FC<DirectoryStatusProps> = ({ status }) => {
  const { totalContacts, remainingSlots, maxCapacity, percentageFilled, isFull } = status;

  return (
    <div id="counter" className="w-full max-w-4xl mx-auto glass-panel rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-card-glow relative overflow-hidden space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="p-2 rounded-xl bg-sky-50 border border-sky-200">
          <TrendingUp className="w-5 h-5 text-sky-600" />
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Directory Status</h3>
      </div>

      {/* 3 Metric Columns */}
      <div className="grid grid-cols-3 gap-4 text-center py-2">
        
        {/* Total Contacts */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center shadow-sm">
            <Users className="w-6 h-6 text-sky-600" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-500">Total Contacts</span>
          <span className="text-xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            {totalContacts.toLocaleString()} <span className="text-sm font-normal text-slate-400">/ {maxCapacity.toLocaleString()}</span>
          </span>
        </div>

        {/* Remaining Slots */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-sm">
            <Clock className="w-6 h-6 text-emerald-600" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-500">Remaining Slots</span>
          <span className={`text-xl sm:text-3xl font-extrabold font-mono tracking-tight ${isFull ? 'text-amber-600' : 'text-emerald-600'}`}>
            {remainingSlots.toLocaleString()}
          </span>
        </div>

        {/* Max Capacity */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-sm">
            <Database className="w-6 h-6 text-slate-500" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-slate-500">Max Capacity</span>
          <span className="text-xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            {maxCapacity.toLocaleString()}
          </span>
        </div>

      </div>

      {/* Full Width Progress Bar */}
      <div className="space-y-2 pt-2">
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isFull
                ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                : 'bg-gradient-to-r from-sky-400 via-cyan-400 to-emerald-400'
            }`}
            style={{ width: `${percentageFilled}%` }}
          ></div>
        </div>
        
        <div className="flex justify-end text-xs font-bold font-mono tracking-wider">
          <span className={isFull ? 'text-rose-600 font-extrabold' : 'text-sky-600'}>
            {percentageFilled}% {isFull ? 'FULL' : 'Full'}
          </span>
        </div>
      </div>

    </div>
  );
};
