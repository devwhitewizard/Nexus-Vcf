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
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-sky-100">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Left Text Block */}
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold">
              <Headset className="w-3.5 h-3.5 text-sky-600" />
              Administrator Support Desk
            </div>

            <h4 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Need Help or Have Registration Issues?
            </h4>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
              If you experienced a duplicate number issue, wish to update your details, or require early VCF access, please get in touch directly with our platform administrators:
            </p>

            {/* Quick Support Topics */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-500" /> Duplicate Phone Issue
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 flex items-center gap-1">
                <HelpCircle className="w-3 h-3 text-sky-500" /> VCF Format Inquiry
              </span>
            </div>
          </div>

          {/* Right Admin Contact Card & Buttons */}
          <div className="w-full md:w-80 bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3.5 shrink-0">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block">Official Support Desk</span>
              <h5 className="text-base font-bold text-slate-900 mt-0.5">{adminName}</h5>
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
                className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2.5 shadow-md hover:scale-[1.01] transition-all group"
                title="Contact Admin 2 via WhatsApp"
              >
                <MessageSquare className="w-4 h-4 fill-white text-white" />
                <span>Contact Admin 2</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
