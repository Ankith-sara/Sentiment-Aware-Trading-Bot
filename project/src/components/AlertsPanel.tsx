import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Plus, X, AlertTriangle } from 'lucide-react';
import { useTrading } from '../contexts/TradingContext';

interface Alert {
  id: string;
  type: 'price' | 'sentiment' | 'signal';
  symbol: string;
  condition: string;
  value: number;
  enabled: boolean;
  triggered: boolean;
  createdAt: string;
}

export const AlertsPanel: React.FC = () => {
  const { userPreferences, updateUserPreferences } = useTrading();
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'price',
      symbol: 'AAPL',
      condition: 'above',
      value: 155,
      enabled: true,
      triggered: false,
      createdAt: '2025-01-02T10:00:00Z'
    },
    {
      id: '2',
      type: 'sentiment',
      symbol: 'GOOGL',
      condition: 'below',
      value: -0.5,
      enabled: true,
      triggered: true,
      createdAt: '2025-01-02T09:30:00Z'
    }
  ]);

  const [newAlert, setNewAlert] = useState({
    type: 'price' as const,
    symbol: 'AAPL',
    condition: 'above' as const,
    value: 0
  });

  const handleAddAlert = () => {
    const alert: Alert = {
      id: `alert-${Date.now()}`,
      ...newAlert,
      enabled: true,
      triggered: false,
      createdAt: new Date().toISOString()
    };
    setAlerts(prev => [...prev, alert]);
    setNewAlert({ type: 'price', symbol: 'AAPL', condition: 'above', value: 0 });
  };

  const toggleAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Alert Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Alert Preferences
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-500" />
              <span className="font-medium text-gray-900 dark:text-white">Email Alerts</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={userPreferences.alertSettings.email}
                onChange={(e) => updateUserPreferences({
                  alertSettings: { ...userPreferences.alertSettings, email: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="w-5 h-5 text-green-500" />
              <span className="font-medium text-gray-900 dark:text-white">Push Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={userPreferences.alertSettings.push}
                onChange={(e) => updateUserPreferences({
                  alertSettings: { ...userPreferences.alertSettings, push: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              <span className="font-medium text-gray-900 dark:text-white">Telegram</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={userPreferences.alertSettings.telegram}
                onChange={(e) => updateUserPreferences({
                  alertSettings: { ...userPreferences.alertSettings, telegram: e.target.checked }
                })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Create New Alert */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Create New Alert
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <select
            value={newAlert.type}
            onChange={(e) => setNewAlert(prev => ({ ...prev, type: e.target.value as any }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="price">Price Alert</option>
            <option value="sentiment">Sentiment Alert</option>
            <option value="signal">Signal Alert</option>
          </select>

          <input
            type="text"
            value={newAlert.symbol}
            onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
            placeholder="Symbol"
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          />

          <select
            value={newAlert.condition}
            onChange={(e) => setNewAlert(prev => ({ ...prev, condition: e.target.value as any }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="above">Above</option>
            <option value="below">Below</option>
          </select>

          <div className="flex space-x-2 col-span-full md:col-span-1">
            <input
              type="number"
              step="0.01"
              value={newAlert.value}
              onChange={(e) => setNewAlert(prev => ({ ...prev, value: parseFloat(e.target.value) }))}
              placeholder="Value"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={handleAddAlert}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Active Alerts
        </h3>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                alert.triggered 
                  ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/20' 
                  : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                {alert.triggered && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {alert.symbol}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {alert.type} {alert.condition} {alert.value}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Created {new Date(alert.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={alert.enabled}
                    onChange={() => toggleAlert(alert.id)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 dark:peer-focus:ring-emerald-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-600"></div>
                </label>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};