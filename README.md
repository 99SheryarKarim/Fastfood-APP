# 👑 Pizza King

Modern Pizza Ordering frontend built with Next.js 14 (App Router), Tailwind CSS, Framer Motion, and live Vapi AI voice assistant in English and Urdu.

---

## 🚀 Deploying to Vercel

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare Pizza King for Vercel deployment"
   git push origin main
   ```

2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
   - Select and import your `pizza-king` repository.

3. **Configure Environment Variables**:
   - In Vercel Project Settings > **Environment Variables**, add:
     - **Key**: `NEXT_PUBLIC_VAPI_PUBLIC_KEY`
     - **Value**: Your Public Key from [Vapi Dashboard > API Keys](https://dashboard.vapi.ai)
   - Ensure it is checked for **Production**, **Preview**, and **Development**.

4. **Deploy**:
   - Click **Deploy** (or trigger a Redeploy if already imported).
   - Once deployed, visit your Vercel URL on mobile or desktop to test the live voice assistant.

> ⚠️ **Important**: Never use your private API key in client code. Only use the Public Key.

---

## 🛠️ Local Development

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Add your Vapi Public Key to `.env.local`:
   ```env
   NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key_here
   ```
3. Run the development server:
   ```bash
   npm install
   npm run dev      # http://localhost:3000
   ```
4. Build and test production:
   ```bash
   npm run lint
   npm run build
   npm run start
   ```

Append `?debug=1` to the URL in your browser (e.g. `http://localhost:3000?debug=1`) to view live audio meters, device selection, and WebRTC event diagnostics.
