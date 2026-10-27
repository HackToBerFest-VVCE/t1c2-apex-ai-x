# SignalMesh AI Backend

Secure Express.js API server for Snowflake database integration.

**Team**: Apex-AI-X  
**Purpose**: Provide secure backend API layer that connects to Snowflake without exposing credentials to frontend code.

## Architecture

```
Frontend (React)  →  Backend API (Express)  →  Snowflake Database
                         (this server)
```

**Security Model**:
- Snowflake credentials stored in `.env` file (git-ignored)
- Never exposed to browser JavaScript
- All database queries executed server-side
- CORS configured to restrict frontend access

## Setup

### Prerequisites
- Node.js 18+ installed
- Snowflake account with `SIGNALMESH_AI` database created
- Snowflake credentials (account, username, password, warehouse)

### Installation

```bash
cd backend
npm install
```

### Configuration

1. Copy environment template:
```bash
cp .env.example .env
```

2. Edit `.env` and fill in your actual Snowflake credentials:
```env
SNOWFLAKE_ACCOUNT=your_account.region
SNOWFLAKE_USERNAME=your_username
SNOWFLAKE_PASSWORD=your_password
SNOWFLAKE_WAREHOUSE=SNOWFLAKE_LEARNING_WH
SNOWFLAKE_DATABASE=SIGNALMESH_AI
SNOWFLAKE_SCHEMA=DISASTER_RISK
```

3. **VERIFY `.env` IS GIT-IGNORED**:
```bash
git status
# Should NOT show .env file
```

## Running

### Development mode (auto-restart on changes):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

Server will start on `http://localhost:5000` by default.

## API Endpoints

### Health Check
```
GET /health
```
Returns server status and Snowflake connection state.

**Response**:
```json
{
  "status": "ok",
  "service": "SignalMesh AI Backend",
  "version": "1.0.0",
  "timestamp": "2025-05-03T10:30:00.000Z",
  "snowflake": {
    "configured": true,
    "connected": true,
    "error": null,
    "lastAttempt": "2025-05-03T10:29:55.000Z"
  }
}
```

### Nation Features
```
GET /api/nation-features
```
Returns all 25 nations with environmental risk factors.

**Response**:
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "NATION_KEY": 8,
      "NATION_NAME": "INDIA",
      "REGION_NAME": "ASIA",
      "PRECIPITATION_INDEX": 83,
      "TERRAIN_SLOPE_FACTOR": 78,
      "SOIL_STABILITY_INDEX": 38,
      "SEISMIC_ACTIVITY_LEVEL": 28,
      "VEGETATION_COVER": 53,
      "CUSTOMER_COUNT": 60000,
      "DATA_SOURCE": "SYNTHETIC_DEMO",
      "CREATED_AT": "2025-05-01T12:00:00.000Z"
    }
    // ... 24 more nations
  ],
  "source": "SIGNALMESH_AI.DISASTER_RISK.NATION_FEATURES",
  "timestamp": "2025-05-03T10:30:00.000Z"
}
```

### Risk Assessments
```
GET /api/risk-assessments
```
Returns ML-generated risk assessments for nations.

**Note**: May return empty array if ML model hasn't been run yet.

### Nation Summary
```
GET /api/nation-summary
```
Returns combined view of nation features + risk assessments (LEFT JOIN).

### Single Nation
```
GET /api/nation/:nationKey
```
Returns detailed data for a specific nation.

**Example**: `GET /api/nation/8` returns INDIA data.

## Troubleshooting

### "Missing required environment variables"
- Ensure `.env` file exists in `backend/` directory
- Verify all required Snowflake variables are set
- Check for typos in variable names

### "Failed to connect to Snowflake"
- Verify Snowflake account identifier is correct (format: `account.region`)
- Check username and password are correct
- Ensure warehouse and database exist in your Snowflake account
- Verify network connectivity to Snowflake

### "Query error: Object does not exist"
- Ensure `SIGNALMESH_AI.DISASTER_RISK` schema exists
- Run `sql/02_create_schema.sql` in Snowflake to create tables
- Verify you're using correct database and schema names in `.env`

### Empty risk assessments
- This is expected if ML model hasn't been run yet
- Run `py run_model.py` from workspace root to generate risk scores
- Execute generated SQL to populate `RISK_ASSESSMENT` table

## Security Checklist

Before committing code or deploying:

- [ ] `.env` file is listed in `.gitignore`
- [ ] No Snowflake credentials hardcoded in source files
- [ ] `.env` file is NOT committed to git
- [ ] CORS origin is configured appropriately
- [ ] Error messages don't expose sensitive information
- [ ] Connection strings don't contain credentials

## Deployment Notes

When deploying to production:

1. Set environment variables in hosting platform (Heroku, AWS, etc.)
2. Update `CORS_ORIGIN` to match production frontend URL
3. Set `NODE_ENV=production`
4. Use secure HTTPS connection
5. Consider adding rate limiting
6. Enable logging and monitoring

## Development Workflow

1. Start backend: `npm run dev` (terminal 1)
2. Start frontend: `cd ../JATAYU-frontend\ 2/frontend && npm start` (terminal 2)
3. Frontend will connect to backend API at `http://localhost:5000`
4. Make changes, server auto-restarts

## Dependencies

- `express` — Web server framework
- `cors` — Cross-origin resource sharing
- `dotenv` — Environment variable management
- `snowflake-sdk` — Snowflake database connector
- `nodemon` (dev) — Auto-restart on file changes

## Support

If you encounter issues:

1. Check `/health` endpoint first to verify Snowflake connection
2. Review console logs for error messages
3. Verify environment variables are set correctly
4. Ensure Snowflake tables exist and are populated
5. Check that workspace SQL files have been executed

---

**SignalMesh AI Backend v1.0.0**  
*Secure, scalable API for disaster intelligence*  
By Apex-AI-X
