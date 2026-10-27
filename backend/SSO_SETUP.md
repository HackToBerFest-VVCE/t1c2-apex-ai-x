# SignalMesh AI — Snowflake SSO Authentication Setup

## Overview

The SignalMesh AI backend now uses **browser-based SSO authentication** to connect to Snowflake. This eliminates the need to store passwords and uses your organization's configured identity provider (Google SSO).

## How It Works

1. Backend uses Snowflake SDK's `EXTERNALBROWSER` authenticator
2. When server starts, it initiates a browser-based login flow
3. Your default browser opens to Snowflake's SSO login page
4. You authenticate with Google through your organization's SSO
5. Browser returns auth token to backend
6. Backend maintains authenticated connection for all API requests

## Prerequisites

### Snowflake Administrator Must Configure SSO

Before this will work, your **Snowflake administrator** must enable SSO/SAML authentication:

1. **Enable SAML/SSO Integration**:
   - In Snowflake: `Admin` → `Security` → `Network Policies` → `Authentication`
   - Enable external OAuth or SAML integration

2. **Configure Google as Identity Provider**:
   - Set up Google Workspace as SAML identity provider
   - Configure SAML settings with Google SSO details
   - Map Google user attributes to Snowflake users

3. **Grant User SSO Access**:
   - Ensure your user account has `EXTERNALBROWSER` authentication enabled
   - May need to set user property: `ALTER USER kushalmys55 SET AUTHENTICATOR = 'EXTERNALBROWSER'`

### Check If SSO Is Enabled

To check if your account supports SSO, run this in Snowflake:

```sql
-- Check authentication policy
SHOW PARAMETERS LIKE 'SAML%' IN ACCOUNT;

-- Check your user's authenticator setting
DESC USER kushalmys55;
```

If SSO is **not configured**, you'll see errors like:
- "SAML response validation failed"
- "External browser authentication not supported"
- "Federated authentication required"

## Environment Configuration

### Required Environment Variables

In `backend/.env`:

```env
# Account identifier (from Snowflake admin console)
SNOWFLAKE_ACCOUNT=KGZPMRY-BK89445

# Your Snowflake username
SNOWFLAKE_USERNAME=kushalmys55

# NO PASSWORD REQUIRED - SSO handles authentication

# Warehouse, database, schema
SNOWFLAKE_WAREHOUSE=SNOWFLAKE_LEARNING_WH
SNOWFLAKE_DATABASE=SIGNALMESH_AI
SNOWFLAKE_SCHEMA=DISASTER_RISK
```

### What Changed

**Before (Password Auth)**:
```javascript
{
  account: 'KGZPMRY-BK89445',
  username: 'kushalmys55',
  password: 'your_password',  // ❌ Password required
  authenticator: 'SNOWFLAKE'   // Default
}
```

**Now (SSO Auth)**:
```javascript
{
  account: 'KGZPMRY-BK89445',
  username: 'kushalmys55',
  authenticator: 'EXTERNALBROWSER',  // ✅ Browser SSO
  // No password field
}
```

## Starting the Backend

### Command

```bash
cd backend
npm run dev
```

### Expected Flow

1. **Server Starts**:
   ```
   🚀 SignalMesh AI Backend Server
   ✅ Server running on http://localhost:5000
   🔄 Connecting to Snowflake with SSO authentication...
   🌐 Browser window will open for SSO login
      Account: KGZPMRY-BK89445
      User: kushalmys55
   ```

2. **Browser Opens Automatically**:
   - Your default browser launches
   - Redirects to Snowflake SSO page
   - Shows Google sign-in prompt

3. **You Authenticate**:
   - Sign in with your Google account (`kushalmys55@gmail.com`)
   - Approve Snowflake access if prompted
   - Browser shows "Authentication successful" or closes automatically

