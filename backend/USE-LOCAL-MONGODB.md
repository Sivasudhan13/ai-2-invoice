# 🚀 Quick Fix: Use Local MongoDB

## Problem
Cannot connect to MongoDB Atlas due to IP whitelisting issues.

## Solution: Use Local MongoDB (Works Immediately!)

### Step 1: Install MongoDB Locally

#### Windows:
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Run the installer (use default settings)
3. MongoDB will start automatically as a service

#### Mac:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### Linux (Ubuntu/Debian):
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### Step 2: Update Your .env File

Replace the MongoDB Atlas URI with local MongoDB:

```env
# OLD (MongoDB Atlas - not working)
# MONGODB_URI=mongodb+srv://sivasudhan87_db_user:9wYPRQybOLmSk8uZ@cluster0.nfvthb2.mongodb.net/invoiceDB?retryWrites=true&w=majority&appName=Cluster0

# NEW (Local MongoDB - works immediately)
MONGODB_URI=mongodb://localhost:27017/invoiceDB
```

### Step 3: Restart Your Server

```bash
cd backend
npm start
```

You should see:
```
⏳ Connecting to MongoDB...
✅ Mongoose connected to MongoDB
📦 Connected to MongoDB
✅ Database: invoiceDB
✅ Database ready
🚀 Server running on port 5000
```

### Step 4: Test Login/Signup

Your login and signup should now work perfectly!

## Advantages of Local MongoDB

✅ No IP whitelisting needed
✅ Works offline
✅ Faster (no network latency)
✅ Free and unlimited
✅ Perfect for development

## Switching Back to MongoDB Atlas Later

When you want to use MongoDB Atlas again:

1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
3. Wait 2-3 minutes
4. Update .env back to Atlas URI
5. Restart server

## Verify Local MongoDB is Running

### Windows:
- Check Services: Look for "MongoDB" service
- Or run: `net start MongoDB`

### Mac/Linux:
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Or check the service
brew services list  # Mac
sudo systemctl status mongodb  # Linux
```

### Test Connection:
```bash
# Connect to MongoDB shell
mongosh  # or mongo (older versions)

# You should see:
# > Connected to MongoDB
```

## Your Data

- Local MongoDB stores data in: `C:\data\db` (Windows) or `/data/db` (Mac/Linux)
- Your invoices will be saved locally
- You can export/import data between local and Atlas if needed

## That's It!

Your login and signup will work immediately with local MongoDB. No more timeout errors!
