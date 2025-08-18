import React from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

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
  const isPositive = asset.change >= 0;
  const sentimentColor = asset.sentiment >= 0.6 ? 'text-green-400' : 
                        asset.sentiment >= 0.4 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="flex items-center justify-between p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors cursor-pointer">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-sm">{asset.symbol.substring(0, 2)}</span>
        </div>
        <div>
          <div className="text-white font-semibold">{asset.symbol}</div>
          <div className="text-slate-400 text-sm flex items-center">
            <Activity className="w-3 h-3 mr-1" />
            Vol: {(asset.volume / 1000000).toFixed(1)}M
          </div>
        </div>
      </div>

      <div className="text-right">
        <div className="text-white font-semibold">${asset.price.toFixed(2)}</div>
        <div className={`text-sm font-medium flex items-center justify-end ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {isPositive ? '+' : ''}{asset.change.toFixed(2)} ({asset.changePercent.toFixed(2)}%)
        </div>
      </div>

      <div className="text-right ml-4">
        <div className="text-slate-400 text-xs">Sentiment</div>
        <div className={`text-sm font-bold ${sentimentColor}`}>
          {(asset.sentiment * 100).toFixed(0)}%
        </div>
        <div className="w-12 h-1 bg-slate-600 rounded mt-1">
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