import React from 'react';
import { Headset, MessageSquare, HelpCircle, AlertCircle } from 'lucide-react';

interface AdminContactSectionProps {
  adminName?: string;
  adminPhone?: string;
  adminPhone2?: string;
  adminWhatsapp?: string;
  adminWhatsapp2?: string;
}

export const AdminContactSection: React.FC<AdminContactSectionProps> = ({
  adminName = 'Nexus Support Team',
  adminPhone = '+254707848992',
  adminPhone2 = '+254794171080',
  adminWhatsapp,
  adminWhatsapp2,
}) => {
  const cleanPhone1 = adminPhone ? adminPhone.replace(/[^0-9]/g, '') : '';
  const cleanPhone2 = adminPhone2 ? adminPhone2.replace(/[^0-9]/g, '') : '';

  const waUrl1 = cleanPhone1 ? `https://wa.me/${cleanPhone1}` : (adminWhatsapp || 'https://wa.me/254707848992');
  const waUrl2 = cleanPhone2 ? `https://wa.me/${cleanPhone2}` : (adminWhatsapp2 || 'https://wa.me/254794171080');

  return (
    <div id="admin-contact" className="w-full max-w-4xl mx-auto my-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/30">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Left Text Block */}
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-300 text-xs font-semibold">
              <Headset className="w-3.5 h-3.5 text-purple-400" />
              Administrator Support Desk
            </div>

            <h4 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Need Help or Have Registration Issues?
            </h4>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              If you experienced a duplicate number issue, wish to update your details, or require early VCF access, please get in touch directly with our platform administrators:
            </p>

            {/* Quick Support Topics */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-cmd-dark border border-cmd-border text-gray-300 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-400" /> Duplicate Phone Issue
              </span>
              <span className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-cmd-dark border border-cmd-border text-gray-300 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-cyan-400" /> VCF Format Inquiry
              </span>
            </div>
          </div>

          {/* Right Admin Contact Card & Buttons */}
          <div className="w-full md:w-80 bg-cmd-dark/80 rounded-2xl p-5 border border-purple-500/30 space-y-3.5 shrink-0">
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold block">Official Support Desk</span>
              <h5 className="text-base font-bold text-white mt-0.5">{adminName}</h5>
            </div>

            <div className="space-y-2.5 pt-1">
              {/* Admin 1 Button */}
              <a
                href={waUrl1}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-xl btn-purple text-xs font-bold flex items-center justify-center gap-2.5 shadow-lg hover:scale-[1.01] transition-transform group"
                title="Contact Admin 1 via WhatsApp"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Contact Admin 1</span>
              </a>

              {/* Admin 2 Button */}
              <a
                href={waUrl2}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-200 hover:text-white hover:bg-purple-900/90 hover:border-purple-400 text-xs font-bold flex items-center justify-center gap-2.5 shadow-md hover:scale-[1.01] transition-transform group"
                title="Contact Admin 2 via WhatsApp"
              >
                <MessageSquare className="w-4 h-4 fill-purple-400 text-purple-400" />
                <span>Contact Admin 2</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
