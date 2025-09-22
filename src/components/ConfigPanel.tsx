import React, { useState } from 'react';
import { Save, Key, Settings, Bell, Shield, Brain, Target, TrendingUp } from 'lucide-react';
import { useTrading } from '../contexts/TradingContext';

export const ConfigPanel: React.FC = () => {
  const { config, updateConfig, userPreferences, updateUserPreferences } = useTrading();
  const [activeSection, setActiveSection] = useState('trading');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Configuration saved successfully!');
  };

  const sections = [
    { id: 'trading', label: 'Trading Parameters', icon: TrendingUp },
    { id: 'api', label: 'API Configuration', icon: Key },
    { id: 'ai', label: 'AI Settings', icon: Brain },
    { id: 'risk', label: 'Risk Management', icon: Shield },
    { id: 'preferences', label: 'User Preferences', icon: Settings },
  ];

  return (
    <div className="max-w-none space-y-4 lg:space-y-6">
      {/* Section Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto scrollbar-hide">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 px-3 sm:px-4 lg:px-6 py-4 font-medium transition-colors duration-200 whitespace-nowrap min-w-0 text-sm sm:text-base ${
                  activeSection === section.id
                    ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{section.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        {/* Trading Parameters */}
        {activeSection === 'trading' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 lg:p-6 border border-gray-200 dark:border-gray-700 w-full overflow-x-auto">
            <div className="flex items-center space-x-2 mb-6">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Trading Parameters</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 min-w-0">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Primary Stock Symbol
                </label>
                <input
                  type="text"
                  value={config.symbol}
                  onChange={(e) => updateConfig({ symbol: e.target.value.toUpperCase() })}
                  className="w-full min-w-0 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="RELIANCE"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Buy Threshold
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="-1"
                  max="1"
                  value={config.buyThreshold}
                  onChange={(e) => updateConfig({ buyThreshold: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sell Threshold
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="-1"
                  max="1"
                  value={config.sellThreshold}
                  onChange={(e) => updateConfig({ sellThreshold: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maximum Position Size (₹)
                </label>
                <input
                  type="number"
                  min="10000"
                  step="5000"
                  value={config.maxPositionSize}
                  onChange={(e) => updateConfig({ maxPositionSize: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Risk Tolerance
                </label>
                <select
                  value={config.riskTolerance}
                  onChange={(e) => updateConfig({ riskTolerance: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="low">Conservative</option>
                  <option value="medium">Moderate</option>
                  <option value="high">Aggressive</option>
                </select>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="paperTrading"
                  checked={config.enablePaperTrading}
                  onChange={(e) => updateConfig({ enablePaperTrading: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="paperTrading" className="text-sm text-gray-700 dark:text-gray-300">
                  Enable Paper Trading Mode
                </label>
              </div>
            </div>
          </div>
        )}

        {/* AI Settings */}
        {activeSection === 'ai' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-6">
              <Brain className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Model Configuration</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sentiment Analysis Weight
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.sentimentWeight}
                  onChange={(e) => updateConfig({ sentimentWeight: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span className="font-medium">{(config.sentimentWeight * 100).toFixed(0)}%</span>
                  <span>100%</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Technical Analysis Weight
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.technicalWeight}
                  onChange={(e) => updateConfig({ technicalWeight: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span className="font-medium">{(config.technicalWeight * 100).toFixed(0)}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">AI Model Information</h4>
              <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
                <p>• Sentiment Analysis: FinBERT (Financial Domain Optimized)</p>
                <p>• Technical Analysis: Custom ensemble model with RSI, MACD, Bollinger Bands</p>
                <p>• Signal Generation: Weighted fusion of sentiment and technical scores</p>
                <p>• Confidence Scoring: Bayesian uncertainty estimation</p>
              </div>
            </div>
          </div>
        )}

        {/* Risk Management */}
        {activeSection === 'risk' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-6">
              <Shield className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Risk Management</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Stop Loss Percentage
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  step="0.5"
                  value={config.stopLossPercent}
                  onChange={(e) => updateConfig({ stopLossPercent: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Take Profit Percentage
                </label>
                <input
                  type="number"
                  min="5"
                  max="50"
                  step="1"
                  value={config.takeProfitPercent}
                  onChange={(e) => updateConfig({ takeProfitPercent: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Risk Management Rules</h4>
              <div className="text-sm text-red-700 dark:text-red-400 space-y-1">
                <p>• Maximum 3% portfolio risk per trade</p>
                <p>• Automatic stop-loss orders for all positions</p>
                <p>• Position sizing based on volatility and confidence</p>
                <p>• Daily loss limit: 5% of portfolio value</p>
              </div>
            </div>
          </div>
        )}

        {/* API Configuration */}
        {activeSection === 'api' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-6">
              <Key className="w-5 h-5 text-purple-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">API Configuration</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  News API Key
                </label>
                <input
                  type="password"
                  value={config.newsApiKey}
                  onChange={(e) => updateConfig({ newsApiKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter your News API key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alpaca API Key
                </label>
                <input
                  type="password"
                  value={config.alpacaApiKey}
                  onChange={(e) => updateConfig({ alpacaApiKey: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter your Alpaca API key"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Alpaca Secret Key
                </label>
                <input
                  type="password"
                  value={config.alpacaSecret}
                  onChange={(e) => updateConfig({ alpacaSecret: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter your Alpaca secret key"
                />
              </div>
            </div>
          </div>
        )}

        {/* User Preferences */}
        {activeSection === 'preferences' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 mb-6">
              <Settings className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">User Preferences</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trading Style
                </label>
                <select
                  value={userPreferences.tradingStyle}
                  onChange={(e) => updateUserPreferences({ tradingStyle: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="conservative">Conservative</option>
                  <option value="moderate">Moderate</option>
                  <option value="aggressive">Aggressive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Horizon
                </label>
                <select
                  value={userPreferences.timeHorizon}
                  onChange={(e) => updateUserPreferences({ timeHorizon: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="short">Short-term (1-7 days)</option>
                  <option value="medium">Medium-term (1-4 weeks)</option>
                  <option value="long">Long-term (1+ months)</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center space-x-3 mb-4">
                <input
                  type="checkbox"
                  id="notifications"
                  checked={config.enableNotifications}
                  onChange={(e) => updateConfig({ enableNotifications: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500"
                />
                <label htmlFor="notifications" className="text-sm text-gray-700 dark:text-gray-300">
                  Enable real-time notifications for trading signals
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Gemini API Key
              </label>
              <input
                type="password"
                value={config.geminiApiKey || ''}
                onChange={(e) => updateConfig({ geminiApiKey: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter your Gemini API key"
              />
            </div>

            <div>
              <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">Security & Compliance</h4>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                All API keys are encrypted and stored securely. This system is for educational and paper trading purposes only. 
                Always conduct your own research before making investment decisions. Past performance does not guarantee future results.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors duration-200 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};