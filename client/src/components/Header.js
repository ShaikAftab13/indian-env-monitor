import React, { useContext } from 'react';
import styled from 'styled-components';
import { FiBell, FiSettings, FiUser } from 'react-icons/fi';
import { DataContext } from '../contexts/DataContext';

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  box-shadow: ${props => props.theme.colors.shadow};
`;

const HeaderTitle = styled.div`
  h1 {
    font-size: 24px;
    font-weight: 600;
    color: ${props => props.theme.colors.text};
    margin: 0;
  }
  
  p {
    font-size: 14px;
    color: ${props => props.theme.colors.textSecondary};
    margin: 4px 0 0 0;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const NotificationButton = styled.button`
  position: relative;
  background: none;
  border: none;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  color: ${props => props.theme.colors.textSecondary};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
  }
  
  svg {
    font-size: 20px;
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  background: ${props => props.theme.colors.danger};
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserProfile = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.theme.colors.background};
  }
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: 600;
`;

const UserInfo = styled.div`
  span {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: ${props => props.theme.colors.text};
  }
  
  small {
    font-size: 12px;
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const Header = () => {
  const { alerts } = useContext(DataContext);
  const activeAlerts = alerts.filter(alert => !alert.resolved && !alert.acknowledged);

  const getCurrentTime = () => {
    return new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <HeaderContainer>
      <HeaderTitle>
        <h1>Environmental Monitoring Dashboard</h1>
        <p>{getCurrentTime()}</p>
      </HeaderTitle>
      
      <HeaderActions>
        <NotificationButton>
          <FiBell />
          {activeAlerts.length > 0 && (
            <NotificationBadge>{activeAlerts.length}</NotificationBadge>
          )}
        </NotificationButton>
        
        <NotificationButton>
          <FiSettings />
        </NotificationButton>
        
        <UserProfile>
          <Avatar>
            <FiUser />
          </Avatar>
          <UserInfo>
            <span>Admin User</span>
            <small>Environmental Monitor</small>
          </UserInfo>
        </UserProfile>
      </HeaderActions>
    </HeaderContainer>
  );
};

export default Header;
