import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiActivity, 
  FiAlertTriangle, 
  FiCheckCircle, 
  FiXCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiWind,
  FiDroplet
} from 'react-icons/fi';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { DataContext } from '../contexts/DataContext';
import SensorCard from './SensorCard';
import AlertCard from './AlertCard';

const DashboardContainer = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 24px;
  box-shadow: ${props => props.theme.colors.shadow};
  border: 1px solid ${props => props.theme.colors.border};
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch (props.type) {
      case 'sensors': return `${props.theme.colors.primary}15`;
      case 'alerts': return `${props.theme.colors.danger}15`;
      case 'safe': return `${props.theme.colors.success}15`;
      case 'warning': return `${props.theme.colors.warning}15`;
      default: return `${props.theme.colors.primary}15`;
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'sensors': return props.theme.colors.primary;
      case 'alerts': return props.theme.colors.danger;
      case 'safe': return props.theme.colors.success;
      case 'warning': return props.theme.colors.warning;
      default: return props.theme.colors.primary;
    }
  }};
  
  svg {
    font-size: 24px;
  }
`;

const StatValue = styled.div`
  h3 {
    font-size: 32px;
    font-weight: 700;
    margin: 0;
    color: ${props => props.theme.colors.text};
  }
  
  p {
    font-size: 14px;
    color: ${props => props.theme.colors.textSecondary};
    margin: 4px 0 0 0;
  }
`;

const StatTrend = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.positive ? props.theme.colors.success : props.theme.colors.danger};
  
  svg {
    font-size: 16px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin: 30px 0 20px 0;
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: ${props => props.theme.colors.primary};
  }
`;

const SensorsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const ChartContainer = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 24px;
  box-shadow: ${props => props.theme.colors.shadow};
  border: 1px solid ${props => props.theme.colors.border};
  grid-column: span 2;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    grid-column: span 1;
  }
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px 0;
  color: ${props => props.theme.colors.text};
`;

const AlertsContainer = styled.div`
  display: grid;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${props => props.theme.colors.textSecondary};
  
  svg {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
  
  h3 {
    font-size: 18px;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 14px;
    margin: 0;
  }
`;

const Dashboard = () => {
  const { sensorData, alerts, dashboardStats } = useContext(DataContext);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Generate sample chart data for demonstration
    const generateChartData = () => {
      const data = [];
      const now = new Date();
      
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        const airSensors = sensorData.filter(s => s.sensorType === 'air');
        const waterSensors = sensorData.filter(s => s.sensorType === 'water');
        
        data.push({
          time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          pm25: airSensors.length > 0 ? 
            (airSensors[0].readings.pm25 || 0) + (Math.random() - 0.5) * 10 : 
            15 + Math.random() * 20,
          co2: airSensors.length > 0 ? 
            (airSensors[0].readings.co2 || 0) + (Math.random() - 0.5) * 100 : 
            400 + Math.random() * 200,
          ph: waterSensors.length > 0 ? 
            (waterSensors[0].readings.ph || 0) + (Math.random() - 0.5) * 0.5 : 
            7 + (Math.random() - 0.5) * 1,
        });
      }
      
      setChartData(data);
    };

    generateChartData();
    const interval = setInterval(generateChartData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [sensorData]);

  const activeAlerts = alerts.filter(alert => !alert.resolved && !alert.acknowledged);
  const airSensors = sensorData.filter(sensor => sensor.sensorType === 'air');
  const waterSensors = sensorData.filter(sensor => sensor.sensorType === 'water');

  const statusDistribution = dashboardStats.statusDistribution || { safe: 0, warning: 0, danger: 0 };
  const pieData = [
    { name: 'Safe', value: statusDistribution.safe, color: '#10b981' },
    { name: 'Warning', value: statusDistribution.warning, color: '#f59e0b' },
    { name: 'Danger', value: statusDistribution.danger, color: '#ef4444' }
  ];

  return (
    <div>
      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatHeader>
            <StatIcon type="sensors">
              <FiActivity />
            </StatIcon>
            <StatTrend positive={true}>
              <FiTrendingUp />
              +2
            </StatTrend>
          </StatHeader>
          <StatValue>
            <h3>{dashboardStats.totalSensors || sensorData.length}</h3>
            <p>Active Sensors</p>
          </StatValue>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatHeader>
            <StatIcon type="alerts">
              <FiAlertTriangle />
            </StatIcon>
            <StatTrend positive={false}>
              <FiTrendingUp />
              {activeAlerts.length}
            </StatTrend>
          </StatHeader>
          <StatValue>
            <h3>{activeAlerts.length}</h3>
            <p>Active Alerts</p>
          </StatValue>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatHeader>
            <StatIcon type="safe">
              <FiCheckCircle />
            </StatIcon>
            <StatTrend positive={true}>
              <FiTrendingUp />
              +5%
            </StatTrend>
          </StatHeader>
          <StatValue>
            <h3>{statusDistribution.safe}</h3>
            <p>Safe Sensors</p>
          </StatValue>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatHeader>
            <StatIcon type="warning">
              <FiXCircle />
            </StatIcon>
            <StatTrend positive={false}>
              <FiTrendingDown />
              -2%
            </StatTrend>
          </StatHeader>
          <StatValue>
            <h3>{statusDistribution.warning + statusDistribution.danger}</h3>
            <p>Warning/Danger</p>
          </StatValue>
        </StatCard>
      </StatsGrid>

      <DashboardContainer>
        <ChartContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <ChartTitle>Real-time Environmental Trends (24h)</ChartTitle>
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
                dataKey="pm25" 
                stroke="#ef4444" 
                strokeWidth={2}
                name="PM2.5 (µg/m³)"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="co2" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="CO₂ (ppm)"
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="ph" 
                stroke="#10b981" 
                strokeWidth={2}
                name="pH Level"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <StatCard>
          <ChartTitle>Sensor Status Distribution</ChartTitle>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </StatCard>
      </DashboardContainer>

      <SectionTitle>
        <FiWind />
        Air Quality Sensors
      </SectionTitle>
      <SensorsGrid>
        {airSensors.length > 0 ? (
          airSensors.map(sensor => (
            <SensorCard key={sensor.sensorId} sensor={sensor} />
          ))
        ) : (
          <EmptyState>
            <FiWind />
            <h3>No Air Quality Sensors</h3>
            <p>Waiting for sensor data...</p>
          </EmptyState>
        )}
      </SensorsGrid>

      <SectionTitle>
        <FiDroplet />
        Water Quality Sensors
      </SectionTitle>
      <SensorsGrid>
        {waterSensors.length > 0 ? (
          waterSensors.map(sensor => (
            <SensorCard key={sensor.sensorId} sensor={sensor} />
          ))
        ) : (
          <EmptyState>
            <FiDroplet />
            <h3>No Water Quality Sensors</h3>
            <p>Waiting for sensor data...</p>
          </EmptyState>
        )}
      </SensorsGrid>

      <SectionTitle>
        <FiAlertTriangle />
        Recent Alerts
      </SectionTitle>
      <AlertsContainer>
        {activeAlerts.length > 0 ? (
          activeAlerts.slice(0, 5).map(alert => (
            <AlertCard key={alert.id || alert._id} alert={alert} />
          ))
        ) : (
          <EmptyState>
            <FiCheckCircle />
            <h3>No Active Alerts</h3>
            <p>All systems are operating normally</p>
          </EmptyState>
        )}
      </AlertsContainer>
    </div>
  );
};

export default Dashboard;
