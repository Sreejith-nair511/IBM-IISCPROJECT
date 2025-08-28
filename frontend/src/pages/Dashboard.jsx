import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useVoice } from '../contexts/VoiceContext';
import { useAlerts } from '../contexts/AlertContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { t } = useTranslation();
  const { speak } = useVoice();
  const { alerts } = useAlerts();
  const [villages, setVillages] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [villagesRes, statsRes] = await Promise.all([
          axios.get(`${API}/villages`),
          axios.get(`${API}/dashboard/stats`)
        ]);
        
        setVillages(villagesRes.data);
        setDashboardStats(statsRes.data);
        
        if (villagesRes.data.length > 0 && !selectedVillage) {
          setSelectedVillage(villagesRes.data[0]);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedVillage]);

  // Trigger simulation
  const triggerSimulation = async (scenario, severity = 'medium') => {
    if (!selectedVillage) return;
    
    try {
      const response = await axios.post(`${API}/simulate/trigger`, {
        scenario,
        village_id: selectedVillage.id,
        severity
      });
      
      // Speak the alert
      speak(response.data.alert.message);
      
      // Refresh village data
      const villagesRes = await axios.get(`${API}/villages`);
      setVillages(villagesRes.data);
      
      // Update selected village
      const updatedVillage = villagesRes.data.find(v => v.id === selectedVillage.id);
      if (updatedVillage) {
        setSelectedVillage(updatedVillage);
      }
      
    } catch (err) {
      console.error('Error triggering simulation:', err);
    }
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!selectedVillage || !selectedVillage.history) return [];
    return selectedVillage.history.map((item, index) => ({
      ...item,
      dayIndex: index + 1
    }));
  }, [selectedVillage]);

  const temperatureHumidityData = useMemo(() => {
    if (!selectedVillage || !selectedVillage.history) return [];
    return selectedVillage.history.map((item, index) => ({
      day: item.day,
      temperature: item.temperature,
      humidity: item.humidity,
      dayIndex: index + 1
    }));
  }, [selectedVillage]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
        <span className="ml-3 text-lg">{t('Loading...')}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="alert-critical max-w-md">
          <p>{t('Error')}: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="card bg-gradient-to-br from-green-500 to-green-600 text-white"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-sm font-medium opacity-90">{t('Total Villages')}</h3>
            <p className="text-3xl font-bold">{dashboardStats.total_villages || 0}</p>
          </motion.div>
          
          <motion.div
            className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-sm font-medium opacity-90">{t('Active Alerts')}</h3>
            <p className="text-3xl font-bold">{dashboardStats.active_alerts || 0}</p>
          </motion.div>
          
          <motion.div
            className="card bg-gradient-to-br from-red-500 to-red-600 text-white"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-sm font-medium opacity-90">{t('Critical Alerts')}</h3>
            <p className="text-3xl font-bold">{dashboardStats.critical_alerts || 0}</p>
          </motion.div>
          
          <motion.div
            className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-sm font-medium opacity-90">{t('Villages at Risk')}</h3>
            <p className="text-3xl font-bold">{dashboardStats.critical_villages || 0}</p>
          </motion.div>
        </div>

        {/* Village Selection */}
        <div className="card mb-8">
          <h2 className="text-xl font-semibold mb-4">{t('Select Village')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {villages.map((village) => (
              <motion.button
                key={village.id}
                onClick={() => setSelectedVillage(village)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedVillage?.id === village.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="font-semibold text-left">{village.name}</h3>
                <p className="text-sm text-gray-600 text-left">{village.district}, {t(village.state)}</p>
                <p className="text-xs text-gray-500 text-left">{t('Crop')}: {village.crop}</p>
                {village.alerts && village.alerts.length > 0 && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                      {village.alerts.length} {t('Alerts')}
                    </span>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {selectedVillage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Village Details */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">{t('Village Details')}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">{t('Population')}:</span>
                    <span>{selectedVillage.population?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('Area')}:</span>
                    <span>{selectedVillage.area_hectares} {t('hectares')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('Crop')}:</span>
                    <span>{selectedVillage.crop}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('Soil Type')}:</span>
                    <span>{selectedVillage.soil_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">{t('Irrigation')}:</span>
                    <span>{selectedVillage.irrigation_type}</span>
                  </div>
                </div>
              </div>

              {/* Recent Alerts */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">{t('Recent Alerts')}</h3>
                <div className="space-y-2 max-h-48 custom-scrollbar overflow-y-auto">
                  {selectedVillage.alerts && selectedVillage.alerts.length > 0 ? (
                    selectedVillage.alerts.map((alert, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg text-sm ${
                          alert.toLowerCase().includes('critical')
                            ? 'bg-red-100 text-red-800'
                            : alert.toLowerCase().includes('warning')
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {alert}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">{t('No active alerts')}</p>
                  )}
                </div>
              </div>

              {/* Simulation Controls */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">{t('Trigger Simulation')}</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => triggerSimulation('drought', 'critical')}
                    className="btn-danger text-sm"
                  >
                    🌵 {t('Drought Simulation')}
                  </button>
                  <button
                    onClick={() => triggerSimulation('flood', 'high')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
                  >
                    🌊 {t('Flood Simulation')}
                  </button>
                  <button
                    onClick={() => triggerSimulation('pest', 'medium')}
                    className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
                  >
                    🐛 {t('Pest Alert')}
                  </button>
                  <button
                    onClick={() => triggerSimulation('disease', 'high')}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg text-sm"
                  >
                    🦠 {t('Disease Warning')}
                  </button>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Soil Moisture Chart */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">{t('Soil Moisture Trend')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        `${value}%`,
                        t('Soil Moisture (%)')
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="soil_moisture" 
                      stroke="#059669" 
                      strokeWidth={3}
                      dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Temperature & Humidity Chart */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">{t('Temperature & Humidity')}</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={temperatureHumidityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'temperature' ? `${value}°C` : `${value}%`,
                        name === 'temperature' ? t('Temperature (°C)') : t('Humidity (%)')
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#dc2626" 
                      strokeWidth={2}
                      dot={{ fill: '#dc2626', strokeWidth: 2, r: 3 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="humidity" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      dot={{ fill: '#2563eb', strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;