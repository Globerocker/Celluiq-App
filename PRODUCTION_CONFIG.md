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

## 4. SMTP (Optional aber empfohlen)
Damit Emails (z.B. Passwort Reset) von `noreply@celluiq.com` kommen statt von Supabase.

1. [Supabase Dashboard > Settings > SMTP](https://supabase.com/dashboard/project/evutidxtftmvvfmnnngk/settings/auth)
2. Aktiviere "Enable Custom SMTP".
3. Trage deine SMTP-Daten ein (z.B. von deinem Email-Provider).

---
✅ **Fertig!** Deine App ist jetzt Full-Production Ready.
