import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAlerts } from '../contexts/AlertContext';
import { useVoice } from '../contexts/VoiceContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Alerts = () => {
  const { t } = useTranslation();
  const { alerts, setAlerts } = useAlerts();
  const { speak } = useVoice();
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [alertsRes, villagesRes] = await Promise.all([
          axios.get(`${API}/alerts`),
          axios.get(`${API}/villages`)
        ]);
        
        setAlerts(alertsRes.data);
        setVillages(villagesRes.data);
      } catch (err) {
        console.error('Error fetching alerts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setAlerts]);

  const dismissAlert = async (alertId) => {
    try {
      await axios.patch(`${API}/alerts/${alertId}/dismiss`);
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (err) {
      console.error('Error dismissing alert:', err);
    }
  };

  const getVillageName = (villageId) => {
    const village = villages.find(v => v.id === villageId);
    return village ? village.name : 'Unknown Village';
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return 'ℹ️';
      default: return '📢';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'from-red-500 to-red-600';
      case 'high': return 'from-orange-500 to-orange-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      case 'low': return 'from-blue-500 to-blue-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.severity === filter;
  });

  const speakAlert = (message) => {
    speak(message);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner"></div>
        <span className="ml-3 text-lg">{t('Loading...')}</span>
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('Alerts')}</h1>
            <p className="text-gray-600 mt-1">
              {filteredAlerts.length} {filter === 'all' ? 'total' : filter} alerts
            </p>
          </div>
          
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
            {['all', 'critical', 'high', 'medium', 'low'].map((severityFilter) => (
              <button
                key={severityFilter}
                onClick={() => setFilter(severityFilter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === severityFilter
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {severityFilter === 'all' ? 'All Alerts' : t(severityFilter)}
                {severityFilter !== 'all' && (
                  <span className="ml-1">
                    {alerts.filter(a => a.severity === severityFilter).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {['critical', 'high', 'medium', 'low'].map((severity) => {
            const count = alerts.filter(alert => alert.severity === severity).length;
            return (
              <motion.div
                key={severity}
                className={`card bg-gradient-to-br ${getSeverityColor(severity)} text-white`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium opacity-90">
                      {t(severity)} {t('Alerts')}
                    </h3>
                    <p className="text-2xl font-bold">{count}</p>
                  </div>
                  <span className="text-2xl">{getSeverityIcon(severity)}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {t('No active alerts')}
              </h3>
              <p className="text-gray-500">
                All villages are operating within normal parameters.
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`card border-l-4 ${
                  alert.severity === 'critical' ? 'border-red-500' :
                  alert.severity === 'high' ? 'border-orange-500' :
                  alert.severity === 'medium' ? 'border-yellow-500' :
                  'border-blue-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-xl mr-2">{getSeverityIcon(alert.severity)}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {t(alert.severity).toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-600 ml-3">
                        {getVillageName(alert.village_id)}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {alert.alert_type.charAt(0).toUpperCase() + alert.alert_type.slice(1)} Alert
                    </h3>
                    
                    <p className="text-gray-700 mb-3">
                      {alert.message}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <span>🕒 {new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <button
                      onClick={() => speakAlert(alert.message)}
                      className="p-2 text-gray-600 hover:text-green-600 transition-colors"
                      title="Listen to alert"
                    >
                      🔊
                    </button>
                    
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm transition-colors"
                    >
                      {t('Dismiss')}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Auto-refresh indicator */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
            Live monitoring active
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Alerts;