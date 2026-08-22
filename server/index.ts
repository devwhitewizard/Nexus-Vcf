import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';
import { getSupabaseServer } from '../src/lib/supabaseServer';
import {
  verifyAdminPassword,
  generateAdminSessionToken,
  requireAdminAuth,
  AuthenticatedRequest,
} from '../src/lib/adminAuth';
import { normalizePhoneNumber, maskPhoneNumber, validateRegistrationInput } from '../src/lib/validation';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Normalize req.url for Vercel Serverless Functions
app.use((req: Request, _res: Response, next) => {
  if (req.url && !req.url.startsWith('/api') && !req.url.startsWith('/_')) {
    req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
  }
  next();
});

let duplicateAttemptsCount = 0;

// -------------------------------------------------------------------
// VCF CONTAINER DB HELPERS
// -------------------------------------------------------------------

/**
 * Computes live contact count and capacity progress for a single VCF container.
 * Automatically updates status from ACTIVE -> FULL if current_count >= capacity.
 */
async function getVcfWithComputedStats(vcf: any) {
  const supabase = getSupabaseServer();
  
  // Count contacts assigned to this vcf_id
  const { count, error } = await supabase
    .from('contacts')
    .select('id', { count: 'exact', head: true })
    .eq('vcf_id', vcf.id);

  const currentCount = !error && count !== null ? count : 0;
  const capacity = Math.max(1, vcf.capacity || 500);
  const percentageFilled = Math.min(100, Number(((currentCount / capacity) * 100).toFixed(1)));
  const remainingCapacity = Math.max(0, capacity - currentCount);

  let updatedStatus = vcf.status || 'ACTIVE';

  // Automatic state transition: If ACTIVE but count reached capacity -> FULL
  if (currentCount >= capacity && updatedStatus === 'ACTIVE') {
    updatedStatus = 'FULL';
    try {
      await supabase.from('vcfs').update({ status: 'FULL' }).eq('id', vcf.id);
    } catch (_) {}
  } else if (currentCount < capacity && updatedStatus === 'FULL') {
    // If capacity was increased by admin -> reactivate to ACTIVE
    updatedStatus = 'ACTIVE';
    try {
      await supabase.from('vcfs').update({ status: 'ACTIVE' }).eq('id', vcf.id);
    } catch (_) {}
  }

  return {
    ...vcf,
    status: updatedStatus,
    current_count: currentCount,
    percentage_filled: percentageFilled,
    remaining_capacity: remainingCapacity,
  };
}

/**
 * Helper to fetch all VCF containers with live computed stats
 */
async function fetchAllVcfsDB() {
  try {
    const supabase = getSupabaseServer();
    let { data: vcfs, error } = await supabase
      .from('vcfs')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !vcfs || vcfs.length === 0) {
      // Create initial default VCF 001 if table is empty
      const defaultVcf = {
        name: 'VCF 001',
        capacity: 500,
        description: 'Initial master contact release container',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
        created_by: 'Admin',
      };

      const { data: created, error: createErr } = await supabase
        .from('vcfs')
        .insert(defaultVcf)
        .select()
        .single();

      if (!createErr && created) {
        vcfs = [created];
      } else {
        vcfs = [{ id: 'vcf-default-001', ...defaultVcf }];
      }
    }

    const computedVcfs = await Promise.all(vcfs.map((v) => getVcfWithComputedStats(v)));
    return computedVcfs;
  } catch (err) {
    console.error('[Supabase Exception] fetchAllVcfsDB:', err);
    return [];
  }
}

/**
 * Helper to fetch all contacts from Supabase
 */
async function fetchAllContactsDB() {
  try {
    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }
    return data;
  } catch (err) {
    return [];
  }
}

// -------------------------------------------------------------------
// PUBLIC ENDPOINTS
// -------------------------------------------------------------------

