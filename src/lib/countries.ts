import { Country } from '../types';

export const COUNTRIES: Country[] = [
  { name: 'Kenya', code: 'KE', dialCode: '+254', flag: '🇰🇪', formatPlaceholder: '712 345 678' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: '🇺🇸', formatPlaceholder: '(555) 000-0000' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: '🇬🇧', formatPlaceholder: '7911 123456' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', flag: '🇳🇬', formatPlaceholder: '803 123 4567' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', flag: '🇿🇦', formatPlaceholder: '82 123 4567' },
  { name: 'Ghana', code: 'GH', dialCode: '+233', flag: '🇬🇭', formatPlaceholder: '24 123 4567' },
  { name: 'Uganda', code: 'UG', dialCode: '+256', flag: '🇺🇬', formatPlaceholder: '712 345678' },
  { name: 'Tanzania', code: 'TZ', dialCode: '+255', flag: '🇹🇿', formatPlaceholder: '712 345 678' },
  { name: 'Rwanda', code: 'RW', dialCode: '+250', flag: '🇷🇼', formatPlaceholder: '788 123 456' },
  { name: 'Canada', code: 'CA', dialCode: '+1', flag: '🇨🇦', formatPlaceholder: '(555) 000-0000' },
  { name: 'Australia', code: 'AU', dialCode: '+61', flag: '🇦🇺', formatPlaceholder: '412 345 678' },
  { name: 'India', code: 'IN', dialCode: '+91', flag: '🇮🇳', formatPlaceholder: '98765 43210' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: '🇩🇪', formatPlaceholder: '151 12345678' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: '🇫🇷', formatPlaceholder: '6 12 34 56 78' },
  { name: 'Brazil', code: 'BR', dialCode: '+55', flag: '🇧🇷', formatPlaceholder: '(11) 91234-5678' },
  { name: 'United Arab Emirates', code: 'AE', dialCode: '+971', flag: '🇦🇪', formatPlaceholder: '50 123 4567' },
  { name: 'Saudi Arabia', code: 'SA', dialCode: '+966', flag: '🇸🇦', formatPlaceholder: '50 123 4567' },
  { name: 'Egypt', code: 'EG', dialCode: '+20', flag: '🇪🇬', formatPlaceholder: '100 123 4567' },
  { name: 'Ethiopia', code: 'ET', dialCode: '+251', flag: '🇪🇹', formatPlaceholder: '91 123 4567' },
  { name: 'Zimbabwe', code: 'ZW', dialCode: '+263', flag: '🇿🇼', formatPlaceholder: '77 123 4567' },
  { name: 'Zambia', code: 'ZM', dialCode: '+260', flag: '🇿🇲', formatPlaceholder: '97 123 4567' },
  { name: 'Malawi', code: 'MW', dialCode: '+265', flag: '🇲🇼', formatPlaceholder: '888 12 34 56' },
  { name: 'Cameroon', code: 'CM', dialCode: '+237', flag: '🇨🇲', formatPlaceholder: '6 71 23 45 67' },
  { name: 'Senegal', code: 'SN', dialCode: '+221', flag: '🇸🇳', formatPlaceholder: '77 123 45 67' },
  { name: 'Ivory Coast', code: 'CI', dialCode: '+225', flag: '🇨🇮', formatPlaceholder: '07 01 23 45 67' },
  { name: 'Morocco', code: 'MA', dialCode: '+212', flag: '🇲🇦', formatPlaceholder: '612-345678' },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Kenya

export function getCountryByCode(code: string): Country {
  return COUNTRIES.find((c) => c.code.toUpperCase() === code.toUpperCase()) || DEFAULT_COUNTRY;
}
