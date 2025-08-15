from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import joblib
import os
from datetime import datetime, timedelta
import pymongo
from pymongo import MongoClient
import uvicorn
from typing import List, Dict, Any
import logging
from dotenv import load_dotenv
import schedule
import time
import threading

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Environmental Monitoring ML Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MLPredictor:
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.anomaly_detectors = {}
        self.db = None
        self.connect_to_database()
        self.initialize_models()
        
    def connect_to_database(self):
        try:
            mongo_uri = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/environmental_monitoring')
            self.client = MongoClient(mongo_uri)
            self.db = self.client.environmental_monitoring
            logger.info("Connected to MongoDB")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}")
            
    def initialize_models(self):
        """Initialize ML models for each parameter"""
        parameters = ['pm25', 'pm10', 'co2', 'no2', 'ph', 'turbidity', 'dissolvedOxygen']
        
        for param in parameters:
            # Prediction model
            self.models[param] = RandomForestRegressor(
                n_estimators=100,
                random_state=42,
                max_depth=10
            )
            
            # Scaler for normalization
            self.scalers[param] = StandardScaler()
            
            # Anomaly detection model
            self.anomaly_detectors[param] = IsolationForest(
                contamination=0.1,
                random_state=42
            )
            
        logger.info("ML models initialized")
        
    def fetch_training_data(self, days_back=30):
        """Fetch historical data for training"""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days_back)
            
            cursor = self.db.sensorreadings.find({
                'timestamp': {
                    '$gte': start_date,
                    '$lte': end_date
                }
            }).sort('timestamp', 1)
            
            data = list(cursor)
            if not data:
                logger.warning("No training data found")
                return pd.DataFrame()
                
            # Convert to DataFrame
            df_data = []
            for record in data:
                row = {
                    'timestamp': record['timestamp'],
                    'sensorId': record['sensorId'],
                    'sensorType': record['sensorType'],
                    **record['readings']
                }
                df_data.append(row)
                
            df = pd.DataFrame(df_data)
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            # Add time-based features
            df['hour'] = df['timestamp'].dt.hour
            df['day_of_week'] = df['timestamp'].dt.dayofweek
            df['month'] = df['timestamp'].dt.month
            
            logger.info(f"Fetched {len(df)} records for training")
            return df
            
        except Exception as e:
            logger.error(f"Error fetching training data: {e}")
            return pd.DataFrame()
            
    def prepare_features(self, df, target_param):
        """Prepare features for training"""
        if df.empty:
            return None, None
            
        # Select relevant features
        feature_cols = ['hour', 'day_of_week', 'month']
        
        # Add other parameters as features (excluding the target)
        param_cols = ['pm25', 'pm10', 'co2', 'no2', 'ph', 'turbidity', 'dissolvedOxygen', 'temperature', 'humidity']
        for col in param_cols:
            if col != target_param and col in df.columns:
                feature_cols.append(col)
                
        # Filter out rows where target parameter is null
        df_clean = df.dropna(subset=[target_param])
        
        if df_clean.empty:
            return None, None
            
        X = df_clean[feature_cols].fillna(df_clean[feature_cols].mean())
        y = df_clean[target_param]
        
        return X, y
        
    def train_models(self):
        """Train all ML models"""
        logger.info("Starting model training...")
        
        df = self.fetch_training_data()
        if df.empty:
            logger.warning("No data available for training")
            return False
            
        parameters = ['pm25', 'pm10', 'co2', 'no2', 'ph', 'turbidity', 'dissolvedOxygen']
        
        for param in parameters:
            try:
                X, y = self.prepare_features(df, param)
                
                if X is None or len(X) < 10:
                    logger.warning(f"Insufficient data for training {param} model")
                    continue
                    
                # Split data
                X_train, X_test, y_train, y_test = train_test_split(
                    X, y, test_size=0.2, random_state=42
                )
                
                # Scale features
                X_train_scaled = self.scalers[param].fit_transform(X_train)
                X_test_scaled = self.scalers[param].transform(X_test)
                
                # Train prediction model
                self.models[param].fit(X_train_scaled, y_train)
                
                # Train anomaly detection model
                self.anomaly_detectors[param].fit(X_train_scaled)
                
                # Evaluate model
                train_score = self.models[param].score(X_train_scaled, y_train)
                test_score = self.models[param].score(X_test_scaled, y_test)
                
                logger.info(f"{param} model trained - Train R²: {train_score:.3f}, Test R²: {test_score:.3f}")
                
            except Exception as e:
                logger.error(f"Error training {param} model: {e}")
                
        # Save models
        self.save_models()
        logger.info("Model training completed")
        return True
        
    def save_models(self):
        """Save trained models to disk"""
        os.makedirs('models', exist_ok=True)
        
        for param in self.models.keys():
            joblib.dump(self.models[param], f'models/{param}_model.pkl')
            joblib.dump(self.scalers[param], f'models/{param}_scaler.pkl')
            joblib.dump(self.anomaly_detectors[param], f'models/{param}_anomaly.pkl')
            
    def load_models(self):
        """Load trained models from disk"""
        try:
            for param in self.models.keys():
                model_path = f'models/{param}_model.pkl'
                scaler_path = f'models/{param}_scaler.pkl'
                anomaly_path = f'models/{param}_anomaly.pkl'
                
                if all(os.path.exists(path) for path in [model_path, scaler_path, anomaly_path]):
                    self.models[param] = joblib.load(model_path)
                    self.scalers[param] = joblib.load(scaler_path)
                    self.anomaly_detectors[param] = joblib.load(anomaly_path)
                    
            logger.info("Models loaded successfully")
            return True
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            return False
            
    def predict_next_values(self, sensor_id: str, hours_ahead: int = 1):
        """Predict future values for a sensor"""
        try:
            # Get recent data for the sensor
            recent_data = list(self.db.sensorreadings.find({
                'sensorId': sensor_id
            }).sort('timestamp', -1).limit(10))
            
            if not recent_data:
                return {}
                
            # Get the latest reading
            latest = recent_data[0]
            current_time = datetime.now()
            future_time = current_time + timedelta(hours=hours_ahead)
            
            # Prepare features for prediction
            features = {
                'hour': future_time.hour,
                'day_of_week': future_time.weekday(),
                'month': future_time.month,
                **latest['readings']
            }
            
            predictions = {}
            
            for param in ['pm25', 'pm10', 'co2', 'no2', 'ph', 'turbidity', 'dissolvedOxygen']:
                try:
                    if param in latest['readings'] and latest['readings'][param] is not None:
                        # Create feature vector
                        feature_vector = []
                        for col in ['hour', 'day_of_week', 'month']:
                            feature_vector.append(features[col])
                            
                        # Add other parameters as features
                        param_cols = ['pm25', 'pm10', 'co2', 'no2', 'ph', 'turbidity', 'dissolvedOxygen', 'temperature', 'humidity']
                        for col in param_cols:
                            if col != param and col in features and features[col] is not None:
                                feature_vector.append(features[col])
                            elif col != param:
                                feature_vector.append(0)  # Default value
                                
                        # Make prediction
                        X = np.array(feature_vector).reshape(1, -1)
                        X_scaled = self.scalers[param].transform(X)
                        prediction = self.models[param].predict(X_scaled)[0]
                        
                        # Detect if prediction is anomalous
                        anomaly_score = self.anomaly_detectors[param].decision_function(X_scaled)[0]
                        is_anomaly = self.anomaly_detectors[param].predict(X_scaled)[0] == -1
                        
                        predictions[param] = {
                            'predicted_value': float(prediction),
                            'current_value': float(latest['readings'][param]),
                            'change': float(prediction - latest['readings'][param]),
                            'anomaly_score': float(anomaly_score),
                            'is_anomaly': bool(is_anomaly),
                            'prediction_time': future_time.isoformat()
                        }
                        
                except Exception as e:
                    logger.error(f"Error predicting {param}: {e}")
                    
            return predictions
            
        except Exception as e:
            logger.error(f"Error in predict_next_values: {e}")
            return {}
            
    def detect_anomalies(self, sensor_data: Dict[str, Any]):
        """Detect anomalies in current sensor data"""
        anomalies = {}
        
        for param, value in sensor_data.items():
            if param in self.anomaly_detectors and value is not None:
                try:
                    # Create feature vector (simplified for real-time detection)
                    current_time = datetime.now()
                    features = [current_time.hour, current_time.weekday(), current_time.month, value]
                    
                    X = np.array(features).reshape(1, -1)
                    X_scaled = self.scalers[param].transform(X)
                    
                    anomaly_score = self.anomaly_detectors[param].decision_function(X_scaled)[0]
                    is_anomaly = self.anomaly_detectors[param].predict(X_scaled)[0] == -1
                    
                    anomalies[param] = {
                        'is_anomaly': bool(is_anomaly),
                        'anomaly_score': float(anomaly_score),
                        'value': float(value)
                    }
                    
                except Exception as e:
                    logger.error(f"Error detecting anomaly for {param}: {e}")
                    
        return anomalies