let siteConfig = {
  groupUrl: process.env.PUBLIC_GROUP_URL || 'https://chat.whatsapp.com/Jk88X19Kls92K109s8',
  adminName: process.env.PUBLIC_ADMIN_NAME || 'Nexus Support Team',
  adminPhone: process.env.PUBLIC_ADMIN_PHONE || '+254707848992',
  adminPhone2: process.env.PUBLIC_ADMIN_PHONE2 || '+254794171080',
  adminWhatsapp: process.env.PUBLIC_ADMIN_WHATSAPP || 'https://wa.me/254707848992',
  adminWhatsapp2: process.env.PUBLIC_ADMIN_WHATSAPP2 || 'https://wa.me/254794171080',
};

/**
 * GET /api/config
 */
app.get('/api/config', (req: Request, res: Response) => {
  res.json({
    success: true,
    ...siteConfig,
  });
});

/**
 * PUT /api/admin/config
 * Updates system configuration settings (Group URL, Admin Phone Numbers)
 */
app.put('/api/admin/config', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { groupUrl, adminName, adminPhone, adminPhone2 } = req.body;

    if (groupUrl !== undefined && groupUrl.trim()) {
      siteConfig.groupUrl = groupUrl.trim();
    }
    if (adminName !== undefined && adminName.trim()) {
      siteConfig.adminName = adminName.trim();
    }
    if (adminPhone !== undefined && adminPhone.trim()) {
      siteConfig.adminPhone = adminPhone.trim();
      const clean1 = adminPhone.replace(/[^0-9]/g, '');
      siteConfig.adminWhatsapp = `https://wa.me/${clean1}`;
    }
    if (adminPhone2 !== undefined && adminPhone2.trim()) {
      siteConfig.adminPhone2 = adminPhone2.trim();
      const clean2 = adminPhone2.replace(/[^0-9]/g, '');
      siteConfig.adminWhatsapp2 = `https://wa.me/${clean2}`;
    }

    res.json({
      success: true,
      message: 'System configuration updated successfully.',
      config: siteConfig,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update system configuration.' });
  }
});

/**
 * GET /api/status
 * Returns aggregate Directory Status metrics (Total Contacts, Remaining Slots, Max Capacity, % Full, isFull)
 */
app.get('/api/status', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseServer();
    const { count } = await supabase.from('contacts').select('*', { count: 'exact', head: true });
    const totalContacts = count || 0;

    const allVcfs = await fetchAllVcfsDB();
    let maxCapacity = 0;
    let availableSlots = 0;

    allVcfs.forEach((v) => {
      if (v.status !== 'ARCHIVED') {
        maxCapacity += v.capacity;
        if (v.status === 'ACTIVE') {
          availableSlots += v.remaining_capacity;
        }
      }
    });

    if (maxCapacity === 0) maxCapacity = 500;

    const remainingSlots = Math.max(0, availableSlots);
    const percentageFilled = Math.min(100, Math.round((totalContacts / maxCapacity) * 100));
    const activeVcfs = allVcfs.filter((v) => v.status === 'ACTIVE' && v.remaining_capacity > 0);
    const isFull = remainingSlots === 0 || activeVcfs.length === 0;

    res.json({
      success: true,
      count: totalContacts,
      status: {
        totalContacts,
        remainingSlots,
        maxCapacity,
        percentageFilled,
        isFull,
      },
    });
  } catch (err) {
    res.json({
      success: true,
      count: 0,
      status: {
        totalContacts: 0,
        remainingSlots: 500,
        maxCapacity: 500,
        percentageFilled: 0,
        isFull: false,
      },
    });
  }
});

/**
 * GET /api/count
 */
app.get('/api/count', async (req: Request, res: Response) => {
  try {
    const supabase = getSupabaseServer();
    const { count, error } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    if (!error && count !== null) {
      res.json({ success: true, count });
      return;
    }

    res.json({ success: true, count: 0 });
  } catch (err) {
    res.json({ success: true, count: 0 });
  }
});

/**
 * GET /api/contacts/public
 */
