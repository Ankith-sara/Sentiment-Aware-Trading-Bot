import React from 'react';
import { PriceChart } from './PriceChart';
import { SentimentOverview } from './SentimentOverview';
import { RecentSignals } from './RecentSignals';
import { MarketSummary } from './MarketSummary';
import { WatchlistPanel } from './WatchlistPanel';
import { TechnicalIndicators } from './TechnicalIndicators';

export const Dashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 lg:p-6 overflow-x-hidden">
      <div className="w-full max-w-screen-2xl mx-auto space-y-4 sm:space-y-6">
        <MarketSummary />
        
        {/* Main Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 sm:gap-6">
          <div className="xl:col-span-3 space-y-4 sm:space-y-6">
            <PriceChart />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <TechnicalIndicators />
              <SentimentOverview />
            </div>
          </div>
          
          <div className="xl:col-span-1">
            <WatchlistPanel />
          </div>
        </div>
        
        <RecentSignals />
      </div>
    </div>
  );
};