---
description: How to deploy the booking site to Netlify
---

# Deploy Booking Site to Netlify

## Option A: Deploy via Netlify Web UI (Recommended)

1. Go to [https://app.netlify.com](https://app.netlify.com) and log in

2. Click **"Add new site"** → **"Import an existing project"**

3. Connect your Git provider (GitHub/GitLab/Bitbucket)

4. Select the **Hotel-Mgmt** repository

5. Configure build settings:
   - **Base directory**: `apps/booking`
   - **Build command**: `npm run build`
   - **Publish directory**: `apps/booking/dist`

6. Add environment variables (under **Site settings > Environment variables**):
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - Any Razorpay keys if using payments

7. Click **"Deploy site"**

---

## Option B: Deploy via CLI (Manual Upload)

// turbo
1. Build the app:
```bash
cd /Users/sreyansusekharmohanty/Desktop/Hotel-Mgmt/apps/booking
npm run build
```

2. Deploy to Netlify:
```bash
npx -y netlify-cli deploy --prod --dir=dist
```
   - If prompted to link a site, choose "Create & configure a new site"
   - Follow the authentication flow if needed

---

## Post-Deployment

1. **Set environment variables** in Netlify dashboard:
   - Go to: Site settings → Environment variables
   - Add your Supabase and payment keys

2. **Configure redirects** (for SPA routing):
   Create `public/_redirects` with:
   ```
   /* /index.html 200
   ```

3. **Custom domain** (optional):
   - Go to: Domain settings → Add custom domain
