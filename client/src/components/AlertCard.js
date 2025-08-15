import React, { useContext } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiAlertTriangle, FiMapPin, FiClock, FiCheck, FiX } from 'react-icons/fi';
import { SocketContext } from '../contexts/SocketContext';
import toast from 'react-hot-toast';

const AlertContainer = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border-radius: 8px;
  padding: 16px;
  border-left: 4px solid ${props => {
    switch (props.severity) {
      case 'danger': return props.theme.colors.danger;
      case 'warning': return props.theme.colors.warning;
      default: return props.theme.colors.textSecondary;
    }
  }};
  box-shadow: ${props => props.theme.colors.shadow};
`;

const AlertHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const AlertInfo = styled.div`
  flex: 1;
`;

const AlertIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => {
    switch (props.severity) {
      case 'danger': return `${props.theme.colors.danger}15`;
      case 'warning': return `${props.theme.colors.warning}15`;
      default: return `${props.theme.colors.textSecondary}15`;
    }
  }};
  color: ${props => {
    switch (props.severity) {
      case 'danger': return props.theme.colors.danger;
      case 'warning': return props.theme.colors.warning;
      default: return props.theme.colors.textSecondary;
    }
  }};
  margin-right: 12px;
  
  svg {
    font-size: 12px;
  }
`;

const AlertContent = styled.div`
  flex: 1;
`;

const AlertTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: ${props => props.theme.colors.text};
`;

const AlertMessage = styled.p`
  font-size: 13px;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 8px 0;
  line-height: 1.4;
`;

const AlertMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: ${props => props.theme.colors.textSecondary};
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  
  svg {
    font-size: 10px;
  }
`;

const AlertActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background: none;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    background: ${props => props.theme.colors.background};
  }
  
  &.acknowledge {
    color: ${props => props.theme.colors.warning};
    border-color: ${props => props.theme.colors.warning};
    
    &:hover {
      background: ${props => props.theme.colors.warning}15;
    }
  }
  
  &.resolve {
    color: ${props => props.theme.colors.success};
    border-color: ${props => props.theme.colors.success};
    
    &:hover {
      background: ${props => props.theme.colors.success}15;
    }
  }
  
  svg {
    font-size: 10px;
  }
`;

const AlertCard = ({ alert }) => {
  const socket = useContext(SocketContext);
  
  const handleAcknowledge = (e) => {
    e.stopPropagation();
    if (socket) {
      socket.emit('acknowledgeAlert', {
        alertId: alert.id || alert._id,
        acknowledgedBy: 'Admin User'
      });
      toast.success('Alert acknowledged');
    }
  };

  const handleResolve = (e) => {
    e.stopPropagation();
    if (socket) {
      socket.emit('resolveAlert', {
        alertId: alert.id || alert._id
      });
      toast.success('Alert resolved');
    }
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

  return (
    <AlertContainer
      severity={alert.severity}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      <AlertHeader>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <AlertIcon severity={alert.severity}>
            <FiAlertTriangle />
          </AlertIcon>
          <AlertContent>
            <AlertTitle>
              {alert.parameter?.toUpperCase()} Alert - {alert.sensorId}
            </AlertTitle>
            <AlertMessage>{alert.message}</AlertMessage>
            <AlertMeta>
              <MetaItem>
                <FiMapPin />
                {alert.location?.address}
              </MetaItem>
              <MetaItem>
                <FiClock />
                {getTimeAgo(alert.timestamp || alert.createdAt)}
              </MetaItem>
            </AlertMeta>
          </AlertContent>
        </div>
        <AlertActions>
          {!alert.acknowledged && (
            <ActionButton className="acknowledge" onClick={handleAcknowledge}>
              <FiCheck />
              Ack
            </ActionButton>
          )}
          <ActionButton className="resolve" onClick={handleResolve}>
            <FiX />
            Resolve
          </ActionButton>
        </AlertActions>
      </AlertHeader>
    </AlertContainer>
  );
};

export default AlertCard;