app.get('/api/contacts/public', async (req: Request, res: Response) => {
  try {
    const contacts = await fetchAllContactsDB();
    const publicList = contacts.slice(0, 50).map((c: any) => ({
      id: c.id,
      vcf_id: c.vcf_id,
      full_name: c.full_name,
      country: c.country,
      country_code: c.country_code,
      masked_phone: maskPhoneNumber(c.phone_number || c.normalized_phone),
      created_at: c.created_at,
    }));

    res.json({ success: true, contacts: publicList });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve public contact list.' });
  }
});

/**
 * POST /api/register (and /api/upload alias)
 * AUTOMATIC CONTACT-TO-VCF ASSIGNMENT LOGIC:
 * 1. Validates input & normalizes phone to E.164.
 * 2. Checks duplicate uniqueness against existing database contacts.
 * 3. Finds earliest ACTIVE VCF container with available capacity.
 * 4. Assigns contact.vcf_id = activeVcf.id.
 * 5. If contact.vcf_id assignment fills capacity -> transitions status to FULL.
 * 6. If ALL active VCF containers are FULL -> returns 422 error.
 */
const handleRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, country, countryCode, phoneNumber } = req.body;

    const validation = validateRegistrationInput({
      fullName,
      country,
      countryCode,
      phoneNumber,
    });

    if (!validation.isValid || !validation.normalizedPhone) {
      res.status(400).json({
        success: false,
        error: 'Validation failed.',
        details: validation.errors,
      });
      return;
    }

    const normalized = validation.normalizedPhone;
    const supabase = getSupabaseServer();

    // 1. Automatic VCF Assignment - Find target ACTIVE VCF container
    const allVcfs = await fetchAllVcfsDB();
    const activeVcfs = allVcfs.filter((v) => v.status === 'ACTIVE' && v.remaining_capacity > 0);

    if (activeVcfs.length === 0) {
      res.status(422).json({
        success: false,
        error: 'All VCF containers are currently FULL. Registration is temporarily closed until a new VCF is created by the admin.',
        noAvailableVcf: true,
      });
      return;
    }

    const targetVcf = activeVcfs[0]; // Earliest active VCF container with capacity

    // 2. Check duplicate phone number in target VCF container
    const { data: existing } = await supabase
      .from('contacts')
      .select('id')
      .eq('vcf_id', targetVcf.id)
      .eq('normalized_phone', normalized)
      .maybeSingle();

    if (existing) {
      duplicateAttemptsCount++;
      res.status(409).json({
        success: false,
        error: `This phone number is already registered in ${targetVcf.name}.`,
        isDuplicate: true,
      });
      return;
    }

    // 3. Create Contact Record
    const newRecord = {
      vcf_id: targetVcf.id,
      full_name: fullName.trim(),
      phone_number: phoneNumber.trim(),
      country: country.trim(),
      country_code: (countryCode || 'US').toUpperCase(),
      normalized_phone: normalized,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: insertedData, error } = await supabase
      .from('contacts')
      .insert(newRecord)
      .select()
      .single();

    if (error) {
      if (error.code === '23505' || error.message?.includes('unique') || error.message?.includes('duplicate')) {
        duplicateAttemptsCount++;
        res.status(409).json({
          success: false,
          error: 'This number is already registered.',
          isDuplicate: true,
        });
        return;
      }
      console.error('[Supabase Register Error]:', error);
      res.status(500).json({
        success: false,
        error: `Database registration error: ${error.message || 'Check Supabase table schema.'}`,
      });
      return;
    }

    // 4. Check if target VCF has reached full capacity after this insertion
    const updatedTarget = await getVcfWithComputedStats(targetVcf);
    if (updatedTarget.current_count >= targetVcf.capacity) {
      await supabase.from('vcfs').update({ status: 'FULL' }).eq('id', targetVcf.id);
    }

    // Get total exact contact count
    let currentCount = 1;
    const { count } = await supabase.from('contacts').select('*', { count: 'exact', head: true });
    if (count !== null) currentCount = count;

    res.status(201).json({
      success: true,
      message: `Registration successful! Assigned to ${targetVcf.name}.`,
      contact: insertedData,
      assignedVcf: targetVcf.name,
      totalCount: currentCount,
    });
  } catch (err: any) {
    console.error('Registration API Error:', err);
    res.status(500).json({ success: false, error: 'Internal server error during registration.' });
  }
};

