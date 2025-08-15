# 🌍 Real-Time Environmental Monitoring System

A comprehensive IoT-based environmental monitoring application that tracks air and water quality in industrial zones with real-time alerts, AI predictions, and beautiful dashboards.

## 🚀 Features

### 📊 Real-Time Monitoring
- **Air Quality Sensors**: PM2.5, PM10, CO₂, NO₂ monitoring
- **Water Quality Sensors**: pH, turbidity, dissolved oxygen tracking
- **Live Data Streaming**: WebSocket-based real-time updates
- **Status Indicators**: Green (safe), Yellow (warning), Red (danger)

### 🤖 AI/ML Predictions
- **Pattern Detection**: Machine learning models for trend analysis
- **Anomaly Detection**: Automatic identification of unusual readings
- **Predictive Alerts**: Early warning system for pollution spikes
- **Historical Analysis**: 24/7 data collection and analysis

### 📱 Interactive Dashboard
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-Time Charts**: Live updating graphs and visualizations
- **Alert Management**: Acknowledge and resolve alerts
- **Data Export**: Download historical data as CSV
- **Sensor Details**: Detailed view for each monitoring station

### 🔔 Alert System
- **Smart Thresholds**: Configurable warning and danger levels
- **Multi-Channel Notifications**: Email, push notifications, webhooks
- **Alert Prioritization**: Severity-based alert management
- **Historical Tracking**: Complete alert audit trail

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React.js      │    │   Node.js       │    │   Python ML     │
│   Frontend      │◄──►│   Backend       │◄──►│   Service       │
│   Dashboard     │    │   API Server    │    │   (FastAPI)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐             │
         │              │   MongoDB       │             │
         │              │   Database      │             │
         │              └─────────────────┘             │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   IoT Sensors   │
                    │   Simulator     │
                    └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI framework
- **Styled Components** - CSS-in-JS styling
- **Recharts** - Data visualization
- **Framer Motion** - Smooth animations
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js & Express** - Server framework
- **Socket.io** - WebSocket communication
- **MongoDB & Mongoose** - Database
- **Nodemailer** - Email notifications
- **Helmet** - Security middleware

### AI/ML Service
- **FastAPI** - Python web framework
- **Scikit-learn** - Machine learning
- **TensorFlow** - Deep learning
- **Pandas & NumPy** - Data processing

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- MongoDB (local or cloud)
- Git

### 1. Clone and Install Dependencies

```bash
# Navigate to project directory
cd "C:\Users\Sara Shaik\CascadeProjects\2048"

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..

# Install ML service dependencies
cd ml-service
pip install -r requirements.txt
cd ..
```

### 2. Database Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod --dbpath /data/db
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/atlas
2. Create a cluster and get connection string
3. Update MONGODB_URI in .env file

### 3. Environment Configuration

The `.env` file is already created with default values. Update these settings:

```env
# Update with your MongoDB connection
MONGODB_URI=mongodb://localhost:27017/environmental_monitoring

# Configure email alerts (optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. Start the Application

**Terminal 1: Backend Server**
```bash
npm run server
```

**Terminal 2: Frontend Dashboard**
```bash
npm run client
```

**Terminal 3: ML Service**
```bash
cd ml-service
python app.py
```

**Or start everything at once:**
```bash
npm run dev
```

## 🌐 Access the Application

- **Frontend Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **ML Service**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📊 Using the Dashboard

### Main Dashboard
- View all sensor statuses at a glance
- Monitor real-time environmental trends
- Check active alerts and warnings
- See sensor distribution and statistics

### Sensor Details
- Click any sensor card for detailed view
- View 24-hour trend charts
- Check individual parameter status
- Monitor threshold violations

### Alert Management
- View all alerts by severity and status
- Acknowledge alerts to mark as seen
- Resolve alerts when issues are fixed
- Export alert history as CSV

### Historical Analysis
- Select sensors and parameters
- Choose time periods (1h to 30 days)
- View trend analysis and statistics
- Export data for external analysis

## 🔧 Configuration

### Sensor Thresholds
Update alert thresholds in `.env`:

```env
# Air Quality Thresholds (µg/m³)
PM25_WARNING=35
PM25_DANGER=75
PM10_WARNING=50
PM10_DANGER=150

# Water Quality Thresholds
PH_MIN_WARNING=6.5
PH_MAX_WARNING=8.5
TURBIDITY_WARNING=4
TURBIDITY_DANGER=10
```

### Adding Real IoT Sensors
Replace the simulator in `server/services/sensorSimulator.js` with actual IoT sensor integration:

```javascript
// Example: MQTT sensor integration
const mqtt = require('mqtt');
const client = mqtt.connect(process.env.MQTT_BROKER_URL);

client.on('message', (topic, message) => {
  const sensorData = JSON.parse(message.toString());
  // Process real sensor data
});
```

## 🚀 Deployment

### Cloud Deployment Options

**1. Heroku (Recommended for beginners)**
```bash
# Install Heroku CLI
npm install -g heroku

# Create Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your-mongodb-uri

# Deploy
git push heroku main
```

**2. AWS/Azure/GCP**
- Use Docker containers for easy deployment
- Set up MongoDB Atlas for database
- Configure environment variables
- Set up CI/CD pipeline

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

## 📈 Monitoring & Maintenance

### Health Checks
- Backend: `GET /api/health`
- ML Service: `GET /health`
- Database: Monitor connection status

### Performance Monitoring
- Monitor API response times
- Track database query performance
- Monitor ML model accuracy
- Set up logging and alerting

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints at `/api/health`

## 🎯 Future Enhancements

- [ ] Mobile app (React Native)
- [ ] Advanced ML models (LSTM, Prophet)
- [ ] Integration with weather APIs
- [ ] Satellite imagery analysis
- [ ] Multi-tenant support
- [ ] Advanced user management
- [ ] Custom dashboard widgets
- [ ] API rate limiting and authentication

---

**Built with ❤️ for environmental protection and public safety**
