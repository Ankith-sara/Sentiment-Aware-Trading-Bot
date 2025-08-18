import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Asset {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  sentiment: number;
  volume: number;
}

interface AssetCardProps {
  asset: Asset;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  const { isDark } = useTheme();
  const isPositive = asset.change >= 0;
  const sentimentColor = asset.sentiment >= 0.6 ? 'text-green-400' : 
                        asset.sentiment >= 0.4 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className={`flex items-center justify-between p-4 rounded-lg transition-colors duration-300 cursor-pointer ${
      isDark 
        ? 'bg-gray-800 hover:bg-gray-700' 
        : 'bg-gray-100 hover:bg-gray-200'
    }`}>
      <div className="flex items-center space-x-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isDark ? 'bg-gray-700' : 'bg-gray-300'
        }`}>
          <span className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-700'}`}>{asset.symbol.substring(0, 2)}</span>
        </div>
        <div>
          <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{asset.symbol}</div>
          <div className={`text-sm flex items-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <Activity className="w-3 h-3 mr-1" />
            Vol: {(asset.volume / 1000000).toFixed(1)}M
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>${asset.price.toFixed(2)}</div>
        <div className={`text-sm font-medium flex items-center justify-end ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {isPositive ? '+' : ''}{asset.change.toFixed(2)} ({asset.changePercent.toFixed(2)}%)
        </div>
      </div>

      <div className="text-right ml-4">
        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Sentiment</div>
        <div className={`text-sm font-bold ${sentimentColor}`}>
          {(asset.sentiment * 100).toFixed(0)}%
        </div>
        <div className={`w-12 h-1 rounded mt-1 ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}>
          <div 
            className={`h-full rounded ${asset.sentiment >= 0.6 ? 'bg-green-400' : 
                                        asset.sentiment >= 0.4 ? 'bg-yellow-400' : 'bg-red-400'}`}
            style={{ width: `${asset.sentiment * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default AssetCard;