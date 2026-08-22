import { parsePhoneNumberFromString, CountryCode as LibCountryCode } from 'libphonenumber-js';
import { COUNTRIES, DEFAULT_COUNTRY } from './countries.js';

export interface PhoneValidationResult {
  isValid: boolean;
  normalizedPhone: string | null;
  formattedDisplay: string | null;
  error?: string;
}

/**
 * Normalizes a phone number to standard E.164 format (+[country_code][number]).
 * Uses libphonenumber-js with automatic smart fallback for local numbers.
 */
export function normalizePhoneNumber(
  phone: string,
  countryCode: string
): PhoneValidationResult {
  try {
    if (!phone || !phone.trim()) {
      return { isValid: false, normalizedPhone: null, formattedDisplay: null, error: 'Phone number is required.' };
    }

    const cleanedInput = phone.trim();
    const iso2 = (countryCode || 'KE').toUpperCase() as LibCountryCode;

    // Find country info
    const countryObj = COUNTRIES.find((c) => c.code.toUpperCase() === iso2) || DEFAULT_COUNTRY;
    const dialCode = countryObj.dialCode; // e.g. "+254"

    // 1. Primary strict parsing with libphonenumber-js
    const phoneNumberObj = parsePhoneNumberFromString(cleanedInput, iso2);
    if (phoneNumberObj && phoneNumberObj.isValid()) {
      return {
        isValid: true,
        normalizedPhone: phoneNumberObj.format('E.164'),
        formattedDisplay: phoneNumberObj.formatInternational(),
      };
    }

    // 2. Smart Lenient Normalization Fallback
    // Strip non-digits except initial +
    let digits = cleanedInput.replace(/[^\d+]/g, '');

    if (digits.startsWith('+')) {
      // Already has international country code e.g. +254707848992
      const pureDigits = digits.replace(/\D/g, '');
      if (pureDigits.length >= 7 && pureDigits.length <= 15) {
        return {
          isValid: true,
          normalizedPhone: `+${pureDigits}`,
          formattedDisplay: `+${pureDigits}`,
        };
      }
    } else {
      // Local number format e.g. "0707848992" or "707848992"
      let nationalNumber = digits.replace(/\D/g, '');
      if (nationalNumber.startsWith('0')) {
        nationalNumber = nationalNumber.slice(1);
      }
      
      const cleanDialCode = dialCode.replace(/\D/g, ''); // e.g. "254"

      // If user typed national number starting with dial code already e.g. 254707848992
      if (nationalNumber.startsWith(cleanDialCode) && nationalNumber.length >= cleanDialCode.length + 6) {
        return {
          isValid: true,
          normalizedPhone: `+${nationalNumber}`,
          formattedDisplay: `+${nationalNumber}`,
        };
      }

      const fullNormalized = `+${cleanDialCode}${nationalNumber}`;
      if (nationalNumber.length >= 5 && nationalNumber.length <= 14) {
        return {
          isValid: true,
          normalizedPhone: fullNormalized,
          formattedDisplay: fullNormalized,
        };
      }
    }

    return {
      isValid: false,
      normalizedPhone: null,
      formattedDisplay: null,
      error: 'Please enter a valid phone number for your selected country.',
    };
  } catch (err) {
    return {
      isValid: false,
      normalizedPhone: null,
      formattedDisplay: null,
      error: 'Invalid phone number format.',
    };
  }
}

/**
 * Masks a phone number for public privacy display.
 * Example: "+254712345678" -> "+254 7•• ••• 678"
 */
export function maskPhoneNumber(phone: string): string {
  if (!phone) return '••• ••• •••';
  
  const cleaned = phone.replace(/\s+/g, '');
  if (cleaned.length <= 6) {
    return cleaned.slice(0, 3) + '••••' + cleaned.slice(-1);
  }

  const prefixLength = cleaned.startsWith('+') ? 5 : 4;
  const prefix = cleaned.slice(0, prefixLength);
  const suffix = cleaned.slice(-3);
  
  return `${prefix} •• ••• ${suffix}`;
}

/**
 * Validates registration form fields
 */
export function validateRegistrationInput(data: {
  fullName: string;
  country: string;
  countryCode: string;
  phoneNumber: string;
}): { isValid: boolean; errors: Record<string, string>; normalizedPhone?: string } {
  const errors: Record<string, string> = {};

  if (!data.fullName || data.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters long.';
  }

  if (!data.country || !data.country.trim()) {
    errors.country = 'Please select your country.';
  }

  const phoneRes = normalizePhoneNumber(data.phoneNumber, data.countryCode);
  if (!phoneRes.isValid || !phoneRes.normalizedPhone) {
    errors.phoneNumber = phoneRes.error || 'Please provide a valid phone number.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    normalizedPhone: phoneRes.normalizedPhone || undefined,
  };
}
