import React from 'react';
import { PriceChart } from './PriceChart';
import { SentimentOverview } from './SentimentOverview';
import { RecentSignals } from './RecentSignals';
import { MarketSummary } from './MarketSummary';
import { WatchlistPanel } from './WatchlistPanel';
import { TechnicalIndicators } from './TechnicalIndicators';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-4 lg:space-y-6">
      <MarketSummary />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="lg:col-span-3 space-y-4 lg:space-y-6">
          <PriceChart />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <TechnicalIndicators />
            <SentimentOverview />
          </div>
        </div>
        <div className="space-y-4 lg:space-y-6">
          <WatchlistPanel />
        </div>
      </div>
      
      <RecentSignals />
    </div>
  );
};