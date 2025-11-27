# MongoDB Connection Troubleshooting Guide

## Current Status
The backend is configured to connect to MongoDB Atlas but is currently **unable to reach the cluster** due to a **network/firewall blockage**, not an Atlas IP whitelist issue.

## Quick Start
1. Ensure `sienna-backend/.env` is in `.gitignore` (credentials are stored there).
2. Create/update `sienna-backend/.env` with your MongoDB Atlas credentials:
   ```
   PORT=5000
   MONGO_URI=mongodb://username:password@cluster0-shard-00-00.ptzaxpc.mongodb.net:27017,cluster0-shard-00-01.ptzaxpc.mongodb.net:27017,cluster0-shard-00-02.ptzaxpc.mongodb.net:27017/sienna_portfolio?ssl=true&replicaSet=atlas-xxxxx-shard-0&authSource=admin&retryWrites=true&w=majority
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
   Expected output: `MongoDB connected` + `Server running on port 5000`.

## Connection Test Script
A diagnostic script `test-conn.js` is provided to test the MongoDB connection independently:
```bash
node test-conn.js
```
- Expected success output: `Connected OK`
- Expected failure output: Details on why the connection failed (e.g., network unreachable, credentials invalid, IP not whitelisted).

## Known Issues

### Issue: MongooseServerSelectionError / ReplicaSetNoPrimary
**Symptoms:**
- Error: "Could not connect to any servers in your MongoDB Atlas cluster"
- Error details mention "ReplicaSetNoPrimary"
- Happens on both initial startup (`npm run dev`) and test script runs

**Root Cause:**
Network/firewall is blocking outbound connections to MongoDB cluster ports (27017).

**Diagnostics Performed:**
- ✅ DNS resolution works: `nslookup cluster0-shard-00-00.ptzaxpc.mongodb.net` succeeds
- ❌ Network connectivity fails: PowerShell `Test-NetConnection` to port 27017 fails with "Name resolution failed" and no IP response
- ✅ Credentials are correct (verified in `.env` and Atlas)
- ✅ Atlas IP whitelist includes the machine's public IP (212.104.231.33/32)

**Solution:**
1. **Try from a different network** (e.g., mobile hotspot, different WiFi):
   - If connection works on a different network, your ISP/current network is blocking port 27017.
   - Contact your ISP or network administrator to allow outbound traffic to port 27017.

2. **Check Windows Firewall:**
   - Open Windows Defender Firewall → Outbound rules
   - Ensure no rule is blocking port 27017 or your MongoDB cluster hosts
   - If needed, add an outbound rule to allow traffic

3. **Check Corporate/School Network Restrictions:**
   - If on a corporate or school network, port 27017 may be intentionally blocked
   - Contact your network admin to whitelist MongoDB ports

4. **VPN:**
   - Try connecting via a VPN that allows MongoDB traffic (if permitted)

## Recommended Next Steps

### For Development (Quick Testing)
Use the **SRV-style connection string** (simpler, more resilient):
```
MONGO_URI=mongodb+srv://username:password@cluster0.ptzaxpc.mongodb.net/sienna_portfolio?retryWrites=true&w=majority
```

### For Production
- Store credentials in environment variables or a secrets manager (not in `.env`)
- Use the SRV connection string for better cluster failover
- Set `serverSelectionTimeoutMS` appropriately (currently 10s in the code)

## Connection String Formats

### Long URI (current in `.env`)
```
mongodb://user:pass@host1:27017,host2:27017,host3:27017/database?ssl=true&replicaSet=...&authSource=admin&retryWrites=true&w=majority
```
- Pros: Explicit control, works when DNS is restricted
- Cons: Long, hard to read, requires replica set info

### SRV URI (recommended)
```
mongodb+srv://user:pass@cluster0.ptzaxpc.mongodb.net/database?retryWrites=true&w=majority
```
- Pros: Simple, handles seedlist via DNS, automatically uses SSL
- Cons: Requires SRV DNS lookups (may be blocked on some networks)

## Files
- `sienna-backend/.env` — MongoDB credentials and connection string (DO NOT COMMIT)
- `sienna-backend/test-conn.js` — Lightweight connection test script
- `sienna-backend/src/index.js` — Main Express app with improved Mongoose logging

## Mongoose Connection Options
The code uses these options:
```javascript
const mongooseOptions = {
  serverSelectionTimeoutMS: 10000, // 10s timeout for quicker failure feedback
};
mongoose.connect(process.env.MONGO_URI, mongooseOptions)
```

## Security Reminders
1. **Never commit `.env`** — ensure it's in `.gitignore`
2. **Rotate credentials if exposed** — if `.env` was pushed to a public repo, change the DB password in Atlas immediately
3. **Use Atlas IP whitelist** — only allow known IPs (not 0.0.0.0/0 in production)
4. **Mask passwords in logs** — the code includes a `maskUri()` function to hide credentials when printing

## Further Help
- [MongoDB Atlas Network Access Docs](https://www.mongodb.com/docs/atlas/security-whitelist/)
- [Mongoose Connection Docs](https://mongoosejs.com/docs/connections.html)
- [MongoDB Atlas Connection Strings](https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/)
