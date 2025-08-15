import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiMapPin, 
  FiActivity, 
  FiClock,
  FiTrendingUp,
  FiAlertTriangle
} from 'react-icons/fi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: ${props => props.theme.colors.primary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-bottom: 20px;
  padding: 8px 0;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SensorHeader = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const SensorTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: ${props => props.theme.colors.text};
`;

const SensorMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  
  svg {
    font-size: 16px;
  }
`;

const StatusBadge = styled.div`
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.status) {
      case 'safe': return `${props.theme.colors.success}15`;
      case 'warning': return `${props.theme.colors.warning}15`;
      case 'danger': return `${props.theme.colors.danger}15`;
      default: return `${props.theme.colors.textSecondary}15`;
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'safe': return props.theme.colors.success;
      case 'warning': return props.theme.colors.warning;
      case 'danger': return props.theme.colors.danger;
      default: return props.theme.colors.textSecondary;
    }
  }};
`;

const ReadingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const ReadingCard = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  padding: 20px;
  border: 1px solid ${props => props.theme.colors.border};
  text-align: center;
`;

const ReadingValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin-bottom: 4px;
  
  .unit {
    font-size: 14px;
    font-weight: normal;
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const ReadingLabel = styled.div`
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  font-weight: 600;
  margin-bottom: 8px;
`;

const ReadingStatus = styled.div`
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 600;
  background: ${props => {
    switch (props.status) {
      case 'safe': return `${props.theme.colors.success}15`;
      case 'warning': return `${props.theme.colors.warning}15`;
      case 'danger': return `${props.theme.colors.danger}15`;
      default: return `${props.theme.colors.textSecondary}15`;
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'safe': return props.theme.colors.success;
      case 'warning': return props.theme.colors.warning;
      case 'danger': return props.theme.colors.danger;
      default: return props.theme.colors.textSecondary;
    }
  }};
`;

const ChartContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 24px;
  border: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 24px;
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: ${props => props.theme.colors.text};
`;

