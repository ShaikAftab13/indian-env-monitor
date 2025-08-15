import { createContext } from 'react';

export const DataContext = createContext({
  sensorData: [],
  alerts: [],
  dashboardStats: {},
  isConnected: false,
  refreshStats: () => {}
});
