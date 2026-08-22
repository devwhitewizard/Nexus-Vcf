-- SQL Script to set up Nexus VCF Containers and Contacts Database in Supabase PostgreSQL

-- Create extension for UUID generation if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create VCF Containers Table
CREATE TABLE IF NOT EXISTS public.vcfs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    image_url TEXT,
    description TEXT,
    name_prefix TEXT DEFAULT '🩸🩸 ',
    name_suffix TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'FULL', 'ARCHIVED')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by TEXT DEFAULT 'Admin'
);

-- Add name_prefix / name_suffix columns if vcfs table already exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vcfs' AND column_name='name_prefix') THEN
        ALTER TABLE public.vcfs ADD COLUMN name_prefix TEXT DEFAULT '🩸🩸 ';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vcfs' AND column_name='name_suffix') THEN
        ALTER TABLE public.vcfs ADD COLUMN name_suffix TEXT;
    END IF;
END $$;

-- 2. Create Contacts Table referencing vcfs(id)
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vcf_id UUID REFERENCES public.vcfs(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    country TEXT NOT NULL,
    country_code TEXT NOT NULL,
    normalized_phone TEXT NOT NULL,
    email TEXT,
    organization TEXT,
    notes TEXT,
    include_in_all_vcfs BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT contacts_vcf_phone_unique UNIQUE (vcf_id, normalized_phone)
);

-- Add include_in_all_vcfs column if contacts table already exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='vcf_id') THEN
        ALTER TABLE public.contacts ADD COLUMN vcf_id UUID REFERENCES public.vcfs(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='include_in_all_vcfs') THEN
        ALTER TABLE public.contacts ADD COLUMN include_in_all_vcfs BOOLEAN NOT NULL DEFAULT FALSE;
    END IF;
END $$;

-- 3. Create Indices for Performance
CREATE INDEX IF NOT EXISTS idx_vcfs_status ON public.vcfs (status);
CREATE INDEX IF NOT EXISTS idx_vcfs_created_at ON public.vcfs (created_at ASC);
CREATE INDEX IF NOT EXISTS idx_contacts_vcf_id ON public.contacts (vcf_id);
CREATE INDEX IF NOT EXISTS idx_contacts_normalized_phone ON public.contacts (normalized_phone);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts (created_at DESC);

-- 4. Automatically insert initial default VCF container if none exists
INSERT INTO public.vcfs (name, capacity, description, status)
SELECT 'VCF 001', 500, 'Initial master contact release container', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM public.vcfs);

-- 5. Trigger to automatically update updated_at timestamp on contact edit
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_contacts_updated_at ON public.contacts;

CREATE TRIGGER update_contacts_updated_at
BEFORE UPDATE ON public.contacts
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 6. Row Level Security (RLS) Policies
ALTER TABLE public.vcfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow Public Access VCFs" ON public.vcfs;
CREATE POLICY "Allow Public Access VCFs" ON public.vcfs
    FOR ALL
    TO public, anon, authenticated, service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Public Access Contacts" ON public.contacts;
CREATE POLICY "Allow Public Access Contacts" ON public.contacts
    FOR ALL
    TO public, anon, authenticated, service_role
    USING (true)
    WITH CHECK (true);

-- Grant Table Permissions
GRANT ALL ON public.vcfs TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.contacts TO postgres, anon, authenticated, service_role;