4. **Connection Completes**:
   ```
   ✅ Connected to Snowflake successfully via SSO
      Database: SIGNALMESH_AI
      Schema: DISASTER_RISK
   
   🧪 Testing Snowflake connection...
   ✅ Session Info: { current_user: 'KUSHALMYS55', ... }
   ✅ NATION_FEATURES Table: { row_count: 25, nation_count: 25 }
   ✅ Sample Nations:
      - ALGERIA (AFRICA)
      - ARGENTINA (AMERICA)
      - BRAZIL (AMERICA)
      - CANADA (AMERICA)
      - CHINA (ASIA)
   
   ✅ All Snowflake connection tests passed!
   ```

## Troubleshooting

### "External browser authentication not supported"

**Cause**: Your Snowflake account doesn't have SSO/SAML configured.

**Solution**: Ask Snowflake administrator to:
1. Enable SAML integration in Snowflake
2. Configure Google as identity provider
3. Enable EXTERNALBROWSER for your user

### "SAML response validation failed"

**Cause**: SAML configuration incomplete or incorrect.

**Solution**: Snowflake admin needs to verify:
- Google SAML settings are correct
- SAML entity ID matches
- User email mapping is correct

### Browser doesn't open

**Cause**: Browser executable not found or blocked.

**Solution**:
- Ensure default browser is set in Windows
- Try running backend as administrator
- Check firewall isn't blocking browser launch

### "Connection timeout"

**Cause**: You didn't complete SSO login in browser within timeout.

**Solution**: Restart backend and complete browser login faster (default timeout: 120 seconds)

### Multiple browser windows open

**Cause**: Connection is attempted on every API request instead of once at startup.

**Solution**: Current implementation connects once at server startup and reuses connection. If you see multiple windows, check for connection retry logic.

## Testing the Connection

### 1. Health Check

```bash
curl http://localhost:5000/health
```

Response should show:
```json
{
  "status": "ok",
  "snowflake": {
    "configured": true,
    "connected": true,
    "error": null
  }
}
```

### 2. Query Nation Features

```bash
curl http://localhost:5000/api/nation-features
```

Should return 25 nations including INDIA.

### 3. Test Specific Nation

```bash
curl http://localhost:5000/api/nation/8
```

Should return INDIA's data.

## Security Notes

✅ **No Password Storage**: Password not required or stored  
✅ **Browser-Only Auth**: Authentication happens in your browser  
✅ **Session Reuse**: Single auth at startup, connection reused  
✅ **Token Management**: Snowflake SDK manages auth tokens securely  
✅ **Git Safe**: No credentials in .env that could be committed  

## Limitations

### Known Limitations

1. **Requires Desktop Environment**: 
   - Needs browser to open (won't work in headless servers)
   - For production servers, use service account with key-pair auth instead

2. **Manual Initial Auth**:
   - Developer must be present to complete browser login
   - Cannot fully automate startup

3. **Session Expiration**:
   - If session expires, may need to restart backend
   - SDK should handle token refresh automatically

### Production Alternative

For production deployment without browser access:

1. **Use Key Pair Authentication**:
   ```javascript
   {
     account: 'KGZPMRY-BK89445',
     username: 'service_account',
     authenticator: 'SNOWFLAKE_JWT',
     privateKey: '<encrypted key>',
   }
   ```

2. **Or Use OAuth with Refresh Token**:
   - Store refresh token in secure vault
   - Backend refreshes access token automatically

## Frontend Integration

No changes needed for frontend! The React app continues to:
- Call backend API at `http://localhost:5000`
- Display Snowflake connection status
- Show nation-level data from Snowflake

The authentication complexity is handled entirely in the backend.

## Summary

### What Changed
- ✅ Backend now uses `EXTERNALBROWSER` authenticator
- ✅ Password no longer required in `.env`
- ✅ Browser opens automatically for SSO login
- ✅ Connection tested with real queries
- ✅ Test results logged at startup

### What You Need
- ✅ Snowflake administrator to enable SSO
- ✅ Google SSO configured in Snowflake
- ✅ Your user granted EXTERNALBROWSER access
- ✅ Desktop environment with browser

### What Happens
1. Start backend: `npm run dev`
2. Browser opens for SSO login
3. Sign in with Google
4. Backend connects to Snowflake
5. Test queries verify access
6. API ready to serve data

---

**SignalMesh AI v1.0**  
*Secure SSO Authentication*  
By Apex-AI-X
