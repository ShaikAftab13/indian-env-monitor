import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiMapPin, FiClock, FiTrendingUp, FiWind, FiDroplet } from 'react-icons/fi';

const Card = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 20px;
  box-shadow: ${props => props.theme.colors.shadow};
  border: 1px solid ${props => props.theme.colors.border};
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px 0 rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const SensorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: ${props => props.theme.colors.text};
  }
`;

const SensorIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.type === 'air' ? 
    `${props.theme.colors.primary}15` : 
    `${props.theme.colors.secondary}15`};
  color: ${props => props.type === 'air' ? 
    props.theme.colors.primary : 
    props.theme.colors.secondary};
  
  svg {
    font-size: 16px;
  }
`;

const StatusBadge = styled.div`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
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

const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 16px;
  
  svg {
    font-size: 14px;
  }
`;

const ReadingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
`;

const Reading = styled.div`
  text-align: center;
  padding: 12px;
  background: ${props => props.theme.colors.background};
  border-radius: 8px;
  
  .value {
    font-size: 18px;
    font-weight: 700;
    color: ${props => props.theme.colors.text};
    margin: 0;
  }
  
  .label {
    font-size: 11px;
    color: ${props => props.theme.colors.textSecondary};
    margin: 4px 0 0 0;
    text-transform: uppercase;
    font-weight: 500;
  }
  
  .unit {
    font-size: 12px;
    color: ${props => props.theme.colors.textSecondary};
    font-weight: normal;
  }
`;

const LastUpdate = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid ${props => props.theme.colors.border};
  
  svg {
    font-size: 12px;
  }
`;

const SensorCard = ({ sensor }) => {
  const { sensorId, sensorType, location, readings, status, timestamp } = sensor;
  
  const formatValue = (value, decimals = 1) => {
    if (value === null || value === undefined) return '--';
    return typeof value === 'number' ? value.toFixed(decimals) : value;
  };

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const renderAirQualityReadings = () => (
    <>
      <Reading>
        <p className="value">{formatValue(readings.pm25)} <span className="unit">µg/m³</span></p>
        <p className="label">PM2.5</p>
      </Reading>
      <Reading>
        <p className="value">{formatValue(readings.pm10)} <span className="unit">µg/m³</span></p>
        <p className="label">PM10</p>
      </Reading>
      <Reading>
        <p className="value">{formatValue(readings.co2, 0)} <span className="unit">ppm</span></p>
        <p className="label">CO₂</p>
      </Reading>
      <Reading>
        <p className="value">{formatValue(readings.no2)} <span className="unit">µg/m³</span></p>
        <p className="label">NO₂</p>
      </Reading>
    </>
  );

  const renderWaterQualityReadings = () => (
    <>
      <Reading>
        <p className="value">{formatValue(readings.ph, 2)}</p>
        <p className="label">pH Level</p>
      </Reading>
      <Reading>
        <p className="value">{formatValue(readings.turbidity)} <span className="unit">NTU</span></p>
        <p className="label">Turbidity</p>
      </Reading>
      <Reading>
        <p className="value">{formatValue(readings.dissolvedOxygen)} <span className="unit">mg/L</span></p>
        <p className="label">Dissolved O₂</p>
      </Reading>
      <Reading>
        <p className="value">{formatValue(readings.temperature)} <span className="unit">°C</span></p>
        <p className="label">Temperature</p>
      </Reading>
    </>
  );

  return (
    <Link to={`/sensor/${sensorId}`} style={{ textDecoration: 'none' }}>
      <Card
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
      >
        <CardHeader>
          <SensorInfo>
            <SensorIcon type={sensorType}>
              {sensorType === 'air' ? <FiWind /> : <FiDroplet />}
            </SensorIcon>
            <h3>{sensorId}</h3>
          </SensorInfo>
          <StatusBadge status={status}>
            {status}
          </StatusBadge>
        </CardHeader>

        <Location>
          <FiMapPin />
          {location.address}
        </Location>

        <ReadingsGrid>
          {sensorType === 'air' ? renderAirQualityReadings() : renderWaterQualityReadings()}
        </ReadingsGrid>

        <LastUpdate>
          <FiClock />
          Last updated {getTimeAgo(timestamp)}
        </LastUpdate>
      </Card>
    </Link>
  );
};

export default SensorCard;
