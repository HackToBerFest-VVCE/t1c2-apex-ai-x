# 🚀 SignalMesh AI - Deployment Instructions

**Status**: Ready for deployment to Vercel + Render  
**Date**: October 27, 2026

---

## 📋 Prerequisites

1. GitHub account (already connected to your repo)
2. Render account (sign up at https://render.com)
3. Vercel account (sign up at https://vercel.com)
4. Your Snowflake password

---

## Part 1: Deploy Backend to Render ⚙️

### Step 1: Create Render Account
1. Go to: https://render.com
2. Click **"Get Started"**
3. Sign in with **GitHub**
4. Authorize Render to access your repositories

### Step 2: Create Web Service
1. Click **"New +"** (top right)
2. Select **"Web Service"**
3. Connect your repository: **`HackToBerFest-VVCE/t1c2-apex-ai-x`**
4. Click **"Connect"**

### Step 3: Configure Service
Fill in these settings:

**Basic Settings:**
- **Name**: `signalmesh-ai-backend`
- **Region**: Singapore (or closest to you)
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Instance Type:**
- Select: **Free** (or paid if you want better performance)

### Step 4: Environment Variables
Click **"Advanced"** → Scroll to **"Environment Variables"**

Add these **one by one** (click "+ Add Environment Variable" for each):

```
SNOWFLAKE_ACCOUNT
hz93433.ap-southeast-7.aws

SNOWFLAKE_USERNAME
kushalmys55@gmail.com

SNOWFLAKE_PASSWORD
<YOUR_SNOWFLAKE_PASSWORD_HERE>

SNOWFLAKE_WAREHOUSE
SNOWFLAKE_LEARNING_WH

SNOWFLAKE_DATABASE
SIGNALMESH_AI

SNOWFLAKE_SCHEMA
DISASTER_RISK

NODE_ENV
production

PORT
5000

CORS_ORIGIN
*
```

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for deployment
3. **Copy your backend URL** (will look like): `https://signalmesh-ai-backend.onrender.com`

### Step 6: Test Backend
Once deployed, test it:
```bash
curl https://signalmesh-ai-backend.onrender.com/health
```

Should return JSON with `"status": "ok"`

✅ **Backend deployment complete!**

---

## Part 2: Deploy Frontend to Vercel 🌐

### Step 1: Create Vercel Account
1. Go to: https://vercel.com
2. Click **"Sign Up"**
3. Sign in with **GitHub**
4. Authorize Vercel

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Find and select: **`HackToBerFest-VVCE/t1c2-apex-ai-x`**
3. Click **"Import"**

### Step 3: Configure Project
**Framework Preset**: 
- Should auto-detect as **"Create React App"** ✅

**Root Directory**:
- Click **"Edit"** 
- Enter: `frontend/frontend`
- Click **"Continue"**

**Build Settings** (should auto-fill):
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### Step 4: Environment Variables
Click **"Environment Variables"** section

Add this variable:

**Key**: `REACT_APP_API_BASE_URL`  
**Value**: `https://signalmesh-ai-backend.onrender.com` (use YOUR Render URL from Part 1)

Add more variables:
```
REACT_APP_ENABLE_SNOWFLAKE_INTEGRATION = true
REACT_APP_SHOW_DEMO_DATA = true
REACT_APP_MODE = production
```

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. **Copy your frontend URL** (will look like): `https://signalmesh-ai-xxx.vercel.app`

### Step 6: Test Frontend
1. Open your Vercel URL in browser
2. Should see SignalMesh AI login page
3. Login with: `admin` / `admin123`
4. Dashboard should load with data from backend

✅ **Frontend deployment complete!**

---

## Part 3: Update Backend CORS (Important!)

After deploying frontend, update backend CORS:

1. Go back to **Render dashboard**
2. Open your **signalmesh-ai-backend** service
3. Go to **"Environment"** tab
4. Find **`CORS_ORIGIN`** variable
5. **Change from** `*` **to** your Vercel URL: `https://signalmesh-ai-xxx.vercel.app`
6. Click **"Save Changes"**
7. Service will redeploy (1-2 minutes)

---

## 🎯 Final URLs

After deployment, you'll have:

**Backend (Render)**:
```
https://signalmesh-ai-backend.onrender.com
```

**Frontend (Vercel)**:
```
https://signalmesh-ai-xxx.vercel.app
```

**API Health Check**:
```
https://signalmesh-ai-backend.onrender.com/health
```

---

## 🧪 Testing Deployment

### Test Backend:
```bash
# Health check
curl https://signalmesh-ai-backend.onrender.com/health

# India districts
curl https://signalmesh-ai-backend.onrender.com/api/india-districts

# District summary
curl https://signalmesh-ai-backend.onrender.com/api/india-district-summary
```

### Test Frontend:
1. Open: `https://your-frontend.vercel.app`
2. Login: `admin` / `admin123`
3. Check dashboard loads
4. Check browser console for errors (F12)
5. Verify data displays correctly

---

## ⚠️ Important Notes

### Free Tier Limitations:

**Render Free Tier**:
- Backend sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- 750 hours/month free

**Vercel Free Tier**:
- Unlimited deployments
- 100GB bandwidth/month
- Automatic HTTPS

### Snowflake Credentials:
- **Never** commit Snowflake password to Git ❌
- Only enter in Render environment variables ✅
- Keep credentials secure

---

## 🔧 Troubleshooting

### Backend doesn't connect to Snowflake:
- Check environment variables are set correctly
- Verify Snowflake password is correct
- Check Render logs: Service → Logs tab

### Frontend can't reach backend:
- Check `REACT_APP_API_BASE_URL` matches Render URL
- Update backend `CORS_ORIGIN` to Vercel URL
- Check browser console for CORS errors

### Build fails:
**Vercel**: Check build logs in deployment details
**Render**: Check logs in service dashboard

---

## 📝 Post-Deployment

### Update README:
After deployment, update your GitHub README.md with live URLs:

```markdown
## 🌐 Live Demo
- **Frontend**: https://your-frontend.vercel.app
- **Backend API**: https://your-backend.onrender.com
- **Health Check**: https://your-backend.onrender.com/health
```

---

## 🎊 Done!

Your SignalMesh AI application is now deployed and accessible worldwide!

**Questions?** Check the logs in Render/Vercel dashboards for any issues.

---

**Built with ❤️ by Team Apex-AI-X**
