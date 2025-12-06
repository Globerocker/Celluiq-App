# CELLUIQ - Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
Copy `.env.local` and add your Supabase credentials:
```
VITE_SUPABASE_URL=https://evutidxtftmvvfmnnngk.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Run Dev Server
```bash
npm run dev
```

Visit: http://localhost:5173

## 📁 Project Structure

```
celluiq/
├── src/
│   ├── pages/          # Landing, Onboarding, Upload, Dashboard
│   ├── lib/            # AuthContext, Supabase client
│   └── components/     # UI components
├── Database/           # CSV data files
├── scripts/            # Import scripts & SQL
├── docs/              # Documentation
└── supabase-schema.sql # Main database schema
```

## 🗄️ Database Setup

1. Go to Supabase SQL Editor
2. Run `supabase-schema.sql`
3. Run `scripts/supabase-reference-tables-with-constraints.sql`
4. Import data (see docs/BLOOD_MARKERS_IMPORT.md)

## 📚 Documentation

- **Import Guide**: `docs/BLOOD_MARKERS_IMPORT.md`
- **n8n Setup**: `docs/N8N_SETUP.md`
- **Google Sheets Sync**: `docs/GOOGLE_SHEETS_SYNC.md`

## ✅ Current Status

- ✅ App running with Supabase
- ✅ Landing, Onboarding, Upload, Dashboard pages
- ✅ Google Auth ready
- ⏳ Blood markers data import pending
- ⏳ Supplements & Foods data pending