const SensorDetail = () => {
  const { sensorId } = useParams();
  const [sensorData, setSensorData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSensorData();
    fetchChartData();
  }, [sensorId]);

  const fetchSensorData = async () => {
    try {
      // Mock sensor data - replace with actual API call
      const mockSensor = {
        sensorId: sensorId,
        sensorType: sensorId.startsWith('AIR') ? 'air' : 'water',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          address: `Industrial Zone ${sensorId.slice(-1)}, New York`
        },
        readings: sensorId.startsWith('AIR') ? {
          pm25: 25.4,
          pm10: 45.2,
          co2: 420.5,
          no2: 35.8,
          temperature: 22.1,
          humidity: 65.3
        } : {
          ph: 7.2,
          turbidity: 2.8,
          dissolvedOxygen: 8.5,
          temperature: 18.5,
          humidity: 85.2
        },
        status: 'safe',
        timestamp: new Date().toISOString()
      };
      setSensorData(mockSensor);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = () => {
    // Generate mock chart data
    const data = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        value: 20 + Math.random() * 30 + Math.sin(i / 6) * 10,
        threshold: 35
      });
    }
    
    setChartData(data);
  };

  const getReadingStatus = (value, parameter) => {
    const thresholds = {
      pm25: { warning: 35, danger: 75 },
      pm10: { warning: 50, danger: 150 },
      co2: { warning: 1000, danger: 5000 },
      no2: { warning: 100, danger: 200 },
      ph: { minWarning: 6.5, maxWarning: 8.5, minDanger: 6.0, maxDanger: 9.0 },
      turbidity: { warning: 4, danger: 10 },
      dissolvedOxygen: { warning: 5, danger: 3 }
    };

    const threshold = thresholds[parameter];
    if (!threshold) return 'safe';

    if (parameter === 'ph') {
      if (value <= threshold.minDanger || value >= threshold.maxDanger) return 'danger';
      if (value <= threshold.minWarning || value >= threshold.maxWarning) return 'warning';
      return 'safe';
    } else if (parameter === 'dissolvedOxygen') {
      if (value <= threshold.danger) return 'danger';
      if (value <= threshold.warning) return 'warning';
      return 'safe';
    } else {
      if (value >= threshold.danger) return 'danger';
      if (value >= threshold.warning) return 'warning';
      return 'safe';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!sensorData) {
    return <div>Sensor not found</div>;
  }

  const renderAirQualityReadings = () => (
    <>
      <ReadingCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <ReadingLabel>PM2.5</ReadingLabel>
        <ReadingValue>
          {sensorData.readings.pm25?.toFixed(1)} <span className="unit">µg/m³</span>
        </ReadingValue>
        <ReadingStatus status={getReadingStatus(sensorData.readings.pm25, 'pm25')}>
          {getReadingStatus(sensorData.readings.pm25, 'pm25')}
        </ReadingStatus>
      </ReadingCard>

      <ReadingCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <ReadingLabel>PM10</ReadingLabel>
        <ReadingValue>
          {sensorData.readings.pm10?.toFixed(1)} <span className="unit">µg/m³</span>
        </ReadingValue>
        <ReadingStatus status={getReadingStatus(sensorData.readings.pm10, 'pm10')}>
          {getReadingStatus(sensorData.readings.pm10, 'pm10')}
        </ReadingStatus>
      </ReadingCard>

      <ReadingCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <ReadingLabel>CO₂</ReadingLabel>
        <ReadingValue>
          {sensorData.readings.co2?.toFixed(0)} <span className="unit">ppm</span>
        </ReadingValue>
        <ReadingStatus status={getReadingStatus(sensorData.readings.co2, 'co2')}>
          {getReadingStatus(sensorData.readings.co2, 'co2')}
        </ReadingStatus>
      </ReadingCard>

      <ReadingCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <ReadingLabel>NO₂</ReadingLabel>
        <ReadingValue>
          {sensorData.readings.no2?.toFixed(1)} <span className="unit">µg/m³</span>
        </ReadingValue>
        <ReadingStatus status={getReadingStatus(sensorData.readings.no2, 'no2')}>
          {getReadingStatus(sensorData.readings.no2, 'no2')}
        </ReadingStatus>
      </ReadingCard>
    </>
  );

  const renderWaterQualityReadings = () => (
    <>
      <ReadingCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <ReadingLabel>pH Level</ReadingLabel>
        <ReadingValue>
          {sensorData.readings.ph?.toFixed(2)}
        </ReadingValue>
        <ReadingStatus status={getReadingStatus(sensorData.readings.ph, 'ph')}>
          {getReadingStatus(sensorData.readings.ph, 'ph')}
        </ReadingStatus>
      </ReadingCard>

      <ReadingCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <ReadingLabel>Turbidity</ReadingLabel>
        <ReadingValue>
          {sensorData.readings.turbidity?.toFixed(1)} <span className="unit">NTU</span>
        </ReadingValue>
        <ReadingStatus status={getReadingStatus(sensorData.readings.turbidity, 'turbidity')}>
          {getReadingStatus(sensorData.readings.turbidity, 'turbidity')}
        </ReadingStatus>
      </ReadingCard>

      <ReadingCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <ReadingLabel>Dissolved Oxygen</ReadingLabel>
        <ReadingValue>
          {sensorData.readings.dissolvedOxygen?.toFixed(1)} <span className="unit">mg/L</span>
        </ReadingValue>
        <ReadingStatus status={getReadingStatus(sensorData.readings.dissolvedOxygen, 'dissolvedOxygen')}>
          {getReadingStatus(sensorData.readings.dissolvedOxygen, 'dissolvedOxygen')}
        </ReadingStatus>
      </ReadingCard>

      <ReadingCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <ReadingLabel>Temperature</ReadingLabel>
        <ReadingValue>
          {sensorData.readings.temperature?.toFixed(1)} <span className="unit">°C</span>
        </ReadingValue>
        <ReadingStatus status="safe">
          Normal
        </ReadingStatus>
      </ReadingCard>
    </>
  );

  return (
    <PageContainer>
      <BackButton onClick={() => window.history.back()}>
        <FiArrowLeft />
        Back to Dashboard
      </BackButton>

      <SensorHeader>
        <SensorTitle>{sensorData.sensorId}</SensorTitle>
        <SensorMeta>
          <MetaItem>
            <FiMapPin />
            {sensorData.location.address}
          </MetaItem>
          <MetaItem>
            <FiActivity />
            {sensorData.sensorType === 'air' ? 'Air Quality Sensor' : 'Water Quality Sensor'}
          </MetaItem>
          <MetaItem>
            <FiClock />
            Last updated: {new Date(sensorData.timestamp).toLocaleString()}
          </MetaItem>
          <StatusBadge status={sensorData.status}>
            {sensorData.status}
          </StatusBadge>
        </SensorMeta>
      </SensorHeader>

      <ReadingsGrid>
        {sensorData.sensorType === 'air' ? renderAirQualityReadings() : renderWaterQualityReadings()}
      </ReadingsGrid>

      <ChartContainer>
        <ChartTitle>24-Hour Trend</ChartTitle>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#2563eb" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="threshold" 
              stroke="#ef4444" 
              strokeDasharray="5 5"
              strokeWidth={1}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </PageContainer>
  );
};

export default SensorDetail;
