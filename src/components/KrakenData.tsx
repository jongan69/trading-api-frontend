import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  RefreshCw,
  Search,
  ArrowUpDown
} from 'lucide-react';
import { tradingAPI, KrakenTicker, KrakenOrderBook, KrakenAssetPair } from '../services/api';
import { useApi } from '../hooks/useApi';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface KrakenDataProps {
  className?: string;
}

export const KrakenData: React.FC<KrakenDataProps> = ({ className = '' }) => {
  const [selectedPair, setSelectedPair] = useState('XBTUSD');
  const [searchPair, setSearchPair] = useState('');
  const [orderBookDepth, setOrderBookDepth] = useState(10);

  // API hooks
  const pairs = useApi(() => tradingAPI.getKrakenPairs());
  const ticker = useApi(() => tradingAPI.getKrakenTickerByPair(selectedPair));
  const orderBook = useApi(() => tradingAPI.getKrakenOrderBook(selectedPair, orderBookDepth));
  const trending = useApi(() => tradingAPI.getKrakenTrending(20));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatLargeNumber = (value: number) => {
    if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
    return value.toFixed(2);
  };

  const handlePairSelect = (pair: string) => {
    setSelectedPair(pair);
  };

  const filteredPairs = pairs.data?.filter(pair => 
    pair.name.toLowerCase().includes(searchPair.toLowerCase()) ||
    pair.altname.toLowerCase().includes(searchPair.toLowerCase())
  ).slice(0, 20) || [];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-blue-400" />
            Kraken Exchange Data
          </h2>
          <button 
            onClick={() => {
              pairs.refetch();
              ticker.refetch();
              orderBook.refetch();
              trending.refetch();
            }}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        {/* Pair Selection */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search pairs..."
                  value={searchPair}
                  onChange={(e) => setSearchPair(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm">Depth:</span>
              <select
                value={orderBookDepth}
                onChange={(e) => setOrderBookDepth(Number(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Popular Pairs */}
          <div className="flex flex-wrap gap-2">
            {['XBTUSD', 'ETHUSD', 'ADAUSD', 'DOTUSD', 'LINKUSD'].map((pair) => (
              <button
                key={pair}
                onClick={() => handlePairSelect(pair)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedPair === pair
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {pair}
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {searchPair && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">Search Results</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {filteredPairs.map((pair) => (
                <button
                  key={pair.name}
                  onClick={() => handlePairSelect(pair.name)}
                  className="p-2 bg-slate-900 rounded-lg text-left hover:bg-slate-700 transition-colors"
                >
                  <div className="text-white font-medium text-sm">{pair.name}</div>
                  <div className="text-slate-400 text-xs">{pair.altname}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Pair Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticker Information */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <DollarSign className="text-emerald-400" />
            {selectedPair} Ticker
          </h3>
          
          {ticker.loading && <LoadingSpinner />}
          {ticker.error && <ErrorMessage message={ticker.error} onRetry={ticker.refetch} />}
          {ticker.data && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-1">Current Price</div>
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(ticker.data.price)}
                  </div>
                </div>
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-1">24h Change</div>
                  <div className={`text-xl font-bold flex items-center gap-1 ${
                    ticker.data.change_pct_24h > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {ticker.data.change_pct_24h > 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {ticker.data.change_pct_24h > 0 ? '+' : ''}{ticker.data.change_pct_24h.toFixed(2)}%
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-1">24h High</div>
                  <div className="text-lg font-semibold text-white">
                    {formatCurrency(ticker.data.high_24h)}
                  </div>
                </div>
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-1">24h Low</div>
                  <div className="text-lg font-semibold text-white">
                    {formatCurrency(ticker.data.low_24h)}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-1">24h Volume</div>
                  <div className="text-lg font-semibold text-white">
                    {formatLargeNumber(ticker.data.volume)}
                  </div>
                </div>
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="text-slate-400 text-sm mb-1">24h Change</div>
                  <div className={`text-lg font-semibold ${
                    ticker.data.change_24h > 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {ticker.data.change_24h > 0 ? '+' : ''}{formatCurrency(ticker.data.change_24h)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Book */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <ArrowUpDown className="text-purple-400" />
            Order Book (Depth: {orderBookDepth})
          </h3>
          
          {orderBook.loading && <LoadingSpinner />}
          {orderBook.error && <ErrorMessage message={orderBook.error} onRetry={orderBook.refetch} />}
          {orderBook.data && (
            <div className="space-y-4">
              {/* Asks */}
              <div>
                <h4 className="text-red-400 font-semibold mb-2">Asks (Sell Orders)</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {orderBook.data.asks.slice(0, orderBookDepth).map((ask, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-red-300">{formatCurrency(ask[0])}</span>
                      <span className="text-slate-300">{formatLargeNumber(ask[1])}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Spread */}
              {orderBook.data.asks.length > 0 && orderBook.data.bids.length > 0 && (
                <div className="bg-slate-900 rounded-lg p-3 text-center">
                  <div className="text-slate-400 text-sm mb-1">Spread</div>
                  <div className="text-white font-semibold">
                    {formatCurrency(orderBook.data.asks[0][0] - orderBook.data.bids[0][0])}
                  </div>
                </div>
              )}
              
              {/* Bids */}
              <div>
                <h4 className="text-emerald-400 font-semibold mb-2">Bids (Buy Orders)</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {orderBook.data.bids.slice(0, orderBookDepth).map((bid, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-emerald-300">{formatCurrency(bid[0])}</span>
                      <span className="text-slate-300">{formatLargeNumber(bid[1])}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Trending Pairs */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="text-orange-400" />
          Trending Pairs
        </h3>
        
        {trending.loading && <LoadingSpinner />}
        {trending.error && <ErrorMessage message={trending.error} onRetry={trending.refetch} />}
        {trending.data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trending.data.slice(0, 12).map((pair: any, index) => (
              <div key={index} className="bg-slate-900 rounded-lg p-4 hover:bg-slate-750 transition-colors cursor-pointer"
                   onClick={() => handlePairSelect(pair.pair || pair.name)}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-white font-medium">{pair.pair || pair.name}</div>
                  <div className="text-slate-400 text-sm">#{index + 1}</div>
                </div>
                <div className="text-slate-400 text-sm">
                  {pair.volume && <div>Volume: {formatLargeNumber(pair.volume)}</div>}
                  {pair.price && <div>Price: {formatCurrency(pair.price)}</div>}
                  {pair.change && (
                    <div className={pair.change > 0 ? 'text-emerald-300' : 'text-red-300'}>
                      Change: {pair.change > 0 ? '+' : ''}{pair.change}%
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

