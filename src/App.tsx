import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  BarChart3, 
  Newspaper, 
  Activity, 
  Settings, 
  RefreshCw, 
  Star, 
  AlertCircle,
  Globe,
  Target,
  TrendingUpIcon,
  Coins,
  Building2,
  Server,
  NewspaperIcon
} from 'lucide-react';
import { tradingAPI, CoinGeckoCoin, KrakenMarketData, TrendingItem } from './services/api';
import { useApi } from './hooks/useApi';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { KrakenData } from './components/KrakenData';
import { HighOpenInterestOptions } from './components/HighOpenInterestOptions';
import { SystemMonitor } from './components/SystemMonitor';

// News data interfaces
interface AlpacaNewsItem {
  author: string;
  content: string;
  created_at: string;
  headline: string;
  id: number;
  images: Array<{
    size: string;
    url: string;
  }>;
  source: string;
  summary: string;
  symbols: string[];
  updated_at: string;
  url: string;
}

interface AlpacaNewsResponse {
  alpaca: {
    news: AlpacaNewsItem[];
  };
}

interface NewsItem {
  title: string;
  summary: string;
  source: string;
  timestamp: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
  url?: string;
  author?: string;
}

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // API hooks for different data sources
  const marketOverview = useApi(() => tradingAPI.getMarketOverview());
  
  // Use Kraken data instead of CoinGecko where possible
  const topGainers = useApi(() => tradingAPI.getKrakenTopGainers(10));
  const topLosers = useApi(() => tradingAPI.getKrakenTopLosers(10));
  const topCryptocurrencies = useApi(() => tradingAPI.getKrakenTopCryptocurrencies(20));
  const trendingCrypto = useApi(() => tradingAPI.getKrakenTrendingCrypto(10));
  
  // Fallback to CoinGecko for features not available in Kraken
  const coinGeckoTrendingCrypto = useApi(() => tradingAPI.getTrendingCrypto());
  
  const news = useApi(() => tradingAPI.getNews());
  const trendingStocks = useApi(() => tradingAPI.getTrendingStocks(10));
  const redditStocks = useApi(() => tradingAPI.getRedditStocks(10));
  const marketContext = useApi(() => tradingAPI.getMarketContext());
  const trendingOptions = useApi(() => tradingAPI.getTrendingOptions({ limit: 10 }));
  const optionsRecommendations = useApi(() => tradingAPI.getOptionsRecommendations({ limit: 10 }));
  const finvizRecommendations = useApi(() => tradingAPI.getFinvizRecommendations({ limit: 10 }));
  const crypto = useApi(() => tradingAPI.getCrypto(10));
  const forex = useApi(() => tradingAPI.getForex(10));
  const futures = useApi(() => tradingAPI.getFuture(10));
  const groups = useApi(() => tradingAPI.getGroup(10));
  const insider = useApi(() => tradingAPI.getInsider(10));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatLargeNumber = (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    return formatCurrency(value);
  };

  const handleRefresh = () => {
    setLastUpdated(new Date());
    // Trigger refetch for all data
    marketOverview.refetch();
    topGainers.refetch();
    topLosers.refetch();
    trendingCrypto.refetch();
    topCryptocurrencies.refetch();
    coinGeckoTrendingCrypto.refetch();
    news.refetch();
    trendingStocks.refetch();
    redditStocks.refetch();
    marketContext.refetch();
    trendingOptions.refetch();
    optionsRecommendations.refetch();
    finvizRecommendations.refetch();
    crypto.refetch();
    forex.refetch();
    futures.refetch();
    groups.refetch();
    insider.refetch();
  };

  const MarketOverviewCard = () => (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="text-blue-400" />
          Market Overview
        </h2>
        <button 
          onClick={handleRefresh}
          className={`p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors ${marketOverview.loading ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="w-4 h-4 text-slate-300" />
        </button>
      </div>
      
      {marketOverview.loading && <LoadingSpinner className="py-8" />}
      {marketOverview.error && (
        <ErrorMessage message={marketOverview.error} onRetry={marketOverview.refetch} />
      )}
      {marketOverview.data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">Total Market Cap</div>
            <div className="text-2xl font-bold text-white">
              {formatLargeNumber(marketOverview.data.total_market_cap)}
            </div>
          </div>
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">24h Volume</div>
            <div className="text-2xl font-bold text-white">
              {formatLargeNumber(marketOverview.data.total_volume)}
            </div>
          </div>
          <div className="bg-slate-900 rounded-lg p-4">
            <div className="text-slate-400 text-sm mb-1">BTC Dominance</div>
            <div className="text-2xl font-bold text-white">
              {marketOverview.data.bitcoin_dominance.toFixed(1)}%
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const CryptoTable = ({ 
    title, 
    data, 
    loading, 
    error, 
    onRetry, 
    icon,  
  }: { 
    title: string; 
    data: (CoinGeckoCoin | KrakenMarketData)[] | null; 
    loading: boolean; 
    error: string | null; 
    onRetry: () => void; 
    icon: React.ReactNode; 
    trend: 'up' | 'down' 
  }) => (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-2 mb-6">
        {icon}
        <h3 className="text-xl font-bold text-white">{title}</h3>
      </div>
      
      {loading && <LoadingSpinner className="py-8" />}
      {error && <ErrorMessage message={error} onRetry={onRetry} />}
      {data && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left text-slate-400 pb-3 font-medium">Rank</th>
                <th className="text-left text-slate-400 pb-3 font-medium">Asset</th>
                <th className="text-right text-slate-400 pb-3 font-medium">Price</th>
                <th className="text-right text-slate-400 pb-3 font-medium">24h Change</th>
                <th className="text-right text-slate-400 pb-3 font-medium">Market Cap</th>
                <th className="text-right text-slate-400 pb-3 font-medium">Volume</th>
              </tr>
            </thead>
            <tbody>
              {data.map((crypto, index) => {
                // Handle both Kraken and CoinGecko data
                const isKrakenData = 'pair' in crypto;
                const symbol = isKrakenData ? crypto.pair : crypto.symbol;
                const name = isKrakenData ? crypto.name || crypto.pair : crypto.name;
                const price = isKrakenData ? crypto.price : crypto.current_price;
                const changePercent = isKrakenData ? crypto.change_pct_24h : crypto.price_change_percentage_24h;
                const volume = isKrakenData ? crypto.volume : crypto.total_volume;
                const marketCap = isKrakenData ? undefined : crypto.market_cap;
                const rank = isKrakenData ? index + 1 : crypto.market_cap_rank || index + 1;
                
                return (
                  <tr key={isKrakenData ? crypto.pair : crypto.id} className="border-b border-slate-800 hover:bg-slate-750 transition-colors">
                    <td className="py-3 text-slate-300">#{rank}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-slate-300">{symbol.toUpperCase()}</span>
                        </div>
                        <div>
                          <div className="text-white font-medium">{name}</div>
                          <div className="text-slate-400 text-sm">{symbol.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-right text-white font-medium">
                      {price ? formatCurrency(price) : 'N/A'}
                    </td>
                    <td className="py-3 text-right">
                      {changePercent !== undefined ? (
                        <span className={`px-2 py-1 rounded text-sm font-medium ${
                          changePercent > 0 
                            ? 'bg-emerald-900 text-emerald-300' 
                            : 'bg-red-900 text-red-300'
                        }`}>
                          {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="py-3 text-right text-slate-300">
                      {marketCap ? formatLargeNumber(marketCap) : 'N/A'}
                    </td>
                    <td className="py-3 text-right text-slate-300">
                      {volume ? formatLargeNumber(volume) : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const NewsSection = () => (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-2 mb-6">
        <NewspaperIcon className="text-green-400" />
        <h3 className="text-xl font-bold text-white">Market News</h3>
      </div>
      
      {news.loading && <LoadingSpinner className="py-8" />}
      {news.error && <ErrorMessage message={news.error} onRetry={news.refetch} />}
      {news.data && (
        <div className="space-y-4">
          {/* Handle both direct array and nested alpaca.news structure */}
          {(Array.isArray(news.data) ? news.data : (news.data as AlpacaNewsResponse)?.alpaca?.news || []).slice(0, 5).map((item: AlpacaNewsItem | NewsItem, index: number) => {
            // Transform the API response to match expected NewsItem structure
            const newsItem = {
              title: 'headline' in item ? item.headline : item.title,
              summary: item.summary || ('content' in item ? item.content : 'No summary available'),
              source: item.source || 'Unknown source',
              timestamp: 'created_at' in item ? item.created_at : item.timestamp,
              sentiment: 'sentiment' in item ? item.sentiment : 'neutral',
              url: 'url' in item ? item.url : '#',
              author: 'author' in item ? item.author : 'Unknown author'
            };
            
            return (
              <div key={'id' in item ? item.id : index} className="bg-slate-900 rounded-lg p-4 hover:bg-slate-750 transition-colors cursor-pointer">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-white font-medium flex-1 pr-2">{newsItem.title}</h4>
                  {newsItem.sentiment && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      newsItem.sentiment === 'positive' ? 'bg-emerald-900 text-emerald-300' :
                      newsItem.sentiment === 'negative' ? 'bg-red-900 text-red-300' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      {newsItem.sentiment}
                    </span>
                  )}
                </div>
                <p className="text-slate-400 text-sm mb-2">{newsItem.summary}</p>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{newsItem.source}</span>
                  <span>{new Date(newsItem.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const TrendingSection = () => (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUpIcon className="text-purple-400" />
        <h3 className="text-xl font-bold text-white">Trending Assets</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Trending Crypto</h4>
          {trendingCrypto.loading && <LoadingSpinner size="sm" />}
          {trendingCrypto.error && <ErrorMessage message={trendingCrypto.error} onRetry={trendingCrypto.refetch} />}
          {trendingCrypto.data && Array.isArray(trendingCrypto.data) && (
            <div className="grid grid-cols-1 gap-2">
              {trendingCrypto.data.slice(0, 5).map((item: KrakenMarketData | TrendingItem, index) => {
                const isKrakenData = 'pair' in item;
                const name = isKrakenData ? item.name || item.pair : item.name;
                const symbol = isKrakenData ? item.pair : (item.symbol || 'N/A');
                const score = isKrakenData ? item.volume : item.score;
                const rank = isKrakenData ? index + 1 : item.market_cap_rank;
                const uniqueKey = isKrakenData ? item.pair : (item.id || `trending-${index}`);
                
                return (
                  <div key={uniqueKey} className="flex items-center justify-between bg-slate-900 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm">#{index + 1}</span>
                      <span className="text-white font-medium">{name}</span>
                      <span className="text-slate-400 text-sm">({symbol.toUpperCase()})</span>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-300 text-sm">
                        {isKrakenData ? `Volume: ${formatLargeNumber(score)}` : `Score: ${score}`}
                      </div>
                      <div className="text-slate-400 text-xs">Rank: #{rank}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {trendingCrypto.data && !Array.isArray(trendingCrypto.data) && (
            <div className="text-slate-400 text-sm">No trending crypto data available</div>
          )}
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Trending Stocks</h4>
          {trendingStocks?.loading && <LoadingSpinner size="sm" />}
          {trendingStocks?.error && <ErrorMessage message={trendingStocks.error} onRetry={trendingStocks.refetch} />}
          {trendingStocks?.data && Array.isArray(trendingStocks.data) && (
            <div className="grid grid-cols-1 gap-2">
              {trendingStocks.data.slice(0, 5).map((item, index) => {
                // Handle both object format and string format
                const isString = typeof item === 'string';
                const symbol = isString ? item : (item.symbol || item.ticker || 'N/A');
                const price = isString ? null : item.price;
                const uniqueKey = isString ? `stock-${index}` : (item.symbol || item.ticker || `stock-${index}`);
                
                return (
                  <div key={uniqueKey} className="flex items-center justify-between bg-slate-900 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm">#{index + 1}</span>
                      <span className="text-white font-medium">{symbol}</span>
                    </div>
                    <div className="text-slate-300 text-sm">
                      {price ? formatCurrency(price) : 'N/A'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {trendingStocks?.data && !Array.isArray(trendingStocks.data) && (
            <div className="text-slate-400 text-sm">No trending stocks data available</div>
          )}
        </div>
      </div>
    </div>
  );

  const OptionsAnalysisSection = () => (
    <div className="space-y-6">
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Activity className="text-blue-400" />
          Options Analysis Dashboard
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Trending Options</h3>
            {trendingOptions.loading && <LoadingSpinner />}
            {trendingOptions.error && <ErrorMessage message={trendingOptions.error} onRetry={trendingOptions.refetch} />}
            {trendingOptions.data && (
              <div className="bg-slate-900 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-slate-400 text-sm">Total Analyzed</div>
                    <div className="text-xl font-bold text-white">{trendingOptions.data.summary.total_analyzed}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">With Options</div>
                    <div className="text-xl font-bold text-white">{trendingOptions.data.summary.total_with_options}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-slate-400 text-sm">Top Underlying Tickers</div>
                    <div className="text-white">{trendingOptions.data.summary.top_underlying_tickers.join(', ')}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-sm">Top Undervalued Tickers</div>
                    <div className="text-white">{trendingOptions.data.summary.top_undervalued_tickers.join(', ')}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Options Recommendations</h3>
            {optionsRecommendations.loading && <LoadingSpinner />}
            {optionsRecommendations.error && <ErrorMessage message={optionsRecommendations.error} onRetry={optionsRecommendations.refetch} />}
            {optionsRecommendations.data && Array.isArray(optionsRecommendations.data) && (
              <div className="bg-slate-900 rounded-lg p-4">
                <div className="text-slate-300">
                  Found {optionsRecommendations.data.length} recommendations
                </div>
                {optionsRecommendations.data.slice(0, 3).map((rec, index) => (
                  <div key={index} className="mt-3 p-3 bg-slate-800 rounded border-l-4 border-blue-500">
                    <div className="text-white font-medium">{rec.symbol || rec.ticker || `Recommendation ${index + 1}`}</div>
                    <div className="text-slate-400 text-sm mt-1">
                      {rec.description || 'Options recommendation available'}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {optionsRecommendations.data && !Array.isArray(optionsRecommendations.data) && (
              <div className="text-slate-400 text-sm">No options recommendations data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Target className="text-emerald-400" />
          Finviz Recommendations
        </h3>
        {finvizRecommendations.loading && <LoadingSpinner />}
        {finvizRecommendations.error && <ErrorMessage message={finvizRecommendations.error} onRetry={finvizRecommendations.refetch} />}
        {finvizRecommendations.data && Array.isArray(finvizRecommendations.data) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {finvizRecommendations.data.slice(0, 9).map((rec, index) => (
              <div key={index} className="bg-slate-900 rounded-lg p-4">
                <div className="text-white font-medium mb-2">{rec.ticker}</div>
                <div className="text-slate-400 text-sm space-y-1">
                  <div>Recommendation: <span className="text-blue-300">{rec.recommendation}</span></div>
                  <div>Price Target: {formatCurrency(rec.price_target)}</div>
                  <div className="text-emerald-300">
                    Upside: +{rec.upside.toFixed(2)}%
                  </div>
                  <div>Analysts: {rec.analysts}</div>
                  <div>Rating: {rec.rating}/5</div>
                </div>
              </div>
            ))}
          </div>
        )}
        {finvizRecommendations.data && !Array.isArray(finvizRecommendations.data) && (
          <div className="text-slate-400 text-sm">No finviz recommendations data available</div>
        )}
      </div>
    </div>
  );

  const MarketContextSection = () => (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Globe className="text-blue-400" />
        Market Context
      </h3>
      {marketContext.loading && <LoadingSpinner />}
      {marketContext.error && <ErrorMessage message={marketContext.error} onRetry={marketContext.refetch} />}
      {marketContext.data && (
        <div className="bg-slate-900 rounded-lg p-4">
          <p className="text-slate-300 leading-relaxed">{marketContext.data}</p>
        </div>
      )}
    </div>
  );

  const QuickActions = () => (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
      <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={() => setActiveTab('options')}
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Activity className="w-4 h-4" />
          Options Analysis
        </button>
        <button 
          onClick={() => setActiveTab('crypto')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Star className="w-4 h-4" />
          Trending Crypto
        </button>
        <button 
          onClick={() => setActiveTab('stocks')}
          className="bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <DollarSign className="w-4 h-4" />
          Stock Analysis
        </button>
        <button 
          onClick={() => setActiveTab('kraken')}
          className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Coins className="w-4 h-4" />
          Kraken Data
        </button>
        <button 
          onClick={() => setActiveTab('high-oi')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Target className="w-4 h-4" />
          High OI Options
        </button>
        <button 
          onClick={() => setActiveTab('news')}
          className="bg-pink-600 hover:bg-pink-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
        >
          <AlertCircle className="w-4 h-4" />
          Market News
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">TradingHub Pro</h1>
                <p className="text-slate-400 text-sm">Professional Market Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-slate-400 text-sm">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <button className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">
                <Settings className="w-5 h-5 text-slate-300" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-800 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'crypto', label: 'Cryptocurrency', icon: DollarSign },
              { id: 'options', label: 'Options', icon: Activity },
              { id: 'stocks', label: 'Stocks & Analysis', icon: TrendingUp },
              { id: 'kraken', label: 'Kraken Data', icon: Coins },
              { id: 'high-oi', label: 'High OI Options', icon: Target },
              { id: 'system', label: 'System Monitor', icon: Server },
              { id: 'news', label: 'News & Context', icon: Newspaper },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-slate-400 hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <MarketOverviewCard />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <CryptoTable 
                  title="Top Gainers (24h)" 
                  data={topGainers.data} 
                  loading={topGainers.loading}
                  error={topGainers.error}
                  onRetry={topGainers.refetch}
                  icon={<TrendingUp className="text-emerald-400" />}
                  trend="up"
                />
                <CryptoTable 
                  title="Top Losers (24h)" 
                  data={topLosers.data} 
                  loading={topLosers.loading}
                  error={topLosers.error}
                  onRetry={topLosers.refetch}
                  icon={<TrendingDown className="text-red-400" />}
                  trend="down"
                />
              </div>
              <div className="space-y-8">
                <QuickActions />
                <TrendingSection />
                <NewsSection />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'crypto' && (
          <div className="space-y-8">
            <MarketOverviewCard />
            <CryptoTable 
              title="All Cryptocurrencies" 
              data={topCryptocurrencies.data} 
              loading={topCryptocurrencies.loading}
              error={topCryptocurrencies.error}
              onRetry={topCryptocurrencies.refetch}
              icon={<DollarSign className="text-blue-400" />}
              trend="up"
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <TrendingSection />
              <MarketContextSection />
            </div>
          </div>
        )}

        {activeTab === 'options' && (
          <div className="space-y-8">
            <OptionsAnalysisSection />
          </div>
        )}

        {activeTab === 'stocks' && (
          <div className="space-y-8">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="text-emerald-400" />
                Stock Analysis Dashboard
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Trending Stocks</h3>
                  {trendingStocks.loading && <LoadingSpinner />}
                  {trendingStocks.error && <ErrorMessage message={trendingStocks.error} onRetry={trendingStocks.refetch} />}
                  {trendingStocks.data && Array.isArray(trendingStocks.data) && (
                    <div className="space-y-2">
                      {trendingStocks.data.slice(0, 10).map((stock, index) => (
                        <div key={index} className="bg-slate-900 rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">{stock.symbol || stock.ticker || `Stock ${index + 1}`}</div>
                            <div className="text-slate-400 text-sm">{stock.name || 'N/A'}</div>
                          </div>
                          <div className="text-right">
                            {stock.price && <div className="text-white">{formatCurrency(stock.price)}</div>}
                            {stock.change && (
                              <div className={`text-sm ${stock.change > 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                                {stock.change > 0 ? '+' : ''}{stock.change}%
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {trendingStocks.data && !Array.isArray(trendingStocks.data) && (
                    <div className="text-slate-400 text-sm">No trending stocks data available</div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Reddit Trending</h3>
                  {redditStocks.loading && <LoadingSpinner />}
                  {redditStocks.error && <ErrorMessage message={redditStocks.error} onRetry={redditStocks.refetch} />}
                  {redditStocks.data && Array.isArray(redditStocks.data) && (
                    <div className="space-y-2">
                      {redditStocks.data.slice(0, 10).map((stock, index) => (
                        <div key={index} className="bg-slate-900 rounded-lg p-3 flex items-center justify-between">
                          <div>
                            <div className="text-white font-medium">{stock.symbol || stock.ticker || `Stock ${index + 1}`}</div>
                            <div className="text-slate-400 text-sm">Reddit mentions: {stock.mentions || 'N/A'}</div>
                          </div>
                          <div className="text-right">
                            {stock.sentiment && (
                              <div className={`text-sm px-2 py-1 rounded ${
                                stock.sentiment === 'positive' ? 'bg-emerald-900 text-emerald-300' :
                                stock.sentiment === 'negative' ? 'bg-red-900 text-red-300' :
                                'bg-slate-700 text-slate-300'
                              }`}>
                                {stock.sentiment}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {redditStocks.data && !Array.isArray(redditStocks.data) && (
                    <div className="text-slate-400 text-sm">No Reddit trending data available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Market Data Overview */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Building2 className="text-blue-400" />
                Market Data Overview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Crypto Performance */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Crypto Performance</h4>
                  {crypto.loading && <LoadingSpinner size="sm" />}
                  {crypto.error && <ErrorMessage message={crypto.error} onRetry={crypto.refetch} />}
                  {crypto.data && Array.isArray(crypto.data) && (
                    <div className="space-y-2">
                      {crypto.data.slice(0, 5).map((item, index) => (
                        <div key={index} className="bg-slate-900 rounded-lg p-3">
                          <div className="text-white font-medium">{item.symbol || item.ticker || `Crypto ${index + 1}`}</div>
                          <div className="text-slate-400 text-sm">
                            {item.price && <div>Price: {formatCurrency(item.price)}</div>}
                            {item.change && (
                              <div className={item.change > 0 ? 'text-emerald-300' : 'text-red-300'}>
                                Change: {item.change > 0 ? '+' : ''}{item.change}%
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {crypto.data && !Array.isArray(crypto.data) && (
                    <div className="text-slate-400 text-sm">No crypto data available</div>
                  )}
                </div>

                {/* Forex Performance */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Forex Performance</h4>
                  {forex.loading && <LoadingSpinner size="sm" />}
                  {forex.error && <ErrorMessage message={forex.error} onRetry={forex.refetch} />}
                  {forex.data && Array.isArray(forex.data) && (
                    <div className="space-y-2">
                      {forex.data.slice(0, 5).map((item, index) => (
                        <div key={index} className="bg-slate-900 rounded-lg p-3">
                          <div className="text-white font-medium">{item.symbol}</div>
                          <div className="text-slate-400 text-sm">
                            <div>Price: {formatCurrency(item.price)}</div>
                            <div className={item.change_percent > 0 ? 'text-emerald-300' : 'text-red-300'}>
                              Change: {item.change_percent > 0 ? '+' : ''}{item.change_percent.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {forex.data && !Array.isArray(forex.data) && (
                    <div className="text-slate-400 text-sm">No forex data available</div>
                  )}
                </div>

                {/* Futures Performance */}
                <div>
                  <h4 className="text-lg font-semibold text-white mb-3">Futures Performance</h4>
                  {futures.loading && <LoadingSpinner size="sm" />}
                  {futures.error && <ErrorMessage message={futures.error} onRetry={futures.refetch} />}
                  {futures.data && Array.isArray(futures.data) && (
                    <div className="space-y-2">
                      {futures.data.slice(0, 5).map((item, index) => (
                        <div key={index} className="bg-slate-900 rounded-lg p-3">
                          <div className="text-white font-medium">{item.symbol}</div>
                          <div className="text-slate-400 text-sm">
                            <div>Price: {formatCurrency(item.price)}</div>
                            <div className={item.change_percent > 0 ? 'text-emerald-300' : 'text-red-300'}>
                              Change: {item.change_percent > 0 ? '+' : ''}{item.change_percent.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {futures.data && !Array.isArray(futures.data) && (
                    <div className="text-slate-400 text-sm">No futures data available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Market Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Market Groups */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h4 className="text-lg font-semibold text-white mb-3">Market Groups</h4>
                {groups.loading && <LoadingSpinner size="sm" />}
                {groups.error && <ErrorMessage message={groups.error} onRetry={groups.refetch} />}
                {groups.data && Array.isArray(groups.data) && (
                  <div className="space-y-2">
                    {groups.data.slice(0, 8).map((item, index) => (
                      <div key={index} className="bg-slate-900 rounded-lg p-3">
                        <div className="text-white font-medium">{item.name}</div>
                        <div className="text-slate-400 text-sm">
                          <div>Performance: {item.performance.toFixed(2)}%</div>
                          <div>Volume: {formatLargeNumber(item.volume)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {groups.data && !Array.isArray(groups.data) && (
                  <div className="text-slate-400 text-sm">No market groups data available</div>
                )}
              </div>

              {/* Insider Transactions */}
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <h4 className="text-lg font-semibold text-white mb-3">Insider Transactions</h4>
                {insider.loading && <LoadingSpinner size="sm" />}
                {insider.error && <ErrorMessage message={insider.error} onRetry={insider.refetch} />}
                {insider.data && Array.isArray(insider.data) && (
                  <div className="space-y-2">
                    {insider.data.slice(0, 8).map((item, index) => (
                      <div key={index} className="bg-slate-900 rounded-lg p-3">
                        <div className="text-white font-medium">{item.ticker}</div>
                        <div className="text-slate-400 text-sm">
                          <div>Owner: {item.owner}</div>
                          <div>Transaction: {item.transaction}</div>
                          <div>Shares: {item.shares.toLocaleString()}</div>
                          <div>Value: {formatCurrency(item.value)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {insider.data && !Array.isArray(insider.data) && (
                  <div className="text-slate-400 text-sm">No insider transactions data available</div>
                )}
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Target className="text-emerald-400" />
                Finviz Recommendations
              </h3>
              {finvizRecommendations.loading && <LoadingSpinner />}
              {finvizRecommendations.error && <ErrorMessage message={finvizRecommendations.error} onRetry={finvizRecommendations.refetch} />}
              {finvizRecommendations.data && Array.isArray(finvizRecommendations.data) && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {finvizRecommendations.data.slice(0, 9).map((rec, index) => (
                    <div key={index} className="bg-slate-900 rounded-lg p-4">
                      <div className="text-white font-medium mb-2">{rec.ticker}</div>
                      <div className="text-slate-400 text-sm space-y-1">
                        <div>Recommendation: <span className="text-blue-300">{rec.recommendation}</span></div>
                        <div>Price Target: {formatCurrency(rec.price_target)}</div>
                        <div className="text-emerald-300">
                          Upside: +{rec.upside.toFixed(2)}%
                        </div>
                        <div>Analysts: {rec.analysts}</div>
                        <div>Rating: {rec.rating}/5</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {finvizRecommendations.data && !Array.isArray(finvizRecommendations.data) && (
                <div className="text-slate-400 text-sm">No finviz recommendations data available</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'kraken' && (
          <div className="space-y-8">
            <KrakenData />
          </div>
        )}

        {activeTab === 'high-oi' && (
          <div className="space-y-8">
            <HighOpenInterestOptions />
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-8">
            <SystemMonitor />
          </div>
        )}

        {activeTab === 'news' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <NewsSection />
              <MarketContextSection />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;