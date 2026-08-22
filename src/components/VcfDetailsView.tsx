import React, { useState, useEffect } from 'react';
import { VcfContainer, Contact, UpdateVcfPayload, RegistrationPayload } from '../types';
import { fetchVcfDetails, updateVcfContainer, archiveVcfContainer, deleteVcfContainer, downloadVcfContainerFile, toggleContactGlobalStatus, updateContact, deleteContact } from '../lib/api';
import { CountrySelector } from './CountrySelector';
import { getCountryByCode, COUNTRIES } from '../lib/countries';
import {
  ArrowLeft,
  Users,
  Layers,
  Edit2,
  Archive,
  Download,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  Calendar,
  Check,
  X,
  Loader2,
  Globe,
} from 'lucide-react';

interface VcfDetailsViewProps {
  vcf: VcfContainer;
  onBack: () => void;
  onRefreshVcfs: () => void;
}

export const VcfDetailsView: React.FC<VcfDetailsViewProps> = ({ vcf: initialVcf, onBack, onRefreshVcfs }) => {
  const [vcf, setVcf] = useState<VcfContainer>(initialVcf);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(vcf.name);
  const [editCapacity, setEditCapacity] = useState<number>(vcf.capacity);
  const [editDescription, setEditDescription] = useState(vcf.description || '');
  const [editImageUrl, setEditImageUrl] = useState(vcf.image_url || '');
  const [editNamePrefix, setEditNamePrefix] = useState(vcf.name_prefix ?? '🩸🩸 ');
  const [editNameSuffix, setEditNameSuffix] = useState(vcf.name_suffix ?? '');
  const [editError, setEditError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // VCF Delete Modal State
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Contact Edit Modal State
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editContactName, setEditContactName] = useState('');
  const [editContactPhone, setEditContactPhone] = useState('');
  const [editContactCountry, setEditContactCountry] = useState(COUNTRIES[0]);
  const [editContactError, setEditContactError] = useState<string | null>(null);
  const [savingContact, setSavingContact] = useState(false);

  // Contact Delete Modal State
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const [deletingContactLoading, setDeletingContactLoading] = useState(false);

  const EMOJI_PRESETS = ['🩸🩸 ', '👑 ', '🔥 ', '🚀 ', '⭐ ', '💎 ', '💼 ', '📌 ', '⚡ '];

  const loadData = async (query: string = searchQuery) => {
    setLoading(true);
    const res = await fetchVcfDetails(vcf.id, query);
    setLoading(false);
    if (res.success && res.vcf) {
      setVcf(res.vcf);
      setContacts(res.contacts || []);
    }
  };

  useEffect(() => {
    loadData();
  }, [vcf.id]);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    loadData(val);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError(null);

    if (editCapacity < vcf.current_count) {
      setEditError(`Capacity cannot be reduced below the current contact count (${vcf.current_count}).`);
      return;
    }

    setUpdating(true);
    const payload: UpdateVcfPayload = {
      name: editName.trim(),
      capacity: editCapacity,
      description: editDescription.trim() || null,
      imageUrl: editImageUrl.trim() || null,
      namePrefix: editNamePrefix !== undefined ? editNamePrefix : null,
      nameSuffix: editNameSuffix !== undefined ? editNameSuffix : null,
    };

    const res = await updateVcfContainer(vcf.id, payload);
    setUpdating(false);

    if (res.success && res.vcf) {
      setVcf(res.vcf);
      setIsEditing(false);
      onRefreshVcfs();
    } else {
      setEditError(res.error || 'Failed to update VCF container.');
    }
  };

  const handleArchiveToggle = async () => {
    const res = await archiveVcfContainer(vcf.id);
    if (res.success && res.vcf) {
      setVcf(res.vcf);
      onRefreshVcfs();
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    const res = await deleteVcfContainer(vcf.id);
    setDeleting(false);
    if (res.success) {
      onRefreshVcfs();
      onBack();
    }
  };

  const handleDownloadVcf = () => {
    downloadVcfContainerFile(vcf.id, vcf.name);
  };

  const handleToggleGlobal = async (contactId: string, currentStatus: boolean) => {
    const res = await toggleContactGlobalStatus(contactId, !currentStatus);
    if (res.success) {
      loadData();
    }
  };

  const openContactEdit = (contact: Contact) => {
    setEditingContact(contact);
    setEditContactName(contact.full_name);
    setEditContactPhone(contact.phone_number || contact.normalized_phone);
    setEditContactCountry(getCountryByCode(contact.country_code));
    setEditContactError(null);
  };

  const handleContactEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;
    setEditContactError(null);
    setSavingContact(true);

    const payload: RegistrationPayload = {
      fullName: editContactName.trim(),
      country: editContactCountry.name,
      countryCode: editContactCountry.code,
      phoneNumber: editContactPhone.trim(),
    };

    const res = await updateContact(editingContact.id, payload);
    setSavingContact(false);

    if (res.success) {
      setEditingContact(null);
      loadData();
    } else {
      setEditContactError(res.error || 'Failed to update contact.');
    }
  };

  const handleContactDelete = async () => {
    if (!deletingContact) return;
    setDeletingContactLoading(true);
    const res = await deleteContact(deletingContact.id);
    setDeletingContactLoading(false);
    if (res.success) {
      setDeletingContact(null);
      loadData();
    }
  };

  const isFull = vcf.status === 'FULL' || vcf.current_count >= vcf.capacity;
  const isArchived = vcf.status === 'ARCHIVED';

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-cmd-surface border border-purple-500/30 text-purple-300 hover:text-white hover:border-purple-400 text-xs font-semibold flex items-center gap-2 transition-all shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to VCF Containers</span>
        </button>

        <div className="flex items-center gap-2">
          {isFull ? (
            <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-black tracking-wider flex items-center gap-1.5 shadow-md">
              <AlertCircle className="w-4 h-4 text-amber-400" /> FULL (100%)
            </span>
          ) : isArchived ? (
            <span className="px-3 py-1 rounded-full bg-gray-800 border border-gray-600 text-gray-300 text-xs font-semibold flex items-center gap-1.5">
              <Archive className="w-4 h-4 text-gray-400" /> ARCHIVED
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" /> ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-card-glow relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-cmd-dark border border-purple-500/40 shrink-0 shadow-purple-glow">
              {vcf.image_url ? (
                <img src={vcf.image_url} alt={vcf.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-purple-900 to-indigo-900 flex items-center justify-center">
                  <Layers className="w-10 h-10 text-purple-300" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">VCF Container</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{vcf.name}</h2>
              <p className="text-xs text-gray-300 max-w-xl">
                {vcf.description || 'No description provided for this container.'}
              </p>
              <span className="text-[11px] text-gray-400 flex items-center gap-1.5 pt-1">
                <Calendar className="w-3.5 h-3.5 text-purple-400" /> Created {new Date(vcf.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
            <button
              onClick={handleDownloadVcf}
              className="px-4 py-2.5 rounded-xl btn-purple text-xs font-bold flex items-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4 text-purple-200" />
              <span>Download Container VCF</span>
            </button>

            <button
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-2.5 rounded-xl bg-cmd-surface border border-purple-500/30 text-purple-300 hover:text-white hover:border-purple-400 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit VCF</span>
            </button>

            <button
              onClick={handleArchiveToggle}
              className="px-3.5 py-2.5 rounded-xl bg-cmd-surface border border-gray-700 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <Archive className="w-4 h-4" />
              <span>{isArchived ? 'Unarchive' : 'Archive'}</span>
            </button>

            <button
              onClick={() => setIsDeleting(true)}
              className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/30 text-rose-300 hover:text-white hover:bg-rose-900/80 transition-all"
              title="Delete VCF Container"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Metrics Row Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-cmd-surface border border-purple-500/30 rounded-2xl p-4 shadow-card-glow">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Assigned Contacts</span>
          <span className="text-2xl font-extrabold text-white font-mono mt-1 block">
            {vcf.current_count.toLocaleString()} / {vcf.capacity.toLocaleString()}
          </span>
          <span className="text-[10px] text-purple-400 mt-0.5 block">Total Saved in Container</span>
        </div>

        <div className="bg-cmd-surface border border-purple-500/30 rounded-2xl p-4 shadow-card-glow">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Remaining Capacity</span>
          <span className="text-2xl font-extrabold text-cyan-300 font-mono mt-1 block">
            {vcf.remaining_capacity.toLocaleString()}
          </span>
          <span className="text-[10px] text-gray-400 mt-0.5 block">Available Registration Slots</span>
        </div>

        <div className="bg-cmd-surface border border-purple-500/30 rounded-2xl p-4 shadow-card-glow">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Percentage Filled</span>
          <span className="text-2xl font-extrabold text-emerald-300 font-mono mt-1 block">
            {vcf.percentage_filled}%
          </span>
          <div className="w-full bg-cmd-dark h-2 rounded-full mt-2 overflow-hidden border border-purple-500/20">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full"
              style={{ width: `${vcf.percentage_filled}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-cmd-surface border border-purple-500/30 rounded-2xl p-4 shadow-card-glow">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Container Status</span>
          <span className={`text-xl font-bold font-mono mt-1 block ${isFull ? 'text-amber-400' : 'text-emerald-400'}`}>
            {vcf.status}
          </span>
          <span className="text-[10px] text-gray-400 mt-0.5 block">
            {isFull ? 'No new contacts accepted' : 'Accepting new registrations'}
          </span>
        </div>
      </div>

      {/* ASSIGNED CONTACTS SECTION */}
      <div className="glass-panel rounded-3xl p-6 border border-purple-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-cmd-border">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              Contacts Capped in {vcf.name}
            </h3>
            <p className="text-xs text-gray-400">All registered participants belonging to this specific VCF container</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search contacts in this VCF..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input text-white placeholder-gray-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Contacts Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-300">
            <thead className="bg-cmd-dark/80 text-gray-400 font-semibold uppercase text-[11px] tracking-wider border-b border-cmd-border">
              <tr>
                <th className="px-4 py-3">Participant Name</th>
                <th className="px-4 py-3">Phone Number</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Export Scope</th>
                <th className="px-4 py-3">Registered</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-900/10">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No contacts assigned to this VCF container{searchQuery ? ` matching "${searchQuery}"` : '.'}.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => {
                  const countryObj = getCountryByCode(c.country_code);
                  const isGlobal = Boolean(c.include_in_all_vcfs);
                  return (
                    <tr key={c.id} className="hover:bg-purple-900/20 transition-colors group">
                      <td className="px-4 py-3 font-semibold text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 text-xs shrink-0">
                            {c.full_name.charAt(0).toUpperCase()}
                          </div>
                          <span>{c.full_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-purple-300">
                        {c.normalized_phone || c.phone_number}
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5">
                          <span>{countryObj.flag}</span>
                          <span>{c.country}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleGlobal(c.id, isGlobal)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border ${
                            isGlobal
                              ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-sm'
                              : 'bg-cmd-surface border-cmd-border text-gray-400 hover:text-gray-200'
                          }`}
                          title={isGlobal ? 'Included in every exported VCF file' : 'Isolated to this VCF container only. Click to include in all VCF exports.'}
                        >
                          <Globe className={`w-3.5 h-3.5 ${isGlobal ? 'text-cyan-400' : 'text-gray-500'}`} />
                          <span>{isGlobal ? 'In All VCF Exports' : 'This VCF Only'}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                        {new Date(c.created_at).toLocaleDateString()} {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openContactEdit(c)}
                            className="p-1.5 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 hover:text-white hover:border-purple-400 transition-all"
                            title="Edit Contact"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeletingContact(c)}
                            className="p-1.5 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 hover:text-white hover:border-rose-400 transition-all"
                            title="Delete Contact"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT VCF MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cmd-dark/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-purple-500/40 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-cmd-border">
              <h4 className="text-lg font-bold text-white">Edit VCF Container ({vcf.name})</h4>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  VCF Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white focus:outline-none"
                  required
                />
              </div>

              {/* EMOJI PREFIX & SUFFIX EDIT FIELDS */}
              <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/30 space-y-3">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
                  📱 Contact Name Emoji Formatting
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">Emoji Prefix</label>
                    <input
                      type="text"
                      placeholder="e.g. 🩸🩸 "
                      value={editNamePrefix}
                      onChange={(e) => setEditNamePrefix(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-300 mb-1">Emoji Suffix</label>
                    <input
                      type="text"
                      placeholder="e.g. 🛁"
                      value={editNameSuffix}
                      onChange={(e) => setEditNameSuffix(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-gray-400">Presets:</span>
                  {EMOJI_PRESETS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setEditNamePrefix(emoji)}
                      className="px-2 py-0.5 rounded-lg bg-cmd-surface border border-purple-500/20 text-xs hover:border-purple-400"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <div className="p-2 rounded-xl bg-cmd-dark/90 border border-emerald-500/30 text-xs flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">VCF Export Preview:</span>
                  <span className="font-semibold text-emerald-300 font-mono">
                    {editNamePrefix}Nexus Tech{editNameSuffix}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Maximum Capacity (Current Contacts: {vcf.current_count})
                </label>
                <input
                  type="number"
                  min={vcf.current_count}
                  value={editCapacity}
                  onChange={(e) => setEditCapacity(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white focus:outline-none"
                  required
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Capacity cannot be set lower than existing contact count ({vcf.current_count}).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={editImageUrl}
                  onChange={(e) => setEditImageUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl bg-cmd-dark border border-cmd-border text-gray-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 rounded-xl btn-purple text-xs font-bold flex items-center gap-2 shadow-lg"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save VCF Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONTACT EDIT MODAL */}
      {editingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cmd-dark/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-purple-500/40 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-cmd-border">
              <h4 className="text-base font-bold text-white">Edit Contact</h4>
              <button onClick={() => setEditingContact(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editContactError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{editContactError}</span>
              </div>
            )}

            <form onSubmit={handleContactEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  value={editContactName}
                  onChange={(e) => setEditContactName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white focus:outline-none"
                  required
                />
              </div>

              <CountrySelector selectedCountry={editContactCountry} onSelectCountry={setEditContactCountry} />

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={editContactPhone}
                  onChange={(e) => setEditContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white focus:outline-none"
                  required
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  Phone is validated and normalized. Uniqueness is enforced per VCF container.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingContact(null)}
                  className="px-4 py-2.5 rounded-xl bg-cmd-dark border border-cmd-border text-gray-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingContact}
                  className="px-5 py-2.5 rounded-xl btn-purple text-xs font-bold flex items-center gap-2 shadow-lg"
                >
                  {savingContact ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONTACT DELETE CONFIRMATION MODAL */}
      {deletingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cmd-dark/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-rose-500/40 shadow-2xl relative text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Delete Contact?</h4>
            <p className="text-xs text-gray-300">
              Delete <strong className="text-white">{deletingContact.full_name}</strong> ({deletingContact.normalized_phone || deletingContact.phone_number}) from this VCF container?
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingContact(null)}
                className="px-4 py-2.5 rounded-xl bg-cmd-dark border border-cmd-border text-gray-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleContactDelete}
                disabled={deletingContactLoading}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2"
              >
                {deletingContactLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VCF DELETE MODAL */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cmd-dark/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-rose-500/40 shadow-2xl relative text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <h4 className="text-lg font-bold text-white">Delete VCF Container?</h4>
            <p className="text-xs text-gray-300">
              Are you sure you want to delete <strong className="text-white">{vcf.name}</strong>? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setIsDeleting(false)}
                className="px-4 py-2.5 rounded-xl bg-cmd-dark border border-cmd-border text-gray-300 hover:text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
