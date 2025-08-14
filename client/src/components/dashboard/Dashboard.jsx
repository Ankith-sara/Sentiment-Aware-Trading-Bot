import React from 'react'
import { useQuery } from '@tanstack/react-query'
import Sidebar from './Sidebar'
import Header from './Header'
import PortfolioOverview from './PortfolioOverview'
import PriceChart from './PriceChart'
import SentimentGauge from './SentimentGauge'
import NewsFeeed from './NewsFeed'
import TradeHistory from './TradeHistory'
import Watchlist from './Watchlist'
import { tradingApi } from '../../services/api'

const Dashboard = () => {
  const { data: portfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: tradingApi.getPortfolio,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const { data: trades } = useQuery({
    queryKey: ['trades'],
    queryFn: tradingApi.getTrades,
  })

  const { data: watchlist } = useQuery({
    queryKey: ['watchlist'],
    queryFn: tradingApi.getWatchlist,
  })

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Portfolio Overview */}
            <div className="lg:col-span-2">
              <PortfolioOverview 
                portfolio={portfolio} 
                loading={portfolioLoading} 
              />
            </div>
            
            {/* Sentiment Gauge */}
            <div>
              <SentimentGauge />
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
            {/* Price Chart */}
            <div className="xl:col-span-2">
              <PriceChart />
            </div>
            
            {/* Watchlist */}
            <div>
              <Watchlist data={watchlist} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Trade History */}
            <div>
              <TradeHistory trades={trades} />
            </div>
            
            {/* News Feed */}
            <div>
              <NewsFeed />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard