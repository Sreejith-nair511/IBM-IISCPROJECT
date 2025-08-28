import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { motion } from 'framer-motion';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icon for critical alerts
const criticalIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" fill="none">
      <circle cx="12.5" cy="12.5" r="10" fill="#ef4444" stroke="#fff" stroke-width="2"/>
      <path fill="#fff" d="M11.5 7h2v6h-2z"/>
      <circle cx="12.5" cy="17" r="1.5" fill="#fff"/>
    </svg>
  `),
  iconSize: [25, 25],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

// Custom icon for normal villages
const normalIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25" fill="none">
      <circle cx="12.5" cy="12.5" r="10" fill="#059669" stroke="#fff" stroke-width="2"/>
      <path fill="#fff" d="M8 12h3v6h3v-6h3l-4.5-4L8 12z"/>
    </svg>
  `),
  iconSize: [25, 25],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12]
});

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const VillageMap = () => {
  const { t } = useTranslation();
  const [villages, setVillages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // India center
  const [mapZoom, setMapZoom] = useState(6);

  useEffect(() => {
    const fetchVillages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API}/villages`);
        setVillages(response.data);
      } catch (err) {
        console.error('Error fetching villages:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVillages();
  }, []);

  const getVillageStatus = (village) => {
    if (!village.alerts || village.alerts.length === 0) return 'normal';
    
    const hasCritical = village.alerts.some(alert => 
      alert.toLowerCase().includes('critical') || 
      alert.toLowerCase().includes('drought')
    );
    
    const hasWarning = village.alerts.some(alert => 
      alert.toLowerCase().includes('warning') ||
      alert.toLowerCase().includes('alert')
    );

    if (hasCritical) return 'critical';
    if (hasWarning) return 'warning';
    return 'normal';
  };

  const getMarkerColor = (status) => {
    switch (status) {
      case 'critical': return '#ef4444';
      case 'warning': return '#f59e0b';
      default: return '#059669';
    }
  };

  const focusOnVillage = (village) => {
    setMapCenter(village.coords);
    setMapZoom(12);
    setSelectedVillage(village);
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
    <div className="h-screen flex">
      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className="w-80 bg-white shadow-lg overflow-y-auto custom-scrollbar"
      >
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">{t('Village Map')}</h2>
          <p className="text-gray-600 text-sm mt-1">
            {villages.length} {t('Total Villages')}
          </p>
        </div>

        <div className="p-4">
          <div className="space-y-3">
            {villages.map((village) => {
              const status = getVillageStatus(village);
              return (
                <motion.div
                  key={village.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedVillage?.id === village.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => focusOnVillage(village)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{village.name}</h3>
                      <p className="text-sm text-gray-600">
                        {village.district}, {t(village.state)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t('Crop')}: {village.crop}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: getMarkerColor(status) }}
                      ></div>
                      <span className="text-xs mt-1 capitalize">
                        {status === 'normal' ? '✅' : status === 'warning' ? '⚠️' : '🚨'}
                      </span>
                    </div>
                  </div>
                  
                  {village.alerts && village.alerts.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {village.alerts.slice(0, 2).map((alert, index) => (
                        <div
                          key={index}
                          className={`text-xs p-2 rounded ${
                            alert.toLowerCase().includes('critical')
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {alert.length > 50 ? alert.substring(0, 50) + '...' : alert}
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Map */}
      <div className="flex-1 relative">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="w-full h-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {villages.map((village) => {
            const status = getVillageStatus(village);
            const icon = status === 'critical' ? criticalIcon : normalIcon;
            
            return (
              <Marker
                key={village.id}
                position={village.coords}
                icon={icon}
                eventHandlers={{
                  click: () => setSelectedVillage(village),
                }}
              >
                <Popup>
                  <div className="min-w-64">
                    <h3 className="font-semibold text-lg">{village.name}</h3>
                    <p className="text-gray-600">{village.district}, {t(village.state)}</p>
                    
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{t('Population')}:</span>
                        <span>{village.population?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{t('Crop')}:</span>
                        <span>{village.crop}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>{t('Area')}:</span>
                        <span>{village.area_hectares} {t('hectares')}</span>
                      </div>
                    </div>

                    {village.history && village.history.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <h4 className="font-medium text-sm mb-2">Latest Readings:</h4>
                        <div className="text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>{t('Soil Moisture (%)')}:</span>
                            <span className={village.history[village.history.length - 1].soil_moisture < 20 ? 'text-red-600 font-semibold' : ''}>
                              {village.history[village.history.length - 1].soil_moisture}%
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('Temperature (°C)')}:</span>
                            <span>{village.history[village.history.length - 1].temperature}°C</span>
                          </div>
                          <div className="flex justify-between">
                            <span>{t('Humidity (%)')}:</span>
                            <span>{village.history[village.history.length - 1].humidity}%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {village.alerts && village.alerts.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <h4 className="font-medium text-sm mb-2 text-red-600">Active Alerts:</h4>
                        <div className="space-y-1">
                          {village.alerts.slice(0, 3).map((alert, index) => (
                            <div
                              key={index}
                              className="text-xs p-2 rounded bg-red-100 text-red-800"
                            >
                              {alert}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg">
          <h4 className="font-semibold text-sm mb-2">Legend</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
              <span>Normal Conditions</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span>Warning</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>
              <span>Critical Alert</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VillageMap;