import React, { useState, useEffect } from 'react';
import { HeaderCard } from '../components/HeaderCard';
import { DirectoryStatus } from '../components/DirectoryStatus';
import { DirectoryFullModal } from '../components/DirectoryFullModal';
import { RegistrationForm } from '../components/RegistrationForm';
import { GroupJoinCard } from '../components/GroupJoinCard';
import { ContactList } from '../components/ContactList';
import { AdminContactSection } from '../components/AdminContactSection';
import { fetchDirectoryStatus, fetchPublicConfig, fetchPublicContacts } from '../lib/api';
import { PublicConfig, PublicContact, DirectoryStatusData } from '../types';

export const Home: React.FC = () => {
  const [directoryStatus, setDirectoryStatus] = useState<DirectoryStatusData>({
    totalContacts: 0,
    remainingSlots: 500,
    maxCapacity: 500,
    percentageFilled: 0,
    isFull: false,
  });

  const [config, setConfig] = useState<PublicConfig>({
    groupUrl: 'https://chat.whatsapp.com/DCsD3lqaanU7vPJ3qMDq14?s=cl&p=a&ilr=0',
    adminName: 'Nexus Support Team',
    adminPhone: '+254707848992',
    adminPhone2: '+254794171080',
    adminWhatsapp: 'https://wa.me/254707848992',
    adminWhatsapp2: 'https://wa.me/254794171080',
  });

  const [publicContacts, setPublicContacts] = useState<PublicContact[]>([]);
  const [isFullModalOpen, setIsFullModalOpen] = useState(false);

  const loadData = async () => {
    const [statusData, configData, contactsData] = await Promise.all([
      fetchDirectoryStatus(),
      fetchPublicConfig(),
      fetchPublicContacts(),
    ]);
    setDirectoryStatus(statusData);
    setConfig(configData);
    setPublicContacts(contactsData);

    if (statusData.isFull) {
      setIsFullModalOpen(true);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRegistrationSuccess = () => {
    loadData();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* TOP NEXUS VCF HEADER CARD */}
        <HeaderCard contactCount={directoryStatus.totalContacts} />

        {/* REGISTRATION FORM SECTION */}
        <RegistrationForm
          onSuccess={handleRegistrationSuccess}
          onDirectoryFull={() => setIsFullModalOpen(true)}
        />

        {/* DIRECTORY STATUS CARD (REPLACES LIVE COMMUNITY COUNTER) */}
        <DirectoryStatus status={directoryStatus} />

        {/* OFFICIAL GROUP JOIN CARD */}
        <GroupJoinCard groupUrl={config.groupUrl} />

        {/* PUBLIC DIRECTORY LIST */}
        <ContactList contacts={publicContacts} />

        {/* ADMIN SUPPORT CONTACT SECTION */}
        <AdminContactSection
          adminName={config.adminName}
          adminPhone={config.adminPhone}
          adminPhone2={config.adminPhone2}
          adminWhatsapp={config.adminWhatsapp}
          adminWhatsapp2={config.adminWhatsapp2}
        />

      </main>

      {/* DIRECTORY FULL POPUP MODAL */}
      <DirectoryFullModal
        isOpen={isFullModalOpen}
        onClose={() => setIsFullModalOpen(false)}
        maxCapacity={directoryStatus.maxCapacity}
      />

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

          {/* Brand Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">

            {/* Logo + Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center font-black text-white text-sm shadow-cyan-glow shrink-0">
                N
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-800 text-sm leading-none">Nexus VCF Platform</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Official Contact Directory System</p>
              </div>
            </div>

            {/* Nav Links */}
            <nav className="flex items-center gap-1 flex-wrap justify-center">
              <a
                href="#register"
                className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-sky-700 hover:bg-sky-50 font-medium transition-all"
              >
                Register
              </a>
              <a
                href="#group-join"
                className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-sky-700 hover:bg-sky-50 font-medium transition-all"
              >
                Group Join
              </a>
              <a
                href="#admin-contact"
                className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-sky-700 hover:bg-sky-50 font-medium transition-all"
              >
                Support
              </a>
              <a
                href="/admin"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-sky-700 border border-sky-200 hover:bg-sky-50 hover:border-sky-400 transition-all"
              >
                Admin Panel ↗
              </a>
            </nav>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-sky-200 to-transparent" />

          {/* Bottom Copyright */}
          <p className="text-center text-[11px] text-slate-400 font-medium">
            © {new Date().getFullYear()} Nexus VCF Platform · All Rights Reserved · Built with ♥ for the community
          </p>

        </div>
      </footer>
    </div>
  );
};
