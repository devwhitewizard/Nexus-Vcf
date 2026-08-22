export interface VcfContainer {
  id: string;
  name: string;
  capacity: number;
  image_url: string | null;
  description: string | null;
  name_prefix?: string | null;
  name_suffix?: string | null;
  status: 'ACTIVE' | 'FULL' | 'ARCHIVED';
  created_at: string;
  created_by: string;
  current_count: number;
  percentage_filled: number;
  remaining_capacity: number;
}

export interface VcfManagementStats {
  totalVcfs: number;
  activeVcfs: number;
  fullVcfs: number;
  archivedVcfs: number;
  totalContacts: number;
  availableCapacity: number;
}

export interface DirectoryStatusData {
  totalContacts: number;
  remainingSlots: number;
  maxCapacity: number;
  percentageFilled: number;
  isFull: boolean;
}

export interface Contact {
  id: string;
  vcf_id?: string | null;
  full_name: string;
  phone_number: string;
  country: string;
  country_code: string;
  normalized_phone: string;
  email?: string | null;
  organization?: string | null;
  notes?: string | null;
  include_in_all_vcfs?: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicContact {
  id: string;
  vcf_id?: string | null;
  full_name: string;
  country: string;
  country_code: string;
  masked_phone: string;
  include_in_all_vcfs?: boolean;
  created_at: string;
}

export interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
  formatPlaceholder: string;
}

export interface AdminStatsData {
  totalContacts: number;
  todayCount: number;
  weekCount: number;
  latestRegistration: string | null;
  duplicateAttempts: number;
  totalVcfs?: number;
  activeVcfs?: number;
  fullVcfs?: number;
  archivedVcfs?: number;
  availableCapacity?: number;
}

export interface PublicConfig {
  groupUrl: string;
  adminName: string;
  adminPhone: string;
  adminPhone2?: string;
  adminWhatsapp: string;
  adminWhatsapp2?: string;
}

export interface RegistrationPayload {
  fullName: string;
  country: string;
  countryCode: string;
  phoneNumber: string;
}

export interface CreateVcfPayload {
  name: string;
  capacity: number;
  imageUrl?: string | null;
  description?: string | null;
  namePrefix?: string | null;
  nameSuffix?: string | null;
}

export interface UpdateVcfPayload {
  name?: string;
  capacity?: number;
  imageUrl?: string | null;
  description?: string | null;
  namePrefix?: string | null;
  nameSuffix?: string | null;
  status?: 'ACTIVE' | 'FULL' | 'ARCHIVED';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  error?: string;
  isDuplicate?: boolean;
  details?: Record<string, string>;
  data?: T;
}
