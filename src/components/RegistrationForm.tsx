import React, { useState } from 'react';
import { CountrySelector } from './CountrySelector';
import { DEFAULT_COUNTRY } from '../lib/countries';
import { Country, RegistrationPayload } from '../types';
import { registerContact } from '../lib/api';
import { User, Phone, CheckCircle2, AlertTriangle, ArrowRight, FileText, Loader2 } from 'lucide-react';

interface RegistrationFormProps {
  onSuccess: (newCount?: number) => void;
  onDirectoryFull?: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSuccess, onDirectoryFull }) => {
  const [selectedCountry, setSelectedCountry] = useState<Country>(DEFAULT_COUNTRY);
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleCountryChange = (country: Country) => {
    setSelectedCountry(country);
    setFormErrors((prev) => ({ ...prev, phoneNumber: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});
    setDuplicateError(null);
    setSuccessMessage(null);

    // Client-side quick checks
    const errors: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full name (minimum 2 characters).';
    }

    if (!phoneNumber.trim() || phoneNumber.trim().length < 5) {
      errors.phoneNumber = 'Please enter a valid phone number.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    const payload: RegistrationPayload = {
      fullName: fullName.trim(),
      country: selectedCountry.name,
      countryCode: selectedCountry.code,
      phoneNumber: phoneNumber.trim(),
    };

    const res = await registerContact(payload);
    setLoading(false);

    if (res.success) {
      const vcfName = res.assignedVcf ? ` Assigned to ${res.assignedVcf}.` : '';
      setSuccessMessage(`🎉 Registration successful!${vcfName} Welcome to Nexus VCF.`);
      setFullName('');
      setPhoneNumber('');
      if (typeof res.totalCount === 'number') {
        onSuccess(res.totalCount);
      } else {
        onSuccess();
      }

      // Smooth scroll to group join card after 1.2 seconds
      setTimeout(() => {
        const groupEl = document.getElementById('group-join');
        if (groupEl) {
          groupEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 1200);
    } else if (res.isDuplicate) {
      setDuplicateError('This number is already registered.');
    } else if (res.noAvailableVcf) {
      setDuplicateError(res.error || 'All VCF containers are currently FULL. Registration is temporarily closed until a new VCF is created.');
      if (onDirectoryFull) {
        onDirectoryFull();
      }
    } else {
      if (res.details) {
        setFormErrors(res.details);
      } else {
        setDuplicateError(res.error || 'Failed to submit registration. Please try again.');
      }
    }
  };

  return (
    <div id="register" className="w-full max-w-xl mx-auto glass-panel rounded-3xl p-6 sm:p-8 shadow-card-glow relative overflow-hidden border border-sky-100">
      {/* Decorative Glow Elements */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-sky-100/50 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-100/50 rounded-full blur-3xl pointer-events-none"></div>

      {/* Form Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-2xl bg-purple-900/40 border border-purple-500/30 text-purple-300">
          <FileText className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Register Your Contact</h2>
          <p className="text-xs sm:text-sm text-gray-400">Join the official VCF network to exchange contacts seamlessly</p>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-sm flex items-start gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{successMessage}</p>
            <p className="text-xs text-emerald-400/90 mt-1">
              Scroll down to join the official WhatsApp group to receive the final file!
            </p>
          </div>
        </div>
      )}

      {/* Duplicate / Generic Error Notification Banner */}
      {duplicateError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-3 animate-shake">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          <div className="flex-1">
            <span className="font-bold">{duplicateError}</span>
            <span className="block text-xs text-rose-400/80 mt-0.5">
              Each phone number can only register once. If you need support, check our Admin Contact section below.
            </span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name Input */}
        <div>
          <label htmlFor="fullName" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              id="fullName"
              type="text"
              placeholder="e.g. Nexus Tech"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500 focus:outline-none"
              required
            />
          </div>
          {formErrors.fullName && (
            <p className="text-xs text-rose-400 mt-1.5 font-medium">{formErrors.fullName}</p>
          )}
        </div>

        {/* Country Selector Component */}
        <CountrySelector selectedCountry={selectedCountry} onSelectCountry={handleCountryChange} />

        {/* Phone Number Input */}
        <div>
          <label htmlFor="phoneNumber" className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
            Phone Number
          </label>
          <div className="flex items-center gap-2">
            <div className="px-3.5 py-3 rounded-xl glass-input text-sm font-semibold text-purple-300 bg-purple-950/50 border-purple-500/30 flex items-center gap-1.5 shrink-0">
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.dialCode}</span>
            </div>
            <div className="relative flex-1">
              <Phone className="w-4 h-4 text-purple-400 absolute left-3.5 top-3.5 pointer-events-none" />
              <input
                id="phoneNumber"
                type="tel"
                placeholder={selectedCountry.formatPlaceholder}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl glass-input text-sm text-white placeholder-gray-500 focus:outline-none"
                required
              />
            </div>
          </div>
          {formErrors.phoneNumber && (
            <p className="text-xs text-rose-400 mt-1.5 font-medium">{formErrors.phoneNumber}</p>
          )}
          <p className="text-[11px] text-gray-400 mt-1.5">
            Phone numbers are normalized & protected. Only 1 registration per unique number is permitted.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl btn-purple font-bold text-sm tracking-wide flex items-center justify-center gap-2 group shadow-xl"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Normalizing & Registering...
            </>
          ) : (
            <>
              <span>Complete Registration</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