# Initialize ML predictor
ml_predictor = MLPredictor()

# API Endpoints
@app.get("/")
async def root():
    return {"message": "Environmental Monitoring ML Service", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": len(ml_predictor.models) > 0
    }

@app.post("/train")
async def train_models():
    """Trigger model training"""
    try:
        success = ml_predictor.train_models()
        return {"success": success, "message": "Model training completed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/predict/{sensor_id}")
async def predict_sensor_values(sensor_id: str, hours_ahead: int = 1):
    """Get predictions for a specific sensor"""
    try:
        predictions = ml_predictor.predict_next_values(sensor_id, hours_ahead)
        return {
            "sensor_id": sensor_id,
            "hours_ahead": hours_ahead,
            "predictions": predictions,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/anomaly-detection")
async def detect_anomalies(sensor_data: Dict[str, Any]):
    """Detect anomalies in sensor data"""
    try:
        anomalies = ml_predictor.detect_anomalies(sensor_data)
        return {
            "anomalies": anomalies,
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models/status")
async def get_model_status():
    """Get status of all ML models"""
    return {
        "models": list(ml_predictor.models.keys()),
        "model_count": len(ml_predictor.models),
        "last_trained": "Not available",  # Could be stored in database
        "timestamp": datetime.now().isoformat()
    }

# Scheduled training
def scheduled_training():
    """Run model training on schedule"""
    logger.info("Running scheduled model training...")
    ml_predictor.train_models()

# Schedule training every 6 hours
schedule.every(6).hours.do(scheduled_training)

def run_scheduler():
    while True:
        schedule.run_pending()
        time.sleep(60)

# Start scheduler in background thread
scheduler_thread = threading.Thread(target=run_scheduler, daemon=True)
scheduler_thread.start()

if __name__ == "__main__":
    # Try to load existing models, otherwise train new ones
    if not ml_predictor.load_models():
        logger.info("No existing models found, training new models...")
        ml_predictor.train_models()
    
    uvicorn.run(app, host="0.0.0.0", port=8000)
