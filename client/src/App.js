import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { Toaster } from 'react-hot-toast';
import io from 'socket.io-client';

import Dashboard from './components/Dashboard';
import SensorDetail from './components/SensorDetail';
import AlertsPage from './components/AlertsPage';
import HistoricalData from './components/HistoricalData';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { SocketContext } from './contexts/SocketContext';
import { DataContext } from './contexts/DataContext';

const theme = {
  colors: {
    primary: '#2563eb',
    secondary: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    success: '#10b981',
    safe: '#10b981',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    shadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
  },
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1280px'
  }
};

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  .recharts-tooltip-wrapper {
    z-index: 1000;
  }
`;

const AppContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 250px;
  
  @media (max-width: ${props => props.theme.breakpoints.tablet}) {
    margin-left: 0;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

function App() {
  const [socket, setSocket] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    // Listen for real-time sensor data
    newSocket.on('sensorData', (data) => {
      setSensorData(prevData => {
        const existingIndex = prevData.findIndex(sensor => sensor.sensorId === data.sensorId);
        if (existingIndex >= 0) {
          const newData = [...prevData];
          newData[existingIndex] = data;
          return newData;
        } else {
          return [...prevData, data];
        }
      });
    });

    // Listen for initial data
    newSocket.on('initialData', (data) => {
      setSensorData(data);
    });

    // Listen for alerts
    newSocket.on('alert', (alert) => {
      setAlerts(prevAlerts => [alert, ...prevAlerts]);
    });

    newSocket.on('activeAlerts', (activeAlerts) => {
      setAlerts(activeAlerts);
    });

    newSocket.on('alertAcknowledged', (alert) => {
      setAlerts(prevAlerts => 
        prevAlerts.map(a => a.id === alert._id ? { ...a, acknowledged: true } : a)
      );
    });

    newSocket.on('alertResolved', (alert) => {
      setAlerts(prevAlerts => 
        prevAlerts.filter(a => a.id !== alert._id)
      );
    });

    // Fetch initial dashboard stats
    fetchDashboardStats();

    return () => {
      newSocket.close();
    };
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const stats = await response.json();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const dataContextValue = {
    sensorData,
    alerts,
    dashboardStats,
    isConnected,
    refreshStats: fetchDashboardStats
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <SocketContext.Provider value={socket}>
        <DataContext.Provider value={dataContextValue}>
          <Router>
            <AppContainer>
              <Sidebar />
              <MainContent>
                <Header />
                <ContentArea>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/sensor/:sensorId" element={<SensorDetail />} />
                    <Route path="/alerts" element={<AlertsPage />} />
                    <Route path="/historical" element={<HistoricalData />} />
                  </Routes>
                </ContentArea>
              </MainContent>
            </AppContainer>
          </Router>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </DataContext.Provider>
      </SocketContext.Provider>
    </ThemeProvider>
  );
}

export default App;
