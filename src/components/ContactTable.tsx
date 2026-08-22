import React, { useState } from 'react';
import { Contact, RegistrationPayload } from '../types';
import { getCountryByCode, COUNTRIES } from '../lib/countries';
import { CountrySelector } from './CountrySelector';
import { Edit2, Trash2, Phone, Calendar, Globe, User, AlertCircle, Check, X, ArrowUpDown, Loader2 } from 'lucide-react';

interface ContactTableProps {
  contacts: Contact[];
  onUpdate: (id: string, payload: RegistrationPayload) => Promise<{ success: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const ContactTable: React.FC<ContactTableProps> = ({ contacts, onUpdate, onDelete }) => {
  const [sortField, setSortField] = useState<'created_at' | 'full_name' | 'country'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Edit Modal State
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCountry, setEditCountry] = useState(COUNTRIES[0]);
  const [editError, setEditError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Delete Modal State
  const [deletingContact, setDeletingContact] = useState<Contact | null>(null);
  const [deleting, setDeleting] = useState(false);

  const toggleSort = (field: 'created_at' | 'full_name' | 'country') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedContacts = [...contacts].sort((a, b) => {
    let comp = 0;
    if (sortField === 'created_at') {
      comp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortField === 'full_name') {
      comp = a.full_name.localeCompare(b.full_name);
    } else if (sortField === 'country') {
      comp = a.country.localeCompare(b.country);
    }
    return sortOrder === 'asc' ? comp : -comp;
  });

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);
    setEditName(contact.full_name);
    setEditPhone(contact.phone_number || contact.normalized_phone);
    setEditCountry(getCountryByCode(contact.country_code));
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingContact) return;
    setEditError(null);
    setUpdating(true);

    const payload: RegistrationPayload = {
      fullName: editName.trim(),
      country: editCountry.name,
      countryCode: editCountry.code,
      phoneNumber: editPhone.trim(),
    };

    const res = await onUpdate(editingContact.id, payload);
    setUpdating(false);

    if (res.success) {
      setEditingContact(null);
    } else {
      setEditError(res.error || 'Failed to update contact.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingContact) return;
    setDeleting(true);
    const res = await onDelete(deletingContact.id);
    setDeleting(false);
    if (res.success) {
      setDeletingContact(null);
    }
  };

  return (
    <div className="w-full">
      {/* Table Container */}
      <div className="bg-cmd-surface border border-purple-500/30 rounded-2xl overflow-hidden shadow-card-glow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm text-gray-300">
            
            {/* Table Header */}
            <thead className="bg-cmd-dark/80 text-gray-400 font-semibold uppercase text-[11px] tracking-wider border-b border-cmd-border">
              <tr>
                <th className="px-4 py-3.5">
                  <button
                    onClick={() => toggleSort('full_name')}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <span>Participant Name</span>
                    <ArrowUpDown className="w-3 h-3 text-purple-400" />
                  </button>
                </th>
                <th className="px-4 py-3.5">Full Phone Number</th>
                <th className="px-4 py-3.5">
                  <button
                    onClick={() => toggleSort('country')}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <span>Country</span>
                    <ArrowUpDown className="w-3 h-3 text-purple-400" />
                  </button>
                </th>
                <th className="px-4 py-3.5">
                  <button
                    onClick={() => toggleSort('created_at')}
                    className="flex items-center gap-1.5 hover:text-white transition-colors"
                  >
                    <span>Registered Date</span>
                    <ArrowUpDown className="w-3 h-3 text-purple-400" />
                  </button>
                </th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-purple-900/10">
              {sortedContacts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                    No registered contacts found.
                  </td>
                </tr>
              ) : (
                sortedContacts.map((c) => {
                  const countryObj = getCountryByCode(c.country_code);
                  return (
                    <tr key={c.id} className="hover:bg-purple-900/20 transition-colors group">
                      {/* Name */}
                      <td className="px-4 py-3 font-semibold text-white">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center font-bold text-purple-300 text-xs">
                            {c.full_name.charAt(0).toUpperCase()}
                          </div>
                          <span>{c.full_name}</span>
                        </div>
                      </td>

                      {/* Phone Number (Unmasked for Admin) */}
                      <td className="px-4 py-3 font-mono text-purple-300">
                        {c.normalized_phone || c.phone_number}
                      </td>

                      {/* Country */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{countryObj.flag}</span>
                          <span>{c.country}</span>
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(c.created_at).toLocaleDateString()} {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Action buttons */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(c)}
                            className="p-2 rounded-lg bg-purple-950/60 border border-purple-500/30 text-purple-300 hover:text-white hover:border-purple-400 transition-all"
                            title="Edit Contact"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingContact(c)}
                            className="p-2 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 hover:text-white hover:border-rose-400 transition-all"
                            title="Delete Contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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

      {/* EDIT CONTACT MODAL */}
      {editingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cmd-dark/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg glass-panel rounded-3xl p-6 border border-purple-500/40 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-cmd-border">
              <h4 className="text-lg font-bold text-white">Edit Contact Details</h4>
              <button
                onClick={() => setEditingContact(null)}
                className="text-gray-400 hover:text-white"
              >
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
                  Full Name
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white focus:outline-none"
                  required
                />
              </div>

              <CountrySelector selectedCountry={editCountry} onSelectCountry={setEditCountry} />

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm text-white focus:outline-none"
                  required
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  System normalizes phone number and enforces database uniqueness.
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
                  disabled={updating}
                  className="px-5 py-2.5 rounded-xl btn-purple text-xs font-bold flex items-center gap-2"
                >
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cmd-dark/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md glass-panel rounded-3xl p-6 border border-rose-500/40 shadow-2xl relative text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-400 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>

            <h4 className="text-lg font-bold text-white">Delete Contact Record?</h4>
            <p className="text-xs text-gray-300">
              Are you sure you want to delete contact <strong className="text-white">{deletingContact.full_name}</strong> ({deletingContact.normalized_phone || deletingContact.phone_number})?
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingContact(null)}
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
