import React, { useState } from 'react';
import { Key, Shield, AlertTriangle, Save, Eye, EyeOff, Zap, Target} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { firebaseService, UserConfiguration } from '../services/firebase';

const SettingsPanel: React.FC = () => {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<UserConfiguration | null>(null);
  const [editedSettings, setEditedSettings] = useState<Partial<UserConfiguration>>({});

  // Load user configuration from Firebase
  React.useEffect(() => {
    if (!currentUser) return;

    const loadSettings = async () => {
      try {
        setLoading(true);
        let userConfig = await firebaseService.getUserConfiguration(currentUser.uid);
        
        if (!userConfig) {
          // Create default configuration
          await firebaseService.createDefaultUserConfiguration(currentUser.uid);
          userConfig = await firebaseService.getUserConfiguration(currentUser.uid);
        }
        
        setSettings(userConfig);
        setEditedSettings(userConfig || {});
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [currentUser]);

  const [defaultSettings] = useState({
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
    setEditedSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!currentUser || !settings) return;
    
    try {
      await firebaseService.updateUserConfiguration(currentUser.uid, editedSettings);
      const updatedConfig = await firebaseService.getUserConfiguration(currentUser.uid);
      setSettings(updatedConfig);
      console.log('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const tradingModes = [
    { value: 'paper', label: 'Paper Trading', description: 'Simulate trades without real money' },
    { value: 'live', label: 'Live Trading', description: 'Execute real trades with actual funds' }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <span className={`ml-4 text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Loading settings...</span>
        </div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <p className={`text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`rounded-2xl shadow-xl border p-6 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h2 className={`text-xl font-semibold flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <Shield className="h-6 w-6 mr-3 text-blue-500" />
          Bot Configuration
        </h2>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Configure your sentiment-aware trading bot settings and risk parameters.
        </p>
      </div>

      {/* API Configuration */}
      <div className={`rounded-2xl shadow-xl border p-6 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`text-lg font-semibold flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <Key className="h-5 w-5 mr-2 text-yellow-500" />
            API Configuration
          </h3>
            value={editedSettings.takeProfitPercentage || settings.takeProfitPercentage}
            onClick={() => setShowApiKeys(!showApiKeys)}
            className={`flex items-center space-x-2 transition-colors duration-300 ${
              isDark 
                ? 'text-gray-400 hover:text-white' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {showApiKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showApiKeys ? 'Hide' : 'Show'} Keys</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Alpaca API Key
            </label>
            <input
              type={showApiKeys ? 'text' : 'password'}
              value={editedSettings.apiKeys?.alpacaApiKey || ''}
              onChange={(e) => handleInputChange('apiKeys', {...editedSettings.apiKeys, alpacaApiKey: e.target.value})}
              className={`w-full border rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Enter your Alpaca API key"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Alpaca Secret Key
            </label>
            <input
              type={showApiKeys ? 'text' : 'password'}
              value={editedSettings.apiKeys?.alpacaSecretKey || ''}
              onChange={(e) => handleInputChange('apiKeys', {...editedSettings.apiKeys, alpacaSecretKey: e.target.value})}
              className={`w-full border rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Enter your Alpaca secret key"
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Finnhub API Key
            </label>
            <input
              type={showApiKeys ? 'text' : 'password'}
              value={editedSettings.apiKeys?.finnhubApiKey || ''}
              onChange={(e) => handleInputChange('apiKeys', {...editedSettings.apiKeys, finnhubApiKey: e.target.value})}
              className={`w-full border rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Enter your Finnhub API key"
            />
          </div>
        </div>

        <div className={`mt-4 p-4 border rounded-lg ${
          isDark 
            ? 'bg-blue-900/30 border-blue-700' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-start space-x-2">
            <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <p className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>Security Note</p>
              <p className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-600'}`}>
                API keys are encrypted and securely stored. Never share your keys with third parties.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Configuration */}
      <div className={`rounded-2xl shadow-xl border p-6 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold flex items-center mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <Zap className="h-5 w-5 mr-2 text-green-500" />
          Trading Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Trading Mode
            </label>
            <select
              value={editedSettings.tradingMode || settings.tradingMode}
              onChange={(e) => handleInputChange('tradingMode', e.target.value)}
              className={`w-full border rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {tradingModes.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {tradingModes.find(mode => mode.value === (editedSettings.tradingMode || settings.tradingMode))?.description}
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Max Position Size ($)
            </label>
            <input
              type="number"
              value={editedSettings.maxPositionSize || settings.maxPositionSize}
              onChange={(e) => handleInputChange('maxPositionSize', parseInt(e.target.value))}
              className={`w-full border rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Max Daily Loss ($)
            </label>
            <input
              type="number"
              value={editedSettings.maxDailyLoss || settings.maxDailyLoss}
              onChange={(e) => handleInputChange('maxDailyLoss', parseInt(e.target.value))}
              className={`w-full border rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Max Open Positions
            </label>
            <input
              type="number"
              value={editedSettings.maxOpenPositions || settings.maxOpenPositions}
              onChange={(e) => handleInputChange('maxOpenPositions', parseInt(e.target.value))}
              className={`w-full border rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Sentiment Configuration */}
      <div className={`rounded-2xl shadow-xl border p-6 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold flex items-center mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <Target className="h-5 w-5 mr-2 text-purple-500" />
          Sentiment Analysis
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Min Sentiment Threshold ({((editedSettings.minSentimentThreshold || settings.minSentimentThreshold) * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={editedSettings.minSentimentThreshold || settings.minSentimentThreshold}
              onChange={(e) => handleInputChange('minSentimentThreshold', parseFloat(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Minimum sentiment score to trigger buy signals
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Max Sentiment Threshold ({((editedSettings.maxSentimentThreshold || settings.maxSentimentThreshold) * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={editedSettings.maxSentimentThreshold || settings.maxSentimentThreshold}
              onChange={(e) => handleInputChange('maxSentimentThreshold', parseFloat(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Maximum sentiment score to trigger sell signals
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Sentiment Weight ({((editedSettings.sentimentWeight || settings.sentimentWeight) * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={editedSettings.sentimentWeight || settings.sentimentWeight}
              onChange={(e) => {
                const sentiment = parseFloat(e.target.value);
                handleInputChange('sentimentWeight', sentiment);
                handleInputChange('technicalWeight', 1 - sentiment);
              }}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              How much to weight sentiment vs technical analysis
            </p>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Technical Weight ({((editedSettings.technicalWeight || settings.technicalWeight) * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={editedSettings.technicalWeight || settings.technicalWeight}
              onChange={(e) => {
                const technical = parseFloat(e.target.value);
                handleInputChange('technicalWeight', technical);
                handleInputChange('sentimentWeight', 1 - technical);
              }}
              className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                isDark ? 'bg-gray-700' : 'bg-gray-200'
              }`}
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              How much to weight technical analysis vs sentiment
            </p>
          </div>
        </div>
      </div>

      {/* Risk Management */}
      <div className={`rounded-2xl shadow-xl border p-6 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold flex items-center mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
          Risk Management
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Stop Loss Percentage (%)
            </label>
            <input
              type="number"
              step="0.5"
              value={editedSettings.stopLossPercentage || settings.stopLossPercentage}
              onChange={(e) => handleInputChange('stopLossPercentage', parseFloat(e.target.value))}
              className={`w-full border rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Take Profit Percentage (%)
            </label>
            <input
              type="number"
              step="0.5"
              value={settings.takeProfitPercentage}
              onChange={(e) => handleInputChange('takeProfitPercentage', parseFloat(e.target.value))}
              className={`w-full border rounded-lg px-3 py-2 focus:border-blue-500 focus:outline-none transition-colors duration-300 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className={`rounded-2xl shadow-xl border p-6 ${
        isDark 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Notification Settings
        </h3>

        <div className="space-y-4">
          {[
            { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
            { key: 'tradeAlerts', label: 'Trade Alerts', description: 'Get notified when trades are executed' },
            { key: 'sentimentAlerts', label: 'Sentiment Alerts', description: 'Alerts for significant sentiment changes' },
            { key: 'riskAlerts', label: 'Risk Alerts', description: 'Notifications for risk threshold breaches' },
          ].map((setting) => (
            <div key={setting.key} className={`flex items-center justify-between p-4 rounded-lg ${
              isDark ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <div>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{setting.label}</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{setting.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={(editedSettings.notifications as any)?.[setting.key] ?? (settings.notifications as any)?.[setting.key] ?? false}
                  onChange={(e) => handleInputChange('notifications', {...editedSettings.notifications, [setting.key]: e.target.checked})}
                  className="sr-only peer"
                />
                <div className={`w-11 h-6 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${
                  isDark ? 'bg-gray-600' : 'bg-gray-300'
                }`}></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 font-medium"
        >
          <Save className="h-5 w-5" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;