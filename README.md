# ⚡ Nexus VCF - Modern Contact Registration & Management Platform

A modern, mobile-responsive, end-to-end VCF Contact Registration and Management platform built with **React 18**, **TypeScript**, **Express**, **Supabase PostgreSQL**, **Tailwind CSS**, and modern visual aesthetics (Purple Command Center theme).

---

## 🌟 Key Features

- **Public Registration Landing Page**: Polished mobile-first UI with real-time phone number normalization (E.164) and duplicate prevention.
- **Live Contact Counter**: Dynamic counter showing total community registrations with release milestone tracking.
- **Privacy-Protected Public Directory**: Public list displaying participants with masked phone numbers (`John K. — +254 7•• ••• 123`).
- **Official Group Join Card**: Prominent card directing users to WhatsApp / Telegram for master `.VCF` file distribution.
- **Web Share & Direct Copy**: Native Web Share API integration with direct WhatsApp share preformatted links and clipboard copy fallback.
- **Administrator Support Desk**: Dedicated contact section for duplicate number inquiries and early file requests.
- **Purple Command Center Admin Dashboard**:
  - Secure password-based authentication with JWT session tokens signed with `SESSION_SECRET`.
  - Comprehensive metrics: Total contacts, Today's count, This week's count, Latest activity, Duplicates blocked.
  - Full unmasked phone number visibility for authorized administrators.
  - Server-side search & filtering across Name, Phone, and Country.
  - Full CRUD: Inline editing with re-normalization & duplicate protection, and delete modal confirmation.
  - **One-Click Export**: Download valid `.vcf` (vCard 3.0 standard) and formatted `.pdf` directory documents.

---

## 🛠️ Tech Stack & Security

- **Frontend**: React 18, TypeScript, React Router 7, Tailwind CSS, Lucide Icons.
- **Backend API**: Express.js server, Node.js.
- **Database**: Supabase PostgreSQL.
- **Phone Normalization**: `libphonenumber-js` (E.164 International Format).
- **Export Engines**: Custom vCard 3.0 serializer & PDFKit.
- **Security**: Service role key, admin password, and session secrets reside **exclusively on the server-side**. Zero secrets in browser bundles. Duplicate protection is enforced at both API level and PostgreSQL `UNIQUE` constraint level.

---

## 🚀 Getting Started

### 1. Prerequisites

- Node.js (v18 or higher recommended)
- npm, yarn, or pnpm
- A Supabase project

### 2. Installation

Clone the repository and install dependencies:

```bash
npm install
```

### 3. Environment Variables Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your secrets in `.env`:

```env
# Supabase Credentials (Required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here

# Security Secrets (Required)
ADMIN_PASSWORD=YourSecureAdminPassword2026!
SESSION_SECRET=your_super_secret_jwt_session_token_key_12345

# Public Configuration Settings
PUBLIC_GROUP_URL=https://chat.whatsapp.com/your-official-group-link
PUBLIC_ADMIN_NAME=Nexus Support Admin
PUBLIC_ADMIN_PHONE=+254712345678
PUBLIC_ADMIN_WHATSAPP=https://wa.me/254712345678

# Server Port
PORT=3001
```

> [!IMPORTANT]
> Never commit `.env` to source control. Ensure `SUPABASE_SERVICE_ROLE_KEY` and `ADMIN_PASSWORD` are never exposed to client-side code.

### 4. Supabase Database Schema Setup

1. Log into your **Supabase Dashboard**.
2. Navigate to **SQL Editor**.
3. Copy and run the contents of [schema.sql](file:///c:/Users/Admin/Desktop/Nexus-vcf/schema.sql):

```sql
-- Create Contacts Table
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    country TEXT NOT NULL,
    country_code TEXT NOT NULL,
    normalized_phone TEXT NOT NULL CONSTRAINT contacts_normalized_phone_key UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for normalized phone lookup
CREATE INDEX IF NOT EXISTS idx_contacts_normalized_phone ON public.contacts (normalized_phone);

-- Index for date sorting
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts (created_at DESC);
```

---

## 💻 Running the Application

### Development Mode

Run the Express server and Vite frontend concurrently:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3001`
- Admin Portal: `http://localhost:5173/admin`

### Building for Production

Compile TypeScript and build optimized assets:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

---

## 🔒 Admin Authentication Architecture

1. Admin accesses `/admin` and inputs the `ADMIN_PASSWORD`.
2. Server verifies password against `process.env.ADMIN_PASSWORD`.
3. Server generates a signed JWT session token using `process.env.SESSION_SECRET` with a 24-hour expiration.
4. Token is returned and stored securely in HTTP-only cookies and memory.
5. All protected endpoints (`/api/admin/*`) pass through the `requireAdminAuth` middleware.

---

## 📱 Mobile Responsiveness

The application is built with a **mobile-first** responsive design using Tailwind CSS:
- Responsive navigation with mobile hamburger drawer menu.
- Touch-friendly dropdowns and country dial code search.
- Responsive table with horizontal scrolling support and mobile card layout compatibility.
- Adaptive typography and touch targets.
