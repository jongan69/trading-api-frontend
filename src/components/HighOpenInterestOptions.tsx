import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  RefreshCw,
  Search,
  Target,
  BarChart3
} from 'lucide-react';
import { tradingAPI, HighOpenInterestResponse, OptionContract } from '../services/api';
import { useApi } from '../hooks/useApi';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

interface HighOpenInterestOptionsProps {
  className?: string;
}

export const HighOpenInterestOptions: React.FC<HighOpenInterestOptionsProps> = ({ className = '' }) => {
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const [optionType, setOptionType] = useState<'call' | 'put'>('call');
  const [batchTickers, setBatchTickers] = useState('AAPL,TSLA,NVDA,AMD,SPY');
  const [searchTicker, setSearchTicker] = useState('');

  // API hooks
  const singleTickerData = useApi(() => tradingAPI.getHighOpenInterest(selectedTicker, optionType));
  const batchData = useApi(() => tradingAPI.getHighOpenInterestBatch(batchTickers.split(',').map(t => t.trim()), optionType));

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
    return value.toFixed(0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const popularTickers = ['AAPL', 'TSLA', 'NVDA', 'AMD', 'SPY', 'QQQ', 'IWM', 'MSFT', 'GOOGL', 'META'];

  const OptionContractCard = ({ contract, title }: { contract: OptionContract; title: string }) => (
    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
      <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
        <Target className="text-blue-400" />
        {title}
      </h4>
      
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-slate-400 text-sm mb-1">Symbol</div>
            <div className="text-white font-medium">{contract.symbol}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm mb-1">Strike Price</div>
            <div className="text-white font-medium">{formatCurrency(contract.strike_price)}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-slate-400 text-sm mb-1">Expiration</div>
            <div className="text-white font-medium">{formatDate(contract.expiration_date)}</div>
          </div>
          <div>
            <div className="text-slate-400 text-sm mb-1">Type</div>
            <div className={`font-medium px-2 py-1 rounded text-sm ${
              contract.type === 'call' ? 'bg-emerald-900 text-emerald-300' : 'bg-red-900 text-red-300'
            }`}>
              {contract.type.toUpperCase()}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-slate-400 text-sm mb-1">Bid</div>
            <div className="text-white font-medium">
              {contract.bid_price ? formatCurrency(contract.bid_price) : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-sm mb-1">Ask</div>
            <div className="text-white font-medium">
              {contract.ask_price ? formatCurrency(contract.ask_price) : 'N/A'}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-slate-400 text-sm mb-1">Last Price</div>
            <div className="text-white font-medium">
              {contract.last_price ? formatCurrency(contract.last_price) : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-sm mb-1">Open Interest</div>
            <div className="text-white font-medium">
              {contract.open_interest ? formatLargeNumber(contract.open_interest) : 'N/A'}
            </div>
          </div>
        </div>
        
        {contract.implied_volatility && (
          <div>
            <div className="text-slate-400 text-sm mb-1">Implied Volatility</div>
            <div className="text-white font-medium">{(contract.implied_volatility * 100).toFixed(2)}%</div>
          </div>
        )}
        
        {contract.close_price && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-slate-400 text-sm mb-1">Close Price</div>
              <div className="text-white font-medium">{formatCurrency(contract.close_price)}</div>
            </div>
            <div>
              <div className="text-slate-400 text-sm mb-1">Close Date</div>
              <div className="text-white font-medium">
                {contract.close_price_date ? formatDate(contract.close_price_date) : 'N/A'}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-purple-400" />
            High Open Interest Options Analysis
          </h2>
          <button 
            onClick={() => {
              singleTickerData.refetch();
              batchData.refetch();
            }}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Single Ticker Analysis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Single Ticker Analysis</h3>
            
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Enter ticker symbol..."
                    value={searchTicker}
                    onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && searchTicker) {
                        setSelectedTicker(searchTicker);
                        setSearchTicker('');
                      }
                    }}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <select
                value={optionType}
                onChange={(e) => setOptionType(e.target.value as 'call' | 'put')}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="call">Calls</option>
                <option value="put">Puts</option>
              </select>
            </div>

            {/* Popular Tickers */}
            <div>
              <div className="text-slate-400 text-sm mb-2">Popular Tickers:</div>
              <div className="flex flex-wrap gap-2">
                {popularTickers.map((ticker) => (
                  <button
                    key={ticker}
                    onClick={() => setSelectedTicker(ticker)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                      selectedTicker === ticker
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                  >
                    {ticker}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Batch Analysis */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Batch Analysis</h3>
            
            <div>
              <label className="block text-slate-400 text-sm mb-2">
                Ticker Symbols (comma-separated)
              </label>
              <input
                type="text"
                value={batchTickers}
                onChange={(e) => setBatchTickers(e.target.value)}
                placeholder="AAPL,TSLA,NVDA,AMD,SPY"
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-4">
              <select
                value={optionType}
                onChange={(e) => setOptionType(e.target.value as 'call' | 'put')}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white"
              >
                <option value="call">Calls</option>
                <option value="put">Puts</option>
              </select>
              
              <button
                onClick={() => batchData.refetch()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Analyze Batch
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Single Ticker Results */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Target className="text-emerald-400" />
          {selectedTicker} High Open Interest {optionType.toUpperCase()}s
        </h3>
        
        {singleTickerData.loading && <LoadingSpinner />}
        {singleTickerData.error && <ErrorMessage message={singleTickerData.error} onRetry={singleTickerData.refetch} />}
        {singleTickerData.data && (
          <div>
            {singleTickerData.data.result.error ? (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <div className="text-red-300 font-medium">Error</div>
                <div className="text-red-400 text-sm">{singleTickerData.data.result.error}</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {singleTickerData.data.result.short_term && (
                  <OptionContractCard 
                    contract={singleTickerData.data.result.short_term} 
                    title="Short Term Options" 
                  />
                )}
                {singleTickerData.data.result.leap && (
                  <OptionContractCard 
                    contract={singleTickerData.data.result.leap} 
                    title="LEAP Options" 
                  />
                )}
                {!singleTickerData.data.result.short_term && !singleTickerData.data.result.leap && (
                  <div className="col-span-2 text-center py-8">
                    <div className="text-slate-400">No high open interest options found for {selectedTicker}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Batch Results */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="text-orange-400" />
          Batch Analysis Results
        </h3>
        
        {batchData.loading && <LoadingSpinner />}
        {batchData.error && <ErrorMessage message={batchData.error} onRetry={batchData.refetch} />}
        {batchData.data && (
          <div className="space-y-6">
            {batchData.data.map((item, index) => (
              <div key={index} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <DollarSign className="text-blue-400" />
                  {item.ticker}
                </h4>
                
                {item.result.error ? (
                  <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
                    <div className="text-red-300 text-sm">{item.result.error}</div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {item.result.short_term && (
                      <div className="bg-slate-800 rounded-lg p-3">
                        <div className="text-slate-400 text-sm mb-2">Short Term</div>
                        <div className="text-white font-medium">{item.result.short_term.symbol}</div>
                        <div className="text-slate-300 text-sm">
                          Strike: {formatCurrency(item.result.short_term.strike_price)} | 
                          OI: {item.result.short_term.open_interest ? formatLargeNumber(item.result.short_term.open_interest) : 'N/A'}
                        </div>
                      </div>
                    )}
                    {item.result.leap && (
                      <div className="bg-slate-800 rounded-lg p-3">
                        <div className="text-slate-400 text-sm mb-2">LEAP</div>
                        <div className="text-white font-medium">{item.result.leap.symbol}</div>
                        <div className="text-slate-300 text-sm">
                          Strike: {formatCurrency(item.result.leap.strike_price)} | 
                          OI: {item.result.leap.open_interest ? formatLargeNumber(item.result.leap.open_interest) : 'N/A'}
                        </div>
                      </div>
                    )}
                    {!item.result.short_term && !item.result.leap && (
                      <div className="col-span-2 text-center py-4">
                        <div className="text-slate-400 text-sm">No high open interest options found</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

