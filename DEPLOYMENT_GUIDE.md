# 🚀 CELLUIQ Production Deployment Guide

## Übersicht

Diese Anleitung zeigt dir, wie du CELLUIQ auf einer Subdomain (z.B. `app.celluiq.com`) live schaltest.

## Option 1: Vercel (Empfohlen - Am Einfachsten)

### Warum Vercel?
- ✅ **Kostenlos** für Hobby-Projekte
- ✅ **Automatische Deployments** bei Git Push
- ✅ **Custom Domain** Support
- ✅ **SSL** automatisch
- ✅ **CDN** weltweit
- ✅ **Zero Config** für Vite

### Schritt 1: GitHub Repository erstellen

```bash
cd "/Users/andreschuler/APP CELLUIQ/celluiq"

# Git initialisieren (falls noch nicht geschehen)
git init

# .gitignore erstellen
cat > .gitignore << 'EOF'
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage

# Production
build
dist

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode
.idea

# Python
__pycache__
*.pyc
.venv

# Database
*.db
*.sqlite
EOF

# Alle Dateien hinzufügen
git add .
git commit -m "Initial commit - CELLUIQ Production Ready"

# GitHub Repo erstellen (im Browser)
# Dann:
git remote add origin https://github.com/DEIN_USERNAME/celluiq.git
git branch -M main
git push -u origin main
```

### Schritt 2: Vercel Account & Deployment

1. **Vercel Account erstellen**
   - Gehe zu: https://vercel.com/signup
   - Melde dich mit GitHub an

2. **Neues Projekt**
   - Klicke "Add New" → "Project"
   - Wähle dein `celluiq` Repository
   - Klicke "Import"

3. **Environment Variables konfigurieren**
   ```
   VITE_SUPABASE_URL=https://evutidxtftmvvfmnnngk.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2dXRpZHh0ZnRtdnZmbW5ubmdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1MDU3NzIsImV4cCI6MjA0OTA4MTc3Mn0.sb_publishable_7IN6FxtxbMQR4gBOaIcv6w_F20o7UmH
   ```

4. **Deploy!**
   - Klicke "Deploy"
   - Warte ~2 Minuten
   - ✅ Deine App ist live!

### Schritt 3: Custom Domain einrichten

1. **Domain hinzufügen**
   - Vercel Dashboard → Dein Projekt → Settings → Domains
   - Klicke "Add"
   - Gib ein: `app.celluiq.com`

2. **DNS konfigurieren**
   - Gehe zu deinem Domain-Provider (z.B. Namecheap, GoDaddy, Cloudflare)
   - Füge einen CNAME Record hinzu:
     ```
     Type: CNAME
     Name: app
     Value: cname.vercel-dns.com
     TTL: 3600
     ```

3. **Warten**
   - DNS Propagation dauert 5-60 Minuten
   - Vercel zeigt dir den Status

4. **SSL**
   - Wird automatisch von Vercel eingerichtet
   - Dauert ~5 Minuten nach DNS Propagation

### Schritt 4: Supabase URLs aktualisieren

1. **Supabase Dashboard**
   - Gehe zu: https://supabase.com/dashboard/project/evutidxtftmvvfmnnngk/auth/url-configuration

2. **Site URL**
   ```
   https://app.celluiq.com
   ```

3. **Redirect URLs**
   ```
   https://app.celluiq.com/**
   http://localhost:5173/**
   ```

4. **Google OAuth**
   - Google Cloud Console → Credentials
   - Authorized redirect URIs:
     ```
     https://evutidxtftmvvfmnnngk.supabase.co/auth/v1/callback
     ```
   - Authorized JavaScript origins:
     ```
     https://app.celluiq.com
     ```

## Option 2: Netlify (Alternative)

### Ähnlich wie Vercel

1. **Netlify Account**: https://netlify.com
2. **GitHub Repo verbinden**
3. **Build Settings**:
   ```
   Build Command: npm run build
   Publish Directory: dist
   ```
4. **Environment Variables** hinzufügen
5. **Custom Domain** einrichten

## Option 3: Eigener Server (VPS)

### Für mehr Kontrolle

1. **VPS mieten** (z.B. Hetzner, DigitalOcean)
2. **Server Setup**:
   ```bash
   # Node.js installieren
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # PM2 installieren
   sudo npm install -g pm2

   # Nginx installieren
   sudo apt install nginx

   # Certbot für SSL
   sudo apt install certbot python3-certbot-nginx
   ```

3. **App deployen**:
   ```bash
   # Build lokal
   npm run build

   # Upload zu Server (via SCP/SFTP)
   scp -r dist/* user@your-server:/var/www/celluiq

   # Nginx konfigurieren
   sudo nano /etc/nginx/sites-available/celluiq
   ```

4. **Nginx Config**:
   ```nginx
   server {
       listen 80;
       server_name app.celluiq.com;
       root /var/www/celluiq;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

5. **SSL einrichten**:
   ```bash
   sudo certbot --nginx -d app.celluiq.com
   ```

## Nach dem Deployment

### 1. Testen
- [ ] Landing Page lädt
- [ ] Onboarding funktioniert
- [ ] Google Login funktioniert
- [ ] Upload funktioniert
- [ ] Dashboard zeigt Daten

### 2. Monitoring
- Vercel Analytics (automatisch)
- Supabase Dashboard für DB Queries
- Google Analytics (optional)

### 3. Updates deployen
```bash
# Änderungen machen
git add .
git commit -m "Update: ..."
git push

# Vercel deployt automatisch!
```

## Troubleshooting

### "Page not found" nach Deployment
- Prüfe Build Logs in Vercel
- Stelle sicher dass `dist` Ordner erstellt wird

### Google Login funktioniert nicht
- Prüfe Redirect URLs in Supabase
- Prüfe Google OAuth Credentials

### Environment Variables fehlen
- Prüfe Vercel → Settings → Environment Variables
- Neu deployen nach Änderungen

## Performance Optimierung

### 1. Bilder optimieren
```bash
npm install vite-plugin-imagemin -D
```

### 2. Code Splitting
- Bereits aktiviert durch Vite

### 3. Caching
- Automatisch durch Vercel CDN

## Kosten

### Vercel Free Tier
- ✅ 100 GB Bandwidth/Monat
- ✅ Unlimited Deployments
- ✅ Unlimited Domains
- ✅ SSL inklusive

### Supabase Free Tier
- ✅ 500 MB Database
- ✅ 1 GB File Storage
- ✅ 50,000 Monthly Active Users
- ✅ 2 GB Bandwidth

**Für die ersten Monate komplett kostenlos!**

## Next Steps

1. ✅ App deployen
2. ✅ Mit echten Usern testen
3. ✅ Feedback sammeln
4. ✅ Iterieren & verbessern
5. ✅ Analytics einrichten
6. ✅ SEO optimieren

## Support

Bei Problemen:
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Vite Docs: https://vitejs.dev
