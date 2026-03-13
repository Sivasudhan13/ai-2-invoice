# 🔧 MongoDB Connection Timeout Fix

## Problem
`Operation users.findOne() buffering timed out after 10000ms`

This error occurs when the application cannot connect to MongoDB Atlas.

## Root Causes

### 1. **IP Address Not Whitelisted** (Most Common)
MongoDB Atlas blocks connections from IP addresses that aren't whitelisted.

### 2. **SSL/TLS Certificate Issues**
The error `tlsv1 alert internal error` indicates SSL handshake problems.

### 3. **Network/Firewall Issues**
Corporate firewalls or VPNs may block MongoDB Atlas connections.

## Solutions

### Solution 1: Whitelist Your IP Address (REQUIRED)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Log in to your account
3. Select your project
4. Click **"Network Access"** in the left sidebar
5. Click **"Add IP Address"** button
6. Choose one of:
   - **"Add Current IP Address"** (recommended for development)
   - **"Allow Access from Anywhere"** (0.0.0.0/0) - for testing only
7. Click **"Confirm"**
8. **Wait 1-2 minutes** for changes to propagate
9. Try connecting again

### Solution 2: Update MongoDB URI

Your `.env` file should have:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/databaseName?retryWrites=true&w=majority
```

Make sure:
- Replace `username` with your database username
- Replace `password` with your database password
- Replace `cluster0.xxxxx.mongodb.net` with your cluster address
- Add a database name (e.g., `invoiceDB`)
- Include `?retryWrites=true&w=majority` parameters

### Solution 3: Check Database User Credentials

1. Go to MongoDB Atlas
2. Click **"Database Access"** in the left sidebar
3. Verify your database user exists
4. Check the username matches your URI
5. If needed, click **"Edit"** and reset the password
6. Update the password in your `.env` file

### Solution 4: Test Connection

Run the test script:
```bash
cd backend
node test-db-connection.js
```

This will:
- Verify your MONGODB_URI is set
- Attempt to connect
- Show detailed error messages
- Provide specific troubleshooting steps

### Solution 5: Alternative - Use Local MongoDB

If MongoDB Atlas continues to have issues, use local MongoDB:

1. Install MongoDB locally:
   - Windows: Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Mac: `brew install mongodb-community`
   - Linux: `sudo apt-get install mongodb`

2. Start MongoDB:
   ```bash
   mongod
   ```

3. Update `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/invoiceDB
   ```

## Updated Configuration

The server now includes:
- ✅ Increased timeout (30 seconds)
- ✅ SSL/TLS configuration
- ✅ Automatic reconnection
- ✅ Better error messages
- ✅ Connection retry logic

## Verification Steps

1. **Check MongoDB Atlas Dashboard**
   - Ensure cluster is running (not paused)
   - Check "Network Access" has your IP
   - Verify "Database Access" has your user

2. **Test Connection**
   ```bash
   node backend/test-db-connection.js
   ```

3. **Start Server**
   ```bash
   cd backend
   npm start
   ```

4. **Check Logs**
   Look for:
   - ✅ "Connected to MongoDB" - Success!
   - ❌ "MongoDB connection error" - Check steps above

## Common Error Messages

### "ENOTFOUND"
- **Cause**: Invalid cluster hostname
- **Fix**: Check your MongoDB URI cluster address

### "Authentication failed"
- **Cause**: Wrong username or password
- **Fix**: Verify credentials in MongoDB Atlas → Database Access

### "Timed out after 10000ms"
- **Cause**: IP not whitelisted or network issue
- **Fix**: Add IP to whitelist, wait 2 minutes, try again

### "tlsv1 alert internal error"
- **Cause**: SSL/TLS handshake failure
- **Fix**: 
  1. Whitelist IP address
  2. Check if VPN/firewall is blocking
  3. Try different network

## Quick Fix Checklist

- [ ] MongoDB Atlas cluster is running (not paused)
- [ ] IP address is whitelisted (0.0.0.0/0 for testing)
- [ ] Database user exists with correct password
- [ ] MONGODB_URI in .env is correct
- [ ] Database name is included in URI
- [ ] Waited 1-2 minutes after whitelisting IP
- [ ] No VPN or firewall blocking connection
- [ ] Node.js version is 14+ (check with `node --version`)

## Still Not Working?

1. **Try a different network**
   - Mobile hotspot
   - Different WiFi
   - Disable VPN

2. **Check MongoDB Atlas Status**
   - Visit [status.mongodb.com](https://status.mongodb.com)
   - Check for service outages

3. **Contact Support**
   - MongoDB Atlas support
   - Check MongoDB community forums

## Success Indicators

When connection works, you'll see:
```
⏳ Connecting to MongoDB...
✅ Mongoose connected to MongoDB
📦 Connected to MongoDB
✅ Database ready
🚀 Server running on port 5000
```

## Testing Login/Signup

Once connected, test:
```bash
# Test signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123","accountType":"personal"}'

# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

Both should return success with a token.