app.post('/api/register', handleRegister);
app.post('/api/upload', handleRegister);

// -------------------------------------------------------------------
// ADMIN ENDPOINTS (AUTH & VCF CONTAINER MANAGEMENT)
// -------------------------------------------------------------------

app.post(['/api/admin/login', '/admin/login'], (req: Request, res: Response): void => {
  try {
    const { password } = req.body || {};

    if (!password) {
      res.status(400).json({ success: false, error: 'Please enter the admin password.' });
      return;
    }

    if (!verifyAdminPassword(password)) {
      res.status(401).json({ success: false, error: 'Invalid admin password.' });
      return;
    }

    const token = generateAdminSessionToken();

    res.cookie('nexus_admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      message: 'Admin authentication successful.',
    });
  } catch (err: any) {
    console.error('Login Endpoint Exception:', err);
    res.status(500).json({ success: false, error: `Login error: ${err?.message || 'Server error'}` });
  }
});

app.post('/api/admin/logout', (req: Request, res: Response) => {
  res.clearCookie('nexus_admin_session');
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.get('/api/admin/me', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, admin: true, payload: req.adminPayload });
});

/**
 * GET /api/admin/vcfs
 * Returns all VCF containers with computed stats, overview metrics, and filter options
 */
app.get('/api/admin/vcfs', requireAdminAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const filterStatus = (req.query.status || 'ALL').toString().toUpperCase();
    const query = (req.query.q || '').toString().trim().toLowerCase();

    let vcfs = await fetchAllVcfsDB();

    if (filterStatus !== 'ALL') {
      vcfs = vcfs.filter((v) => v.status === filterStatus);
    }

    if (query) {
      vcfs = vcfs.filter(
        (v) =>
          v.name.toLowerCase().includes(query) ||
          (v.description && v.description.toLowerCase().includes(query))
      );
    }

    // Compute Overall VCF Management Stats
    const allVcfs = await fetchAllVcfsDB();
    const totalVcfs = allVcfs.length;
    const activeVcfs = allVcfs.filter((v) => v.status === 'ACTIVE').length;
    const fullVcfs = allVcfs.filter((v) => v.status === 'FULL').length;
    const archivedVcfs = allVcfs.filter((v) => v.status === 'ARCHIVED').length;
    
    let totalContacts = 0;
    let availableCapacity = 0;

    allVcfs.forEach((v) => {
      totalContacts += v.current_count;
      if (v.status === 'ACTIVE') {
        availableCapacity += v.remaining_capacity;
      }
    });

    res.json({
      success: true,
      vcfs,
      stats: {
        totalVcfs,
        activeVcfs,
        fullVcfs,
        archivedVcfs,
        totalContacts,
        availableCapacity,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve VCF containers.' });
  }
});

/**
 * POST /api/admin/vcfs
 * Creates a new VCF container (validates capacity > 0)
 */
app.post('/api/admin/vcfs', requireAdminAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, capacity, imageUrl, description, namePrefix, nameSuffix } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, error: 'VCF name is required.' });
      return;
    }

    const capNum = Number(capacity);
    if (isNaN(capNum) || capNum <= 0) {
      res.status(400).json({ success: false, error: 'Maximum capacity must be a positive number greater than 0.' });
      return;
    }

    const supabase = getSupabaseServer();

    const newVcf = {
      name: name.trim(),
      capacity: capNum,
      image_url: imageUrl ? imageUrl.trim() : null,
      description: description ? description.trim() : null,
      name_prefix: namePrefix !== undefined ? namePrefix : '🩸🩸 ',
      name_suffix: nameSuffix !== undefined ? nameSuffix : null,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      created_by: 'Admin',
    };

    const { data, error } = await supabase
      .from('vcfs')
      .insert(newVcf)
      .select()
      .single();

    if (error) {
      console.error('[Supabase Create VCF Error]:', error);
      res.status(500).json({ success: false, error: `Failed to create VCF: ${error.message}` });
      return;
    }

    const computed = await getVcfWithComputedStats(data);

    res.status(201).json({
      success: true,
      message: `VCF container '${computed.name}' created successfully.`,
      vcf: computed,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error while creating VCF.' });
  }
});

