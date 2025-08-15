import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiHome, 
  FiActivity, 
  FiAlertTriangle, 
  FiBarChart2,
  FiWifi,
  FiWifiOff
} from 'react-icons/fi';
import { DataContext } from '../contexts/DataContext';

const SidebarContainer = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 250px;
  height: 100vh;
  background: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  padding: 20px;
  z-index: 1000;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    
    &.open {
      transform: translateX(0);
    }
  }
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const LogoIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, ${props => props.theme.colors.primary}, ${props => props.theme.colors.secondary});
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  color: white;
  font-size: 20px;
  font-weight: bold;
`;

const LogoText = styled.div`
  h3 {
    font-size: 16px;
    font-weight: 600;
    margin: 0;
    color: ${props => props.theme.colors.text};
  }
  
  p {
    font-size: 12px;
    color: ${props => props.theme.colors.textSecondary};
    margin: 2px 0 0 0;
  }
`;

const Navigation = styled.nav`
  margin-bottom: 40px;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 8px;
  text-decoration: none;
  color: ${props => props.theme.colors.textSecondary};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
  }
  
  &.active {
    background: ${props => props.theme.colors.primary};
    color: white;
  }
  
  svg {
    margin-right: 12px;
    font-size: 18px;
  }
  
  span {
    font-size: 14px;
    font-weight: 500;
  }
`;

const ConnectionStatus = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  background: ${props => props.connected ? 
    `${props.theme.colors.success}15` : 
    `${props.theme.colors.danger}15`};
  border: 1px solid ${props => props.connected ? 
    props.theme.colors.success : 
    props.theme.colors.danger};
  
  svg {
    margin-right: 8px;
    color: ${props => props.connected ? 
      props.theme.colors.success : 
      props.theme.colors.danger};
  }
  
  span {
    font-size: 12px;
    font-weight: 500;
    color: ${props => props.connected ? 
      props.theme.colors.success : 
      props.theme.colors.danger};
  }
`;

const AlertBadge = styled.span`
  background: ${props => props.theme.colors.danger};
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  margin-left: auto;
`;

const Sidebar = () => {
  const { alerts, isConnected } = useContext(DataContext);
  const activeAlerts = alerts.filter(alert => !alert.resolved && !alert.acknowledged);

  return (
    <SidebarContainer>
      <Logo>
        <LogoIcon>🌍</LogoIcon>
        <LogoText>
          <h3>EcoMonitor</h3>
          <p>Environmental Tracking</p>
        </LogoText>
      </Logo>

      <Navigation>
        <NavItem to="/dashboard">
          <FiHome />
          <span>Dashboard</span>
        </NavItem>
        
        <NavItem to="/alerts">
          <FiAlertTriangle />
          <span>Alerts</span>
          {activeAlerts.length > 0 && (
            <AlertBadge>{activeAlerts.length}</AlertBadge>
          )}
        </NavItem>
        
        <NavItem to="/historical">
          <FiBarChart2 />
          <span>Historical Data</span>
        </NavItem>
      </Navigation>

      <ConnectionStatus connected={isConnected}>
        {isConnected ? <FiWifi /> : <FiWifiOff />}
        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
      </ConnectionStatus>
    </SidebarContainer>
  );
};

export default Sidebar;
