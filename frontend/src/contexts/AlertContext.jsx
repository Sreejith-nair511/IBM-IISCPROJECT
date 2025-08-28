import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AlertContext = createContext();

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const [alertCount, setAlertCount] = useState(0);

  // Fetch alerts on mount and set up polling
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await axios.get(`${API}/alerts`);
        setAlerts(response.data);
        setAlertCount(response.data.length);
      } catch (err) {
        console.error('Error fetching alerts:', err);
      }
    };

    fetchAlerts();

    // Poll for new alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);

    return () => clearInterval(interval);
  }, []);

  const addAlert = (newAlert) => {
    setAlerts(prev => [newAlert, ...prev]);
    setAlertCount(prev => prev + 1);
  };

  const removeAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    setAlertCount(prev => prev - 1);
  };

  const clearAllAlerts = () => {
    setAlerts([]);
    setAlertCount(0);
  };

  const getCriticalAlerts = () => {
    return alerts.filter(alert => alert.severity === 'critical');
  };

  const getAlertsByVillage = (villageId) => {
    return alerts.filter(alert => alert.village_id === villageId);
  };

  const value = {
    alerts,
    alertCount,
    setAlerts,
    addAlert,
    removeAlert,
    clearAllAlerts,
    getCriticalAlerts,
    getAlertsByVillage
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};