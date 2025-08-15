# 🚀 Quick Start Guide - Environmental Monitoring App

## Option 1: Automatic Startup (Recommended)

1. **Double-click** `start-app.bat` in the project folder
2. Two command windows will open (Backend and Frontend)
3. Wait 10-15 seconds for everything to load
4. Open your browser to: **http://localhost:3000**

## Option 2: Manual Startup

### Step 1: Start Backend Server
1. Open Command Prompt
2. Navigate to project folder:
   ```
   cd "C:\Users\Sara Shaik\CascadeProjects\2048"
   ```
3. Start backend:
   ```
   node server/simple-server.js
   ```
4. You should see: "🚀 Server running on port 5000"

### Step 2: Start Frontend (New Command Prompt)
1. Open a NEW Command Prompt
2. Navigate to client folder:
   ```
   cd "C:\Users\Sara Shaik\CascadeProjects\2048\client"
   ```
3. Start frontend:
   ```
   npm start
   ```
4. Browser should automatically open to http://localhost:3000

## ✅ Success Indicators

### Backend Running Successfully:
```
🚀 Server running on port 5000
📊 Environment: development
🚀 Starting IoT sensor simulator...
📡 Simulating 4 sensors
🔌 Client connected: [socket-id]
📊 AIR_001 (air): Status SAFE
📊 WATER_001 (water): Status SAFE
```

### Frontend Running Successfully:
```
webpack compiled successfully
Local:            http://localhost:3000
On Your Network:  http://192.168.x.x:3000
```

## 🌐 Access Your App

Once both servers are running:
- **Dashboard**: http://localhost:3000
- **API Health**: http://localhost:5000/api/health

## 🎯 What You'll See

1. **Real-time Dashboard** with live sensor cards
2. **Environmental Charts** updating every 10-30 seconds  
3. **Smart Alerts** when pollution spikes occur
4. **Status Indicators**: 🟢 Safe, 🟡 Warning, 🔴 Danger
5. **Interactive Navigation** between pages

## 🔧 Troubleshooting

### "This site can't be reached" Error:
1. Make sure BOTH servers are running
2. Check that you see the success messages above
3. Wait 10-15 seconds after starting
4. Try refreshing the browser

### Port Already in Use:
1. Close any existing Node.js processes
2. Restart both servers
3. Or change ports in the code

### Missing Dependencies:
```bash
# In main folder
npm install

# In client folder  
cd client
npm install
```

## 🎉 Features Ready to Use

- ✅ **4 IoT Sensors** (2 Air Quality, 2 Water Quality)
- ✅ **Real-time Data Streaming** via WebSocket
- ✅ **Smart Alert System** with pollution spike detection
- ✅ **Interactive Dashboard** with charts and animations
- ✅ **Alert Management** (acknowledge/resolve alerts)
- ✅ **Historical Data Analysis** with export functionality
- ✅ **Responsive Design** works on all devices

## 📱 Navigation

- **Dashboard**: Overview of all sensors and alerts
- **Alerts**: Manage and filter environmental alerts  
- **Historical**: Analyze trends and export data
- **Sensor Details**: Click any sensor card for detailed view

Your environmental monitoring system is now protecting communities! 🌍💚
