import React, { useState } from 'react';
import { Key, Shield, AlertTriangle, Save, Eye, EyeOff, Zap, Target, DollarSign } from 'lucide-react';

const SettingsPanel: React.FC = () => {
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [settings, setSettings] = useState({
    // API Configuration
    alpacaApiKey: '••••••••••••••••',
    alpacaSecretKey: '••••••••••••••••',
    finnhubApiKey: '••••••••••••••••',
    
    // Trading Settings
    maxPositionSize: 10000,
    maxDailyLoss: 1000,
    minSentimentThreshold: 0.6,
    maxSentimentThreshold: 0.8,
    
    // Risk Management
    stopLossPercentage: 5,
    takeProfitPercentage: 15,
    maxOpenPositions: 5,
    
    // Bot Configuration
    botEnabled: true,
    tradingMode: 'live', // 'paper' or 'live'
    autoRebalance: true,
    sentimentWeight: 0.7,
    technicalWeight: 0.3,
    
    // Notifications
    emailNotifications: true,
    tradeAlerts: true,
    sentimentAlerts: true,
    riskAlerts: true,
  });

  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Simulate saving settings
    console.log('Saving settings:', settings);
    // In a real app, this would make an API call
  };

  const tradingModes = [
    { value: 'paper', label: 'Paper Trading', description: 'Simulate trades without real money' },
    { value: 'live', label: 'Live Trading', description: 'Execute real trades with actual funds' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <Shield className="h-6 w-6 mr-3 text-blue-500" />
          Bot Configuration
        </h2>
        <p className="text-slate-400 mt-2">Configure your sentiment-aware trading bot settings and risk parameters.</p>
      </div>

      {/* API Configuration */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Key className="h-5 w-5 mr-2 text-yellow-500" />
            API Configuration
          </h3>
          <button
            onClick={() => setShowApiKeys(!showApiKeys)}
            className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
          >
            {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showApiKeys ? 'Hide' : 'Show'} Keys</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Alpaca API Key</label>
            <input
              type={showApiKeys ? 'text' : 'password'}
              value={settings.alpacaApiKey}
              onChange={(e) => handleInputChange('alpacaApiKey', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              placeholder="Enter your Alpaca API key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Alpaca Secret Key</label>
            <input
              type={showApiKeys ? 'text' : 'password'}
              value={settings.alpacaSecretKey}
              onChange={(e) => handleInputChange('alpacaSecretKey', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              placeholder="Enter your Alpaca secret key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Finnhub API Key</label>
            <input
              type={showApiKeys ? 'text' : 'password'}
              value={settings.finnhubApiKey}
              onChange={(e) => handleInputChange('finnhubApiKey', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
              placeholder="Enter your Finnhub API key"
            />
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-900 border border-blue-700 rounded-lg">
          <div className="flex items-start space-x-2">
            <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-blue-300 font-medium">Security Note</p>
              <p className="text-blue-200 text-sm">API keys are encrypted and securely stored. Never share your keys with third parties.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Configuration */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white flex items-center mb-6">
          <Zap className="h-5 w-5 mr-2 text-green-500" />
          Trading Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Trading Mode</label>
            <select
              value={settings.tradingMode}
              onChange={(e) => handleInputChange('tradingMode', e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            >
              {tradingModes.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
            <p className="text-slate-400 text-xs mt-1">
              {tradingModes.find(mode => mode.value === settings.tradingMode)?.description}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Max Position Size ($)</label>
            <input
              type="number"
              value={settings.maxPositionSize}
              onChange={(e) => handleInputChange('maxPositionSize', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Max Daily Loss ($)</label>
            <input
              type="number"
              value={settings.maxDailyLoss}
              onChange={(e) => handleInputChange('maxDailyLoss', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Max Open Positions</label>
            <input
              type="number"
              value={settings.maxOpenPositions}
              onChange={(e) => handleInputChange('maxOpenPositions', parseInt(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Sentiment Configuration */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white flex items-center mb-6">
          <Target className="h-5 w-5 mr-2 text-purple-500" />
          Sentiment Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Min Sentiment Threshold ({(settings.minSentimentThreshold * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.minSentimentThreshold}
              onChange={(e) => handleInputChange('minSentimentThreshold', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-slate-400 text-xs mt-1">Minimum sentiment score to trigger buy signals</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Max Sentiment Threshold ({(settings.maxSentimentThreshold * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.maxSentimentThreshold}
              onChange={(e) => handleInputChange('maxSentimentThreshold', parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-slate-400 text-xs mt-1">Maximum sentiment score to trigger sell signals</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Sentiment Weight ({(settings.sentimentWeight * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.sentimentWeight}
              onChange={(e) => {
                const sentiment = parseFloat(e.target.value);
                handleInputChange('sentimentWeight', sentiment);
                handleInputChange('technicalWeight', 1 - sentiment);
              }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-slate-400 text-xs mt-1">How much to weight sentiment vs technical analysis</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Technical Weight ({(settings.technicalWeight * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.technicalWeight}
              onChange={(e) => {
                const technical = parseFloat(e.target.value);
                handleInputChange('technicalWeight', technical);
                handleInputChange('sentimentWeight', 1 - technical);
              }}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <p className="text-slate-400 text-xs mt-1">How much to weight technical analysis vs sentiment</p>
          </div>
        </div>
      </div>

      {/* Risk Management */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white flex items-center mb-6">
          <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
          Risk Management
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Stop Loss Percentage (%)</label>
            <input
              type="number"
              step="0.5"
              value={settings.stopLossPercentage}
              onChange={(e) => handleInputChange('stopLossPercentage', parseFloat(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Take Profit Percentage (%)</label>
            <input
              type="number"
              step="0.5"
              value={settings.takeProfitPercentage}
              onChange={(e) => handleInputChange('takeProfitPercentage', parseFloat(e.target.value))}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-6">Notification Settings</h3>

        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
            { key: 'tradeAlerts', label: 'Trade Alerts', description: 'Get notified when trades are executed' },
            { key: 'sentimentAlerts', label: 'Sentiment Alerts', description: 'Alerts for significant sentiment changes' },
            { key: 'riskAlerts', label: 'Risk Alerts', description: 'Notifications for risk threshold breaches' },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
              <div>
                <p className="text-white font-medium">{setting.label}</p>
                <p className="text-slate-400 text-sm">{setting.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[setting.key as keyof typeof settings] as boolean}
                  onChange={(e) => handleInputChange(setting.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
        >
          <Save className="h-5 w-5" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;