import React, { useContext, useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiFilter, FiDownload } from 'react-icons/fi';
import { DataContext } from '../contexts/DataContext';
import AlertCard from './AlertCard';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: between;
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
    color: ${props => props.theme.colors.danger};
  }
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
`;

const FilterGroup = styled.div`
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

const AlertsGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: ${props => props.theme.colors.textSecondary};
  
  svg {
    font-size: 64px;
    margin-bottom: 20px;
    opacity: 0.3;
  }
  
  h3 {
    font-size: 20px;
    margin: 0 0 8px 0;
    color: ${props => props.theme.colors.text};
  }
  
  p {
    font-size: 16px;
    margin: 0;
  }
`;

const AlertStats = styled.div`
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
    color: ${props => {
      switch (props.type) {
        case 'danger': return props.theme.colors.danger;
        case 'warning': return props.theme.colors.warning;
        case 'total': return props.theme.colors.primary;
        default: return props.theme.colors.text;
      }
    }};
  }
  
  p {
    font-size: 14px;
    color: ${props => props.theme.colors.textSecondary};
    margin: 0;
    font-weight: 500;
  }
`;

const AlertsPage = () => {
  const { alerts } = useContext(DataContext);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sensorFilter, setSensorFilter] = useState('all');

  useEffect(() => {
    let filtered = [...alerts];

    if (severityFilter !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severityFilter);
    }

    if (statusFilter === 'active') {
      filtered = filtered.filter(alert => !alert.resolved && !alert.acknowledged);
    } else if (statusFilter === 'acknowledged') {
      filtered = filtered.filter(alert => alert.acknowledged && !alert.resolved);
    } else if (statusFilter === 'resolved') {
      filtered = filtered.filter(alert => alert.resolved);
    }

    if (sensorFilter !== 'all') {
      filtered = filtered.filter(alert => alert.sensorId === sensorFilter);
    }

    // Sort by creation date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt || b.timestamp) - new Date(a.createdAt || a.timestamp));

    setFilteredAlerts(filtered);
  }, [alerts, severityFilter, statusFilter, sensorFilter]);

  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'Sensor ID', 'Severity', 'Parameter', 'Message', 'Location', 'Status'].join(','),
      ...filteredAlerts.map(alert => [
        new Date(alert.createdAt || alert.timestamp).toISOString(),
        alert.sensorId,
        alert.severity,
        alert.parameter,
        `"${alert.message}"`,
        `"${alert.location?.address || ''}"`,
        alert.resolved ? 'Resolved' : alert.acknowledged ? 'Acknowledged' : 'Active'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const uniqueSensors = [...new Set(alerts.map(alert => alert.sensorId))];
  const dangerAlerts = alerts.filter(alert => alert.severity === 'danger' && !alert.resolved);
  const warningAlerts = alerts.filter(alert => alert.severity === 'warning' && !alert.resolved);
  const activeAlerts = alerts.filter(alert => !alert.resolved && !alert.acknowledged);

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <FiAlertTriangle />
          Alert Management
        </PageTitle>
      </PageHeader>

      <AlertStats>
        <StatCard type="total">
          <h3>{alerts.length}</h3>
          <p>Total Alerts</p>
        </StatCard>
        <StatCard type="danger">
          <h3>{dangerAlerts.length}</h3>
          <p>Critical Alerts</p>
        </StatCard>
        <StatCard type="warning">
          <h3>{warningAlerts.length}</h3>
          <p>Warning Alerts</p>
        </StatCard>
        <StatCard>
          <h3>{activeAlerts.length}</h3>
          <p>Active Alerts</p>
        </StatCard>
      </AlertStats>

      <FilterBar>
        <FilterGroup>
          <FiFilter />
          <label>Filters:</label>
        </FilterGroup>
        
        <FilterGroup>
          <label>Severity:</label>
          <Select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="danger">Danger</option>
            <option value="warning">Warning</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <label>Status:</label>
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="acknowledged">Acknowledged</option>
            <option value="resolved">Resolved</option>
          </Select>
        </FilterGroup>

        <FilterGroup>
          <label>Sensor:</label>
          <Select 
            value={sensorFilter} 
            onChange={(e) => setSensorFilter(e.target.value)}
          >
            <option value="all">All Sensors</option>
            {uniqueSensors.map(sensorId => (
              <option key={sensorId} value={sensorId}>{sensorId}</option>
            ))}
          </Select>
        </FilterGroup>

        <ExportButton onClick={handleExport}>
          <FiDownload />
          Export CSV
        </ExportButton>
      </FilterBar>

      <AlertsGrid>
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert.id || alert._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <AlertCard alert={alert} />
            </motion.div>
          ))
        ) : (
          <EmptyState>
            <FiAlertTriangle />
            <h3>No Alerts Found</h3>
            <p>No alerts match your current filter criteria</p>
          </EmptyState>
        )}
      </AlertsGrid>
    </PageContainer>
  );
};

export default AlertsPage;