/**
 * GET /api/admin/vcfs/:id
 * Returns details for a single VCF container + assigned contacts
 */
app.get('/api/admin/vcfs/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const query = (req.query.q || '').toString().trim().toLowerCase();

    const supabase = getSupabaseServer();
    const { data: vcf, error } = await supabase.from('vcfs').select('*').eq('id', id).single();

    if (error || !vcf) {
      res.status(404).json({ success: false, error: 'VCF container not found.' });
      return;
    }

    const computedVcf = await getVcfWithComputedStats(vcf);

    // Fetch contacts assigned to this vcf_id
    let { data: contacts } = await supabase
      .from('contacts')
      .select('*')
      .eq('vcf_id', id)
      .order('created_at', { ascending: false });

    contacts = contacts || [];

    if (query) {
      contacts = contacts.filter(
        (c: any) =>
          c.full_name.toLowerCase().includes(query) ||
          c.phone_number.toLowerCase().includes(query) ||
          c.normalized_phone.toLowerCase().includes(query) ||
          c.country.toLowerCase().includes(query)
      );
    }

    res.json({
      success: true,
      vcf: computedVcf,
      contactsCount: contacts.length,
      contacts,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve VCF details.' });
  }
});

/**
 * PUT /api/admin/vcfs/:id
 * Updates VCF container name, capacity, description, or image
 */
app.put('/api/admin/vcfs/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, capacity, imageUrl, description, status, namePrefix, nameSuffix } = req.body;

    const supabase = getSupabaseServer();
    const { data: existingVcf } = await supabase.from('vcfs').select('*').eq('id', id).single();

    if (!existingVcf) {
      res.status(404).json({ success: false, error: 'VCF container not found.' });
      return;
    }

    // Get current contact count for capacity reduction check
    const computedExisting = await getVcfWithComputedStats(existingVcf);

    const newCap = capacity !== undefined ? Number(capacity) : existingVcf.capacity;
    if (isNaN(newCap) || newCap <= 0) {
      res.status(400).json({ success: false, error: 'Capacity must be greater than 0.' });
      return;
    }

    if (newCap < computedExisting.current_count) {
      res.status(400).json({
        success: false,
        error: `Cannot reduce capacity to ${newCap} because this VCF already has ${computedExisting.current_count} contacts assigned.`,
      });
      return;
    }

    let targetStatus = status || existingVcf.status;
    if (computedExisting.current_count >= newCap && targetStatus === 'ACTIVE') {
      targetStatus = 'FULL';
    } else if (computedExisting.current_count < newCap && targetStatus === 'FULL') {
      targetStatus = 'ACTIVE';
    }

    const updates = {
      name: name !== undefined ? name.trim() : existingVcf.name,
      capacity: newCap,
      image_url: imageUrl !== undefined ? imageUrl : existingVcf.image_url,
      description: description !== undefined ? description : existingVcf.description,
      name_prefix: namePrefix !== undefined ? namePrefix : existingVcf.name_prefix,
      name_suffix: nameSuffix !== undefined ? nameSuffix : existingVcf.name_suffix,
      status: targetStatus,
    };

    const { data: updated, error } = await supabase
      .from('vcfs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(500).json({ success: false, error: `Failed to update VCF: ${error.message}` });
      return;
    }

    const finalComputed = await getVcfWithComputedStats(updated);

    res.json({
      success: true,
      message: 'VCF container updated successfully.',
      vcf: finalComputed,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update VCF container.' });
  }
});

