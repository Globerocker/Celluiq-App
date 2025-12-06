# Production Configuration Guide

Damit deine App unter `app.celluiq.com` professionell läuft, arbeite diese Liste ab.

## 1. Google Cloud Console (Branding & Sicherheit)
Damit im Login-Fenster "Celluiq" statt der Supabase-URL steht.

1. Gehe zu: [Google Cloud Console](https://console.cloud.google.com/apis/credentials/consent)
2. Wähle dein Projekt.
3. **OAuth consent screen** > **Edit App**:
   - **App name**: `Celluiq`
   - **App logo**: Dein Logo hochladen (baut Vertrauen auf).
   - **User support email**: Deine Email.
   - **Authorized domains**: `celluiq.com` hinzufügen.
   - **Application home page**: `https://app.celluiq.com`
   - **Privacy policy link**: `https://celluiq.com/privacy` (falls vorhanden)
   - Klicke **Save**.

4. Gehe zu **Credentials** > Wähle deine **Client ID**:
   - **Authorized JavaScript origins**: 
     - `https://app.celluiq.com` hinzufügen.
     - (Lass `http://localhost:5173` für Tests stehen).
   - **Speichern**.

## 2. Supabase (Weiterleitungen)
Damit User nach dem Login auf der richtigen Seite landen.

1. Gehe zu: [Supabase Dashboard > Auth > URL Configuration](https://supabase.com/dashboard/project/evutidxtftmvvfmnnngk/auth/url-configuration)
2. **Site URL**: `https://app.celluiq.com`
3. **Redirect URLs** (Füge alle hinzu):
   - `http://localhost:5173/**` (für lokale Entwicklung)
   - `https://app.celluiq.com/**` (für Production)
4. **Speichern**.

## 3. Vercel (Domain & Deployment)
1. Gehe zu deinem Projekt auf Vercel.
2. **Settings** > **Domains**.
3. Gib `app.celluiq.com` ein und klicke Add.
4. Vercel zeigt dir DNS-Einträge (meistens ein CNAME record auf `cname.vercel-dns.com`).
5. Gehe zu deinem Domain-Host (z.B. GoDaddy, Namecheap) und trage den CNAME ein.

## 4. SMTP (Emails via Cloudflare Domain)
Wenn du Cloudflare nutzt, brauchst du trotzdem einen **Email-Versand-Dienst** (SMTP Provider), da Cloudflare selbst nur DNS macht.

**Empfehlung: Resend (Kostenlos bis 3000 Mails/Monat & sehr einfach)**

1. Gehe zu [Resend.com](https://resend.com) und erstelle einen Account.
2. Füge deine Domain hinzu (`celluiq.com`).
3. Resend gibt dir 3 DNS Einträge (MX, TXT).
4. **Gehe zu Cloudflare**:
   - Wähle deine Domain.
   - Gehe zu **DNS** > **Records**.
   - Trage die Einträge von Resend ein.
   - Wichtig: Schalte den "Proxy Status" (orange Wolke) für diese Einträge auf **DNS Only** (graue Wolke), falls möglich (bei TXT automatisch).

5. **Erstelle API Key in Resend**:
   - Erstelle einen Key mit "Sending access".

6. **In Supabase eintragen**:
   - Gehe zu Settings > SMTP.
   - Enable Custom SMTP.
   - Host: `smtp.resend.com`
   - Port: `465`
   - User: `resend`
   - Password: `[DEIN_RESEND_API_KEY]`
   - Sender Email: `noreply@celluiq.com`
   - Sender Name: `Celluiq`

---
✅ **Fertig!** Deine App ist jetzt Full-Production Ready.
