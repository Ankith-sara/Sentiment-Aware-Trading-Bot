import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import io from 'socket.io-client'

const PriceChart = ({ symbol = 'AAPL' }) => {
  const [liveData, setLiveData] = useState([])
  const [socket, setSocket] = useState(null)

  // Fetch historical data
  const { data: historicalData, isLoading } = useQuery({
    queryKey: ['price-data', symbol],
    queryFn: () => fetch(`/api/market-data/${symbol}`).then(res => res.json()),
  })

  // Setup WebSocket for live updates
  useEffect(() => {
    const newSocket = io(import.meta.env.VITE_WS_URL)
    setSocket(newSocket)

    newSocket.on('price-update', (data) => {
      if (data.symbol === symbol) {
        setLiveData(prev => [...prev.slice(-99), {
          time: new Date(data.timestamp).toLocaleTimeString(),
          price: data.price,
          timestamp: data.timestamp
        }])
      }
    })

    return () => newSocket.close()
  }, [symbol])

  const chartData = historicalData || liveData

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{symbol} Price Chart</h3>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm bg-primary-100 text-primary-700 rounded">1D</button>
          <button className="px-3 py-1 text-sm text-gray-600 rounded">1W</button>
          <button className="px-3 py-1 text-sm text-gray-600 rounded">1M</button>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
          <Tooltip 
            formatter={(value) => [`$${value.toFixed(2)}`, 'Price']}
            labelFormatter={(label) => `Time: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="price" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default PriceChart