/**
 * POST /api/admin/vcfs/:id/archive
 * Archives a VCF container
 */
app.post('/api/admin/vcfs/:id/archive', requireAdminAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseServer();

    const { data: vcf } = await supabase.from('vcfs').select('status').eq('id', id).single();
    if (!vcf) {
      res.status(404).json({ success: false, error: 'VCF container not found.' });
      return;
    }

    const newStatus = vcf.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';

    const { data: updated, error } = await supabase
      .from('vcfs')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(500).json({ success: false, error: 'Failed to update VCF status.' });
      return;
    }

    const computed = await getVcfWithComputedStats(updated);

    res.json({
      success: true,
      message: `VCF container status updated to ${newStatus}.`,
      vcf: computed,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to archive VCF.' });
  }
});

/**
 * DELETE /api/admin/vcfs/:id
 * Deletes a VCF container and unassigns contacts
 */
app.delete('/api/admin/vcfs/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseServer();

    // Delete VCF record
    const { error } = await supabase.from('vcfs').delete().eq('id', id);
    if (error) {
      res.status(500).json({ success: false, error: `Failed to delete VCF: ${error.message}` });
      return;
    }

    res.json({ success: true, message: 'VCF container deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete VCF container.' });
  }
});

/**
 * GET /api/admin/vcfs/:id/download-vcf
 * Generates and downloads .vcf vCard file specifically for contacts in a specific VCF container
 */
app.get('/api/admin/vcfs/:id/download-vcf', requireAdminAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseServer();

    const { data: vcf } = await supabase.from('vcfs').select('*').eq('id', id).single();
    
    // 1. Fetch contacts assigned strictly to this VCF container
    const { data: assignedContacts } = await supabase
      .from('contacts')
      .select('*')
      .eq('vcf_id', id)
      .order('created_at', { ascending: true });

    // 2. Fetch contacts marked to be included in ALL VCFs (Global Contacts)
    const { data: globalContacts } = await supabase
      .from('contacts')
      .select('*')
      .eq('include_in_all_vcfs', true)
      .order('created_at', { ascending: true });

    // Combine and deduplicate contacts by normalized_phone
    const seenPhones = new Set<string>();
    const exportContacts: any[] = [];

    (assignedContacts || []).forEach((c: any) => {
      if (!seenPhones.has(c.normalized_phone)) {
        seenPhones.add(c.normalized_phone);
        exportContacts.push(c);
      }
    });

    (globalContacts || []).forEach((c: any) => {
      if (!seenPhones.has(c.normalized_phone)) {
        seenPhones.add(c.normalized_phone);
        exportContacts.push(c);
      }
    });

    const containerName = vcf ? vcf.name.replace(/[^a-zA-Z0-9_-]/g, '_') : 'VCF';
    const filename = `${containerName}_Contacts_${new Date().toISOString().split('T')[0]}.vcf`;

    const prefix = vcf?.name_prefix ?? '';
    const suffix = vcf?.name_suffix ?? '';

    let vcfContent = '';
    exportContacts.forEach((c: any) => {
      const formattedName = `${prefix}${c.full_name}${suffix}`;
      vcfContent += `BEGIN:VCARD\r\n`;
      vcfContent += `VERSION:3.0\r\n`;
      vcfContent += `FN:${formattedName}\r\n`;
      vcfContent += `N:;${formattedName};;;\r\n`;
      vcfContent += `TEL;TYPE=CELL:${c.normalized_phone || c.phone_number}\r\n`;
      vcfContent += `NOTE:Registered via Nexus VCF [${vcf?.name || 'Batch'}] (${c.country})\r\n`;
      vcfContent += `END:VCARD\r\n\r\n`;
    });

    res.setHeader('Content-Type', 'text/vcard; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(vcfContent);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to generate VCF export file.' });
  }
});

/**
 * PUT /api/admin/contacts/:id
 * Updates a contact's details (name, phone, country, etc.)
 */
