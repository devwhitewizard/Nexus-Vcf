import {
  PublicConfig,
  PublicContact,
  Contact,
  AdminStatsData,
  RegistrationPayload,
  VcfContainer,
  VcfManagementStats,
  CreateVcfPayload,
  UpdateVcfPayload,
  DirectoryStatusData,
} from '../types';

const API_BASE = '/api';

export async function fetchDirectoryStatus(): Promise<DirectoryStatusData> {
  try {
    const res = await fetch(`${API_BASE}/status`);
    const data = await res.json();
    if (data.success && data.status) {
      return data.status;
    }
  } catch (err) {
    console.error('Failed to fetch directory status:', err);
  }
  return {
    totalContacts: 0,
    remainingSlots: 500,
    maxCapacity: 500,
    percentageFilled: 0,
    isFull: false,
  };
}

const DEFAULT_GROUP_URL = 'https://chat.whatsapp.com/DCsD3lqaanU7vPJ3qMDq14?s=cl&p=a&ilr=0';

function sanitizeGroupUrl(rawUrl?: string): string {
  if (!rawUrl || !rawUrl.trim()) return DEFAULT_GROUP_URL;
  let trimmed = rawUrl.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    trimmed = `https://${trimmed}`;
  }
  if (trimmed.includes('vercel.app') || trimmed.includes('CtjtkaQ1zCw4atCHSiFBQwhtt') || trimmed.includes('Jk88X19Kls92K109s8')) {
    return DEFAULT_GROUP_URL;
  }
  return trimmed;
}

export async function fetchPublicConfig(): Promise<PublicConfig> {
  try {
    const res = await fetch(`${API_BASE}/config`);
    const data = await res.json();
    if (data.success) {
      return {
        groupUrl: sanitizeGroupUrl(data.groupUrl),
        adminName: data.adminName || 'Nexus Support Team',
        adminPhone: data.adminPhone || '+254707848992',
        adminPhone2: data.adminPhone2 || '+254794171080',
        adminWhatsapp: data.adminWhatsapp || 'https://wa.me/254707848992',
        adminWhatsapp2: data.adminWhatsapp2 || 'https://wa.me/254794171080',
      };
    }
  } catch (err) {
    console.error('Failed to fetch public config:', err);
  }
  return {
    groupUrl: DEFAULT_GROUP_URL,
    adminName: 'Nexus Support Team',
    adminPhone: '+254707848992',
    adminPhone2: '+254794171080',
    adminWhatsapp: 'https://wa.me/254707848992',
    adminWhatsapp2: 'https://wa.me/254794171080',
  };
}

export async function updateAdminConfig(payload: {
  groupUrl?: string;
  adminName?: string;
  adminPhone?: string;
  adminPhone2?: string;
}): Promise<{ success: boolean; message?: string; error?: string; config?: PublicConfig }> {
  try {
    const res = await fetch(`${API_BASE}/admin/config`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Network error while updating system configuration.' };
  }
}

export async function fetchContactCount(): Promise<number> {
  try {
    const res = await fetch(`${API_BASE}/count`);
    const data = await res.json();
    if (data.success && typeof data.count === 'number') {
      return data.count;
    }
  } catch (err) {
    console.error('Failed to fetch contact count:', err);
  }
  return 0;
}

export async function fetchPublicContacts(): Promise<PublicContact[]> {
  try {
    const res = await fetch(`${API_BASE}/contacts/public`);
    const data = await res.json();
    if (data.success && Array.isArray(data.contacts)) {
      return data.contacts;
    }
  } catch (err) {
    console.error('Failed to fetch public contacts:', err);
  }
  return [];
}

export async function registerContact(payload: RegistrationPayload): Promise<{
  success: boolean;
  message?: string;
  error?: string;
  isDuplicate?: boolean;
  noAvailableVcf?: boolean;
  assignedVcf?: string;
  totalCount?: number;
  contact?: Contact;
  details?: Record<string, string>;
}> {
  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return {
      success: false,
      error: 'Network error. Please check your internet connection and try again.',
    };
  }
}

// -------------------------------------------------------------------
// ADMIN AUTH & VCF CONTAINER API CLIENT FUNCTIONS
// -------------------------------------------------------------------

export async function adminLogin(password: string): Promise<{ success: boolean; token?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    const data = await res.json().catch(() => null);

    if (!data) {
      return { success: false, error: `Server error (HTTP ${res.status}). Please check Vercel logs.` };
    }

    if (data.success && data.token) {
      localStorage.setItem('nexus_admin_token', data.token);
    }
    return data;
  } catch (err: any) {
    console.error('adminLogin error:', err);
    return { success: false, error: 'Network error connecting to backend API.' };
  }
}

export async function adminLogout(): Promise<void> {
  try {
    localStorage.removeItem('nexus_admin_token');
    await fetch(`${API_BASE}/admin/logout`, { method: 'POST' });
  } catch (err) {}
}

function getAdminAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('nexus_admin_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function checkAdminStatus(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/admin/me`, {
      headers: getAdminAuthHeaders(),
    });
    const data = await res.json();
    return data.success === true;
  } catch (err) {
    return false;
  }
}

/**
 * Fetch all VCF containers with stats & filter options
 */
export async function fetchAdminVcfs(
  filterStatus: string = 'ALL',
  query: string = ''
): Promise<{ vcfs: VcfContainer[]; stats: VcfManagementStats }> {
  try {
    const url = `${API_BASE}/admin/vcfs?status=${encodeURIComponent(filterStatus)}&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: getAdminAuthHeaders() });
    const data = await res.json();
    if (data.success && Array.isArray(data.vcfs)) {
      return { vcfs: data.vcfs, stats: data.stats };
    }
  } catch (err) {}
  return {
    vcfs: [],
    stats: {
      totalVcfs: 0,
      activeVcfs: 0,
      fullVcfs: 0,
      archivedVcfs: 0,
      totalContacts: 0,
      availableCapacity: 0,
    },
  };
}

/**
 * Create a new VCF container
 */
export async function createVcfContainer(
  payload: CreateVcfPayload
): Promise<{ success: boolean; message?: string; error?: string; vcf?: VcfContainer }> {
  try {
    const res = await fetch(`${API_BASE}/admin/vcfs`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Network error while creating VCF container.' };
  }
}

/**
 * Fetch single VCF container details + assigned contacts
 */
export async function fetchVcfDetails(
  id: string,
  query: string = ''
): Promise<{ success: boolean; vcf?: VcfContainer; contacts?: Contact[]; error?: string }> {
  try {
    const url = `${API_BASE}/admin/vcfs/${id}?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, { headers: getAdminAuthHeaders() });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Network error while fetching VCF details.' };
  }
}

/**
 * Update VCF container
 */
export async function updateVcfContainer(
  id: string,
  payload: UpdateVcfPayload
): Promise<{ success: boolean; message?: string; error?: string; vcf?: VcfContainer }> {
  try {
    const res = await fetch(`${API_BASE}/admin/vcfs/${id}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Network error while updating VCF container.' };
  }
}

/**
 * Archive / Unarchive VCF container
 */
export async function archiveVcfContainer(
  id: string
): Promise<{ success: boolean; message?: string; error?: string; vcf?: VcfContainer }> {
  try {
    const res = await fetch(`${API_BASE}/admin/vcfs/${id}/archive`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Network error while archiving VCF container.' };
  }
}

/**
 * Delete VCF container
 */
export async function deleteVcfContainer(
  id: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/vcfs/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Network error while deleting VCF container.' };
  }
}

/**
 * Download VCF file for a specific VCF container
 */
export function downloadVcfContainerFile(id: string, containerName: string = 'VCF'): void {
  const url = `${API_BASE}/admin/vcfs/${id}/download-vcf`;
  
  fetch(url, { headers: getAdminAuthHeaders() })
    .then((res) => res.blob())
    .then((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      const safeName = containerName.replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `${safeName}_Contacts_${new Date().toISOString().split('T')[0]}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((err) => console.error('Failed to download container VCF:', err));
}

export function downloadVcfFile(): void {
  const url = `${API_BASE}/admin/download-vcf`;
  fetch(url, { headers: getAdminAuthHeaders() })
    .then((res) => res.blob())
    .then((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Nexus_Contacts_${new Date().toISOString().split('T')[0]}.vcf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((err) => console.error('Failed to download VCF:', err));
}

export function downloadPdfFile(): void {
  const url = `${API_BASE}/admin/download-pdf`;
  fetch(url, { headers: getAdminAuthHeaders() })
    .then((res) => res.blob())
    .then((blob) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Nexus_Contacts_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((err) => console.error('Failed to download PDF:', err));
}

export async function uploadVcfImage(
  imageBase64: string,
  filename?: string
): Promise<{ success: boolean; imageUrl?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/upload-image`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ imageBase64, filename }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Failed to upload image.' };
  }
}

export async function updateContact(
  contactId: string,
  payload: RegistrationPayload
): Promise<{ success: boolean; message?: string; error?: string; contact?: Contact; isDuplicate?: boolean }> {
  try {
    const res = await fetch(`${API_BASE}/admin/contacts/${contactId}`, {
      method: 'PUT',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Network error while updating contact.' };
  }
}

export async function deleteContact(
  contactId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${API_BASE}/admin/contacts/${contactId}`, {
      method: 'DELETE',
      headers: getAdminAuthHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Network error while deleting contact.' };
  }
}

export async function toggleContactGlobalStatus(
  contactId: string,
  includeInAllVcfs: boolean
): Promise<{ success: boolean; message?: string; error?: string; contact?: Contact }> {
  try {
    const res = await fetch(`${API_BASE}/admin/contacts/${contactId}/toggle-global`, {
      method: 'POST',
      headers: getAdminAuthHeaders(),
      body: JSON.stringify({ includeInAllVcfs }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Failed to update contact global status.' };
  }
}
