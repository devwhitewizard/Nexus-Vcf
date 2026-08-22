import React from 'react';
import { AdminStatsData } from '../types';
import { Users, Calendar, Clock, ShieldAlert, TrendingUp } from 'lucide-react';

interface AdminStatsProps {
  stats: AdminStatsData | null;
}

export const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  const total = stats?.totalContacts ?? 0;
  const today = stats?.todayCount ?? 0;
  const week = stats?.weekCount ?? 0;
  const duplicates = stats?.duplicateAttempts ?? 0;
  const latestDate = stats?.latestRegistration
    ? new Date(stats.latestRegistration).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'None';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 my-6">
      
      {/* Total Contacts Card */}
      <div className="bg-cmd-surface border border-purple-500/30 rounded-2xl p-4 shadow-card-glow relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Contacts</span>
          <div className="p-2 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-500/20">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{total.toLocaleString()}</span>
          <span className="block text-[10px] text-emerald-400 mt-0.5">Active Database Records</span>
        </div>
      </div>

      {/* Today Registrations */}
      <div className="bg-cmd-surface border border-purple-500/30 rounded-2xl p-4 shadow-card-glow relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Registered Today</span>
          <div className="p-2 rounded-xl bg-cyan-950/60 text-cyan-400 border border-cyan-500/20">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-cyan-300 font-mono">+{today}</span>
          <span className="block text-[10px] text-gray-400 mt-0.5">Last 24 Hours</span>
        </div>
      </div>

      {/* This Week Registrations */}
      <div className="bg-cmd-surface border border-purple-500/30 rounded-2xl p-4 shadow-card-glow relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Registered This Week</span>
          <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-300 font-mono">+{week}</span>
          <span className="block text-[10px] text-gray-400 mt-0.5">Current Week Period</span>
        </div>
      </div>

      {/* Latest Registration */}
      <div className="bg-cmd-surface border border-purple-500/30 rounded-2xl p-4 shadow-card-glow relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Latest Activity</span>
          <div className="p-2 rounded-xl bg-violet-950/60 text-violet-400 border border-violet-500/20">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-xl sm:text-2xl font-bold text-violet-200 font-mono truncate block">{latestDate}</span>
          <span className="block text-[10px] text-gray-400 mt-0.5">Most Recent Submission</span>
        </div>
      </div>

      {/* Duplicate Attempts Tracked */}
      <div className="bg-cmd-surface border border-purple-500/30 rounded-2xl p-4 shadow-card-glow relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Duplicates Blocked</span>
          <div className="p-2 rounded-xl bg-amber-950/60 text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-300 font-mono">{duplicates}</span>
          <span className="block text-[10px] text-amber-400/80 mt-0.5">DB Unique Protection Enforced</span>
        </div>
      </div>

    </div>
  );
};
