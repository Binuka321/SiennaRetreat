# Sienna Backend Setup Guide

## Prerequisites
- Node.js 14+ (check with `node --version`)
- npm (check with `npm --version`)
- MongoDB Atlas cluster (free tier available at https://www.mongodb.com/cloud/atlas)
- Credentials: username, password, and cluster URI from MongoDB Atlas

## Installation

### 1. Install Dependencies
```bash
cd sienna-backend
npm install
```

### 2. Configure Environment Variables
Copy the example `.env` file and update it with your MongoDB credentials:
```bash
cp .env.example .env
```

Then edit `.env` and replace:
- `<username>` — Your MongoDB Atlas database user
- `<password>` — Your MongoDB Atlas database password
- `cluster0.ptzaxpc.mongodb.net` — Your actual cluster host (from Atlas)
- `sienna_portfolio` — Your database name

**Example `.env`:**
```
PORT=5000
MONGO_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/sienna_portfolio?retryWrites=true&w=majority
```

### 3. Verify `.env` is in `.gitignore`
Make sure your `.env` file is listed in the root `.gitignore` to prevent accidental credential commits:
```bash
# Check (from repo root)
grep "\.env" .gitignore
```
Expected output: `.env`

## Running the Backend

### Development Mode (with hot reload)
```bash
npm run dev
```
Expected output:
```
[nodemon] 3.1.11
[nodemon] starting `node src/index.js`
[2025-11-26T16:20:51.087Z] MongoDB connection attempt 1/10
Attempting MongoDB connection using MONGO_URI: mongodb+srv:<password>@...
[2025-11-26T16:21:01.727Z] MongoDB connected successfully
[2025-11-26T16:21:01.750Z] Server running on port 5000
```

The server will be available at `http://localhost:5000`.

### Test MongoDB Connection (without starting the server)
```bash
node test-conn.js
```
Expected output on success:
```
Attempting MongoDB connection using MONGO_URI: mongodb+srv:<password>@...
Connected OK
```

Expected output on failure:
```
Attempting MongoDB connection using MONGO_URI: mongodb+srv:<password>@...
Connection failed with error:
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster...
```

## API Endpoints

### Facilities
- `GET /api/facilities` — List all facilities
- `POST /api/facilities` — Create a facility
- `GET /api/facilities/:id` — Get facility by ID
- `PUT /api/facilities/:id` — Update facility
- `DELETE /api/facilities/:id` — Delete facility

### Rooms
- `GET /api/rooms` — List all rooms
- `POST /api/rooms` — Create a room
- `GET /api/rooms/:id` — Get room by ID
- `PUT /api/rooms/:id` — Update room
- `DELETE /api/rooms/:id` — Delete room

### Users
- `GET /api/users` — List all users
- `POST /api/users` — Create a user
- `GET /api/users/:id` — Get user by ID
- `PUT /api/users/:id` — Update user
- `DELETE /api/users/:id` — Delete user

## Troubleshooting

### MongoDB Connection Fails
See `MONGODB_TROUBLESHOOTING.md` for detailed diagnostics and solutions, including:
- IP whitelist configuration in Atlas
- Network/firewall troubleshooting
- Connection string formats (SRV vs. long URI)

### Port Already in Use
If port 5000 is already in use:
```bash
# Change PORT in .env to an available port (e.g., 5001)
PORT=5001
```

### Dependencies Not Found
If you get module not found errors:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Nodemon Not Reloading
Restart the dev server:
```bash
# In the terminal running `npm run dev`, press Ctrl+C
# Then run again:
npm run dev
```

## Development Best Practices

1. **Keep `.env` secret:**
   - Never commit `.env` to version control
   - Use `.env.example` to show what variables are needed
   - Rotate credentials if they're ever exposed

2. **Use environment variables:**
   - Store sensitive config in `.env`, not in code
   - Load with `dotenv.config()` (already done in `src/index.js`)

3. **Monitor logs:**
   - The backend logs all MongoDB connection attempts with timestamps
   - Errors include helpful hints for debugging

4. **Test connections locally:**
   - Run `node test-conn.js` to verify connectivity before starting the full server
   - Useful for diagnosing network/credential issues

## Project Structure
```
sienna-backend/
├── src/
│   ├── index.js                 # Main Express app & MongoDB connection
│   ├── controllers/             # Request handlers
│   ├── models/                  # Mongoose schemas
│   └── routes/                  # API route definitions
├── .env                         # Environment variables (not committed)
├── .env.example                 # Template for .env
├── package.json                 # Dependencies and scripts
├── test-conn.js                 # MongoDB connection test script
├── SETUP.md                     # This file
└── MONGODB_TROUBLESHOOTING.md   # Detailed MongoDB diagnostics
```

## Next Steps

1. Set up `.env` with your MongoDB credentials
2. Run `npm install`
3. Test the connection: `node test-conn.js`
4. Start the dev server: `npm run dev`
5. Test endpoints using Postman, curl, or the frontend

## Support
For MongoDB Atlas issues, see `MONGODB_TROUBLESHOOTING.md` or visit:
- https://www.mongodb.com/docs/atlas/
- https://www.mongodb.com/docs/drivers/node/
