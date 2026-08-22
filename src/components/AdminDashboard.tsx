import React, { useState, useEffect } from 'react';
import { VcfContainer, VcfManagementStats, CreateVcfPayload } from '../types';
import {
  fetchAdminVcfs,
  createVcfContainer,
  adminLogout,
  downloadVcfContainerFile,
  fetchPublicConfig,
  updateAdminConfig,
} from '../lib/api';
import { VcfCard } from './VcfCard';
import { CreateVcfModal } from './CreateVcfModal';
import { VcfDetailsView } from './VcfDetailsView';
import {
  Layers,
  Plus,
  RefreshCw,
  LogOut,
  Search,
  CheckCircle,
  AlertCircle,
  Archive,
  Users,
  TrendingUp,
  Download,
  Filter,
  MessageSquare,
  Save,
  Settings,
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [vcfs, setVcfs] = useState<VcfContainer[]>([]);
  const [stats, setStats] = useState<VcfManagementStats>({
    totalVcfs: 0,
    activeVcfs: 0,
    fullVcfs: 0,
    archivedVcfs: 0,
    totalContacts: 0,
    availableCapacity: 0,
  });

  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'FULL' | 'ARCHIVED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Settings State
  const [groupUrlInput, setGroupUrlInput] = useState('');
  const [adminPhone1Input, setAdminPhone1Input] = useState('');
  const [adminPhone2Input, setAdminPhone2Input] = useState('');
  const [savingConfig, setSavingConfig] = useState(false);
  const [configMessage, setConfigMessage] = useState<string | null>(null);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Modals & Navigation
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedVcf, setSelectedVcf] = useState<VcfContainer | null>(null);

  const loadData = async (tab: string = activeTab, query: string = searchQuery) => {
    setLoading(true);
    const res = await fetchAdminVcfs(tab, query);
    setLoading(false);
    setVcfs(res.vcfs);
    setStats(res.stats);
  };

  const loadConfig = async () => {
    const cfg = await fetchPublicConfig();
    setGroupUrlInput(cfg.groupUrl);
    setAdminPhone1Input(cfg.adminPhone || '+254707848992');
    setAdminPhone2Input(cfg.adminPhone2 || '+254794171080');
  };

  useEffect(() => {
    loadData();
    loadConfig();
  }, []);

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    setConfigMessage(null);
    const res = await updateAdminConfig({
      groupUrl: groupUrlInput,
      adminPhone: adminPhone1Input,
      adminPhone2: adminPhone2Input,
    });
    setSavingConfig(false);
    if (res.success) {
      setConfigSuccess(true);
      setConfigMessage(res.message || 'WhatsApp Group Link and Admin Settings saved successfully!');
      setTimeout(() => setConfigMessage(null), 4000);
    } else {
      setConfigSuccess(false);
      setConfigMessage(res.error || 'Failed to save settings.');
    }
  };

  const handleTabChange = (tab: 'ALL' | 'ACTIVE' | 'FULL' | 'ARCHIVED') => {
    setActiveTab(tab);
    loadData(tab, searchQuery);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    loadData(activeTab, query);
  };

  const handleCreateSubmit = async (payload: CreateVcfPayload) => {
    const res = await createVcfContainer(payload);
    if (res.success) {
      loadData();
    }
    return res;
  };

  const handleLogoutClick = async () => {
    await adminLogout();
    onLogout();
  };

  const handleDownloadVcfFile = (vcf: VcfContainer) => {
    downloadVcfContainerFile(vcf.id, vcf.name);
  };

  // If viewing single VCF details
  if (selectedVcf) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <VcfDetailsView
          vcf={selectedVcf}
          onBack={() => {
            setSelectedVcf(null);
            loadData();
          }}
          onRefreshVcfs={loadData}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Header Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-card-glow flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-500 to-cyan-400 p-0.5 shadow-purple-glow shrink-0">
            <div className="w-full h-full bg-cmd-dark rounded-[14px] flex items-center justify-center">
              <Layers className="w-7 h-7 text-purple-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">VCF Management Dashboard</h2>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-900/60 text-purple-300 border border-purple-500/40">
                ADMIN SECURED
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Create & manage capacity-capped VCF containers. Auto-assigns contacts and locks containers when FULL.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 rounded-xl btn-purple text-xs font-bold flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Create VCF Container</span>
          </button>

          <button
            onClick={() => loadData()}
            disabled={loading}
            className="px-3.5 py-2.5 rounded-xl bg-cmd-surface border border-purple-500/30 text-purple-300 hover:text-white hover:border-purple-400 text-xs font-semibold flex items-center gap-2 transition-all"
            title="Refresh VCF Containers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleLogoutClick}
            className="px-4 py-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 hover:text-white hover:bg-rose-900/80 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>

      {/* SUMMARY STATS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        <div className="bg-cmd-surface border border-purple-500/30 rounded-2xl p-4 shadow-card-glow">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Total VCFs</span>
          <span className="text-2xl font-extrabold text-white font-mono mt-1 block">{stats.totalVcfs}</span>
          <span className="text-[10px] text-purple-400 mt-0.5 block">Managed Containers</span>
        </div>

        <div className="bg-cmd-surface border border-purple-500/30 rounded-2xl p-4 shadow-card-glow">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Active VCFs</span>
          <span className="text-2xl font-extrabold text-emerald-300 font-mono mt-1 block">{stats.activeVcfs}</span>
          <span className="text-[10px] text-emerald-400 mt-0.5 block">Accepting Registrations</span>
        </div>

        <div className="bg-cmd-surface border border-purple-500/30 rounded-2xl p-4 shadow-card-glow">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Full VCFs</span>
          <span className="text-2xl font-extrabold text-amber-300 font-mono mt-1 block">{stats.fullVcfs}</span>
          <span className="text-[10px] text-amber-400 mt-0.5 block">100% Capacity Reached</span>
        </div>

        <div className="bg-cmd-surface border border-purple-500/30 rounded-2xl p-4 shadow-card-glow">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Archived</span>
          <span className="text-2xl font-extrabold text-gray-300 font-mono mt-1 block">{stats.archivedVcfs}</span>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Offline / Archived</span>
        </div>

        <div className="bg-cmd-surface border border-purple-500/30 rounded-2xl p-4 shadow-card-glow">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Total Contacts</span>
          <span className="text-2xl font-extrabold text-cyan-300 font-mono mt-1 block">{stats.totalContacts.toLocaleString()}</span>
          <span className="text-[10px] text-cyan-400 mt-0.5 block">All Saved Participants</span>
        </div>

        <div className="bg-cmd-surface border border-purple-500/30 rounded-2xl p-4 shadow-card-glow">
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Available Slots</span>
          <span className="text-2xl font-extrabold text-purple-300 font-mono mt-1 block">{stats.availableCapacity.toLocaleString()}</span>
          <span className="text-[10px] text-purple-400 mt-0.5 block">Remaining Open Capacity</span>
        </div>

      </div>

      {/* WHATSAPP GROUP & SYSTEM CONFIGURATION PANEL */}
      <div className="glass-panel rounded-3xl p-6 border border-emerald-500/30 shadow-card-glow space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>WhatsApp Group & System Settings</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-emerald-300">
                  LIVE CONFIG
                </span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Set or update official WhatsApp group delivery link and support admin phone numbers.
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveConfig}
            disabled={savingConfig}
            className="px-5 py-2.5 rounded-xl btn-emerald text-xs font-bold flex items-center justify-center gap-2 shadow-lg shrink-0 transition-all"
          >
            {savingConfig ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Settings</span>
          </button>
        </div>

        {configMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn ${
              configSuccess
                ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/80 border border-rose-500/40 text-rose-300'
            }`}
          >
            {configSuccess ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{configMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-1">
          {/* Group URL */}
          <div className="space-y-1.5 lg:col-span-1">
            <label className="text-xs font-semibold text-gray-300 flex items-center justify-between">
              <span>Official WhatsApp Group URL</span>
              <a
                href={groupUrlInput}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-cyan-400 hover:underline"
              >
                Test Link ↗
              </a>
            </label>
            <input
              type="text"
              value={groupUrlInput}
              onChange={(e) => setGroupUrlInput(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input text-white focus:outline-none"
            />
          </div>

          {/* Admin 1 Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">
              Admin 1 Phone Number
            </label>
            <input
              type="text"
              value={adminPhone1Input}
              onChange={(e) => setAdminPhone1Input(e.target.value)}
              placeholder="+254707848992"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input text-white focus:outline-none font-mono"
            />
          </div>

          {/* Admin 2 Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">
              Admin 2 Phone Number
            </label>
            <input
              type="text"
              value={adminPhone2Input}
              onChange={(e) => setAdminPhone2Input(e.target.value)}
              placeholder="+254794171080"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl glass-input text-white focus:outline-none font-mono"
            />
          </div>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-cmd-surface border border-cmd-border overflow-x-auto">
          <button
            onClick={() => handleTabChange('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ALL'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All VCFs ({stats.totalVcfs})
          </button>
          <button
            onClick={() => handleTabChange('ACTIVE')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ACTIVE'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-gray-400 hover:text-emerald-300'
            }`}
          >
            Active ({stats.activeVcfs})
          </button>
          <button
            onClick={() => handleTabChange('FULL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'FULL'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-gray-400 hover:text-amber-300'
            }`}
          >
            Full ({stats.fullVcfs})
          </button>
          <button
            onClick={() => handleTabChange('ARCHIVED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'ARCHIVED'
                ? 'bg-gray-700 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Archived ({stats.archivedVcfs})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search VCF by name..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input text-white placeholder-gray-500 focus:outline-none"
          />
        </div>

      </div>

      {/* VCF CARDS GRID */}
      {vcfs.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-purple-400 mx-auto flex items-center justify-center">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No VCF Containers Found</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            No VCF container matches your filter criteria. Click below to create your first VCF container!
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl btn-purple text-xs font-bold inline-flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Create VCF Container</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vcfs.map((vcf) => (
            <VcfCard
              key={vcf.id}
              vcf={vcf}
              onManage={(targetVcf) => setSelectedVcf(targetVcf)}
              onDownloadVcf={handleDownloadVcfFile}
            />
          ))}
        </div>
      )}

      {/* CREATE VCF MODAL */}
      {isCreateModalOpen && (
        <CreateVcfModal
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSubmit}
        />
      )}

    </div>
  );
};
