import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  FiBarChart2,  // FIXED: FiBarChart3 → FiBarChart2
  FiDownload, 
  FiCalendar,
  FiTrendingUp,
  FiTrendingDown
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
  BarChart,
  Bar
} from 'recharts';

// --- Styled Components ---
const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: ${props => props.theme.colors.primary};
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  
  label {
    font-size: 14px;
    font-weight: 500;
    color: ${props => props.theme.colors.text};
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const DateInput = styled.input`
  padding: 8px 12px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 6px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: auto;
  
  &:hover {
    background: ${props => props.theme.colors.primary}dd;
  }
  
  svg {
    font-size: 16px;
  }
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
  margin-bottom: 30px;
`;

const ChartContainer = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border-radius: 12px;
  padding: 24px;
  box-shadow: ${props => props.theme.colors.shadow};
  border: 1px solid ${props => props.theme.colors.border};
`;

const ChartTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  
  h3 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: ${props => props.theme.colors.text};
  }
`;

const TrendIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.positive ? props.theme.colors.success : props.theme.colors.danger};
  
  svg {
    font-size: 14px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  padding: 20px;
  border: 1px solid ${props => props.theme.colors.border};
  text-align: center;
  
  h3 {
    font-size: 24px;
    font-weight: 700;
    margin: 0 0 4px 0;
    color: ${props => props.theme.colors.text};
  }
  
  p {
    font-size: 14px;
    color: ${props => props.theme.colors.textSecondary};
    margin: 0 0 8px 0;
    font-weight: 500;
  }
  
  .change {
    font-size: 12px;
    font-weight: 600;
    color: ${props => props.positive ? props.theme.colors.success : props.theme.colors.danger};
  }
`;

// --- Component ---
const HistoricalData = () => {
  const [selectedSensor, setSelectedSensor] = useState('AIR_001');
  const [selectedParameter, setSelectedParameter] = useState('pm25');
  const [timePeriod, setTimePeriod] = useState('24h');
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  const sensors = [
    { id: 'AIR_001', name: 'Air Quality Sensor 1', type: 'air' },
    { id: 'AIR_002', name: 'Air Quality Sensor 2', type: 'air' },
    { id: 'WATER_001', name: 'Water Quality Sensor 1', type: 'water' },
    { id: 'WATER_002', name: 'Water Quality Sensor 2', type: 'water' }
  ];

  const parameters = {
    air: [
      { value: 'pm25', label: 'PM2.5 (µg/m³)' },
      { value: 'pm10', label: 'PM10 (µg/m³)' },
      { value: 'co2', label: 'CO₂ (ppm)' },
      { value: 'no2', label: 'NO₂ (µg/m³)' }
    ],
    water: [
      { value: 'ph', label: 'pH Level' },
      { value: 'turbidity', label: 'Turbidity (NTU)' },
      { value: 'dissolvedOxygen', label: 'Dissolved Oxygen (mg/L)' }
    ]
  };

  useEffect(() => {
    fetchHistoricalData();
  }, [selectedSensor, selectedParameter, timePeriod]);

  const fetchHistoricalData = async () => {
    setLoading(true);
    try {
      const mockData = generateMockData();
      setChartData(mockData);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const data = [];
    const now = new Date();
    const hours = timePeriod === '1h' ? 1 : timePeriod === '6h' ? 6 : timePeriod === '24h' ? 24 : timePeriod === '7d' ? 168 : 720;
    const interval = timePeriod === '7d' ? 6 : timePeriod === '30d' ? 24 : 1;

    for (let i = hours; i >= 0; i -= interval) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      let value;

      switch (selectedParameter) {
        case 'pm25':
          value = 15 + Math.random() * 30 + Math.sin(i / 12) * 10;
          break;
        case 'pm10':
          value = 25 + Math.random() * 40 + Math.sin(i / 12) * 15;
          break;
        case 'co2':
          value = 400 + Math.random() * 300 + Math.sin(i / 24) * 100;
          break;
        case 'no2':
          value = 20 + Math.random() * 50 + Math.sin(i / 8) * 20;
          break;
        case 'ph':
          value = 7 + (Math.random() - 0.5) * 2 + Math.sin(i / 6) * 0.5;
          break;
        case 'turbidity':
          value = 1 + Math.random() * 4 + Math.sin(i / 4) * 2;
          break;
        case 'dissolvedOxygen':
          value = 8 + Math.random() * 3 + Math.sin(i / 12) * 1;
          break;
        default:
          value = Math.random() * 100;
      }

      data.push({
        timestamp: time.toISOString(),
        time: time.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          ...(timePeriod === '7d' || timePeriod === '30d' ? { month: 'short', day: 'numeric' } : {})
        }),
        value: Math.max(0, value),
        threshold: getThreshold(selectedParameter)
      });
    }

    return data.reverse();
  };

  const getThreshold = (parameter) => {
    const thresholds = {
      pm25: 35,
      pm10: 50,
      co2: 1000,
      no2: 100,
      ph: 7.5,
      turbidity: 4,
      dissolvedOxygen: 5
    };
    return thresholds[parameter] || 0;
  };

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'Value', 'Threshold'].join(','),
      ...chartData.map(item => [
        item.timestamp,
        item.value.toFixed(2),
        item.threshold
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedSensor}_${selectedParameter}_${timePeriod}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const selectedSensorObj = sensors.find(s => s.id === selectedSensor);
  const availableParameters = parameters[selectedSensorObj?.type] || [];
  const currentParameter = availableParameters.find(p => p.value === selectedParameter);

  const values = chartData.map(d => d.value);
  const avgValue = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const maxValue = values.length > 0 ? Math.max(...values) : 0;
  const minValue = values.length > 0 ? Math.min(...values) : 0;
  const trend = values.length > 1 ? values[values.length - 1] - values[0] : 0;

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <FiBarChart2 /> {/* FIXED */}
          Historical Data Analysis
        </PageTitle>
      </PageHeader>

      <Controls>
        <ControlGroup>
          <label>Sensor:</label>
          <Select 
            value={selectedSensor} 
            onChange={(e) => setSelectedSensor(e.target.value)}
          >
            {sensors.map(sensor => (
              <option key={sensor.id} value={sensor.id}>
                {sensor.name}
              </option>
            ))}
          </Select>
        </ControlGroup>

        <ControlGroup>
          <label>Parameter:</label>
          <Select 
            value={selectedParameter} 
            onChange={(e) => setSelectedParameter(e.target.value)}
          >
            {availableParameters.map(param => (
              <option key={param.value} value={param.value}>
                {param.label}
              </option>
            ))}
          </Select>
        </ControlGroup>

        <ControlGroup>
          <label>Period:</label>
          <Select 
            value={timePeriod} 
            onChange={(e) => setTimePeriod(e.target.value)}
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </Select>
        </ControlGroup>

        <ExportButton onClick={handleExport}>
          <FiDownload />
          Export Data
        </ExportButton>
      </Controls>

      <StatsGrid>
        <StatCard>
          <h3>{avgValue.toFixed(2)}</h3>
          <p>Average</p>
          <div className="change">
            {trend > 0 ? '+' : ''}{trend.toFixed(2)} from start
          </div>
        </StatCard>
        <StatCard>
          <h3>{maxValue.toFixed(2)}</h3>
          <p>Maximum</p>
        </StatCard>
        <StatCard>
          <h3>{minValue.toFixed(2)}</h3>
          <p>Minimum</p>
        </StatCard>
        <StatCard positive={trend >= 0}>
          <h3>{Math.abs(trend).toFixed(2)}</h3>
          <p>Change</p>
          <div className="change">
            {trend >= 0 ? 'Increasing' : 'Decreasing'}
          </div>
        </StatCard>
      </StatsGrid>

      <ChartsGrid>
        <ChartContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ChartTitle>
            <h3>{currentParameter?.label} Trend</h3>
            <TrendIndicator positive={trend >= 0}>
              {trend >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
              {trend >= 0 ? 'Increasing' : 'Decreasing'}
            </TrendIndicator>
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
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
              <Area
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                fill="#2563eb20"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="threshold"
                stroke="#ef4444"
                strokeDasharray="5 5"
                strokeWidth={1}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ChartTitle>
            <h3>Threshold Violations</h3>
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.filter(d => d.value > d.threshold)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="time" 
                stroke="#6b7280"
                fontSize={12}
              />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip />
              <Bar dataKey="value" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ChartsGrid>
    </PageContainer>
  );
};

export default HistoricalData;