app.put('/api/admin/contacts/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { fullName, phoneNumber, country, countryCode } = req.body;
    const supabase = getSupabaseServer();

    const validation = validateRegistrationInput({ fullName, country, countryCode, phoneNumber });
    if (!validation.isValid || !validation.normalizedPhone) {
      res.status(400).json({ success: false, error: 'Validation failed.', details: validation.errors });
      return;
    }

    const { data: existing } = await supabase.from('contacts').select('vcf_id, normalized_phone').eq('id', id).single();
    if (!existing) {
      res.status(404).json({ success: false, error: 'Contact not found.' });
      return;
    }

    // Check per-VCF uniqueness if phone changed
    if (validation.normalizedPhone !== existing.normalized_phone && existing.vcf_id) {
      const { data: dup } = await supabase
        .from('contacts')
        .select('id')
        .eq('vcf_id', existing.vcf_id)
        .eq('normalized_phone', validation.normalizedPhone)
        .neq('id', id)
        .maybeSingle();
      if (dup) {
        res.status(409).json({ success: false, error: 'This phone number already exists in this VCF container.', isDuplicate: true });
        return;
      }
    }

    const { data: updated, error } = await supabase
      .from('contacts')
      .update({
        full_name: fullName.trim(),
        phone_number: phoneNumber.trim(),
        country: country.trim(),
        country_code: (countryCode || 'US').toUpperCase(),
        normalized_phone: validation.normalizedPhone,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        res.status(409).json({ success: false, error: 'This phone number already exists in this VCF container.', isDuplicate: true });
        return;
      }
      res.status(500).json({ success: false, error: `Failed to update contact: ${error.message}` });
      return;
    }

    res.json({ success: true, message: 'Contact updated successfully.', contact: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error while updating contact.' });
  }
});

/**
 * DELETE /api/admin/contacts/:id
 * Deletes a contact record
 */
app.delete('/api/admin/contacts/:id', requireAdminAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supabase = getSupabaseServer();

    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (error) {
      res.status(500).json({ success: false, error: `Failed to delete contact: ${error.message}` });
      return;
    }

    res.json({ success: true, message: 'Contact deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error while deleting contact.' });
  }
});

/**
 * POST /api/admin/contacts/:id/toggle-global
 * Toggles whether a contact is included in every VCF container export file (include_in_all_vcfs)
 */
app.post('/api/admin/contacts/:id/toggle-global', requireAdminAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { includeInAllVcfs } = req.body;
    const supabase = getSupabaseServer();

    const { data: updated, error } = await supabase
      .from('contacts')
      .update({ include_in_all_vcfs: Boolean(includeInAllVcfs) })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      res.status(500).json({ success: false, error: `Failed to update contact: ${error.message}` });
      return;
    }

    res.json({
      success: true,
      message: `Contact updated. Global inclusion set to ${updated.include_in_all_vcfs}.`,
      contact: updated,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to toggle global contact status.' });
  }
});

/**
 * POST /api/admin/upload-image
 * Handles image upload to Supabase storage bucket `vcf-images` or base64 storage
 */
app.post('/api/admin/upload-image', requireAdminAuth, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { imageBase64, filename } = req.body;

    if (!imageBase64) {
      res.status(400).json({ success: false, error: 'No image data provided.' });
      return;
    }

    const supabase = getSupabaseServer();
    const buffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const safeFilename = `${Date.now()}_${(filename || 'cover.jpg').replace(/[^a-zA-Z0-9_.-]/g, '_')}`;

    try {
      const { data, error } = await supabase.storage
        .from('vcf-images')
        .upload(safeFilename, buffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from('vcf-images').getPublicUrl(safeFilename);
        res.json({ success: true, imageUrl: publicUrlData.publicUrl });
        return;
      }
    } catch (_) {}

    // Fallback: return data URL
    res.json({ success: true, imageUrl: imageBase64 });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to process image upload.' });
  }
});

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`⚡ Nexus VCF Backend API Server running on port ${PORT}`);
  });
}
