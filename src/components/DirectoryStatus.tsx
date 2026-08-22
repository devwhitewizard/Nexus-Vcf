import React from 'react';
import { DirectoryStatusData } from '../types';
import { TrendingUp, Users, Clock, Database } from 'lucide-react';

interface DirectoryStatusProps {
  status: DirectoryStatusData;
}

export const DirectoryStatus: React.FC<DirectoryStatusProps> = ({ status }) => {
  const { totalContacts, remainingSlots, maxCapacity, percentageFilled, isFull } = status;

  return (
    <div id="counter" className="w-full max-w-4xl mx-auto glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-card-glow relative overflow-hidden space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <TrendingUp className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Directory Status</h3>
      </div>

      {/* 3 Metric Columns */}
      <div className="grid grid-cols-3 gap-4 text-center py-2">
        
        {/* Total Contacts */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-purple-300 flex items-center justify-center shadow-md">
            <Users className="w-6 h-6 text-purple-400" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-gray-400">Total Contacts</span>
          <span className="text-xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            {totalContacts.toLocaleString()} <span className="text-sm font-normal text-gray-400">/ {maxCapacity.toLocaleString()}</span>
          </span>
        </div>

        {/* Remaining Slots */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-purple-300 flex items-center justify-center shadow-md">
            <Clock className="w-6 h-6 text-indigo-400" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-gray-400">Remaining Slots</span>
          <span className={`text-xl sm:text-3xl font-extrabold font-mono tracking-tight ${isFull ? 'text-amber-400' : 'text-cyan-300'}`}>
            {remainingSlots.toLocaleString()}
          </span>
        </div>

        {/* Max Capacity */}
        <div className="flex flex-col items-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-purple-300 flex items-center justify-center shadow-md">
            <Database className="w-6 h-6 text-purple-400" />
          </div>
          <span className="text-xs sm:text-sm font-semibold text-gray-400">Max Capacity</span>
          <span className="text-xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
            {maxCapacity.toLocaleString()}
          </span>
        </div>

      </div>

      {/* Full Width Progress Bar */}
      <div className="space-y-2 pt-2">
        <div className="w-full bg-cmd-dark h-3 rounded-full overflow-hidden p-0.5 border border-purple-500/20 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isFull
                ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                : 'bg-gradient-to-r from-purple-600 via-violet-500 to-cyan-400'
            }`}
            style={{ width: `${percentageFilled}%` }}
          ></div>
        </div>
        
        <div className="flex justify-end text-xs font-bold font-mono tracking-wider text-gray-400">
          <span className={isFull ? 'text-rose-400 font-extrabold' : 'text-purple-300'}>
            {percentageFilled}% {isFull ? 'FULL' : 'Full'}
          </span>
        </div>
      </div>

    </div>
  );
};
