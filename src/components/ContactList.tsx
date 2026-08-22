import React, { useState } from 'react';
import { PublicContact } from '../types';
import { getCountryByCode } from '../lib/countries';
import { Users, Search, ShieldCheck, Lock, Globe } from 'lucide-react';

interface ContactListProps {
  contacts: PublicContact[];
}

export const ContactList: React.FC<ContactListProps> = ({ contacts }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = contacts.filter(
    (c) =>
      c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="community" className="w-full max-w-5xl mx-auto my-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/30">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-cmd-border">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              Privacy Protected Directory
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Community Directory Preview
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Registered participants (Phone numbers are partially masked to protect privacy).
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl glass-input text-white placeholder-gray-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Directory Grid / Cards */}
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            No registered participants found matching "{searchTerm}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((contact) => {
              const countryInfo = getCountryByCode(contact.country_code);
              return (
                <div
                  key={contact.id}
                  className="bg-cmd-dark/70 rounded-2xl p-4 border border-cmd-border hover:border-purple-500/40 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-500/20 flex items-center justify-center text-lg shrink-0">
                      {countryInfo.flag}
                    </div>
                    <div className="truncate">
                      <h5 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                        {contact.full_name}
                      </h5>
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                        <Lock className="w-3 h-3 text-emerald-400" />
                        <span className="font-mono">{contact.masked_phone}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold px-2 py-1 rounded bg-cmd-surface border border-cmd-border text-gray-400 shrink-0">
                    {contact.country_code}
                  </span>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
