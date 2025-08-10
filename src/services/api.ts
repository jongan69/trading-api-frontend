const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'https://trading-api-wcv5.onrender.com');

// Types based on the OpenAPI schema
export interface CoinGeckoCoin {
  id: string;
  symbol: string;
  name: string;
  current_price?: number;
  price_change_percentage_24h?: number;
  market_cap?: number;
  market_cap_rank?: number;
  total_volume?: number;
  high_24h?: number;
  low_24h?: number;
  ath?: number;
  atl?: number;
  circulating_supply?: number;
  max_supply?: number;
  total_supply?: number;
  last_updated?: string;
  price_change_24h?: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
  market_cap_change_24h?: number;
  market_cap_change_percentage_24h?: number;
  sparkline_in_7d?: {
    price: number[];
  };
}

// Kraken-based market data (replacing CoinGecko)
export interface KrakenMarketData {
  pair: string;
  price: number;
  volume: number;
  high_24h: number;
  low_24h: number;
  change_24h: number;
  change_pct_24h: number;
  name?: string;
  symbol?: string;
}

export interface MarketOverview {
  total_market_cap: number;
  total_volume: number;
  bitcoin_dominance: number;
  market_cap_percentage: Record<string, number>;
  volume_percentage: Record<string, number>;
}

export interface TrendingItem {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
}

export interface OptionContract {
  symbol: string;
  underlying_symbol: string;
  strike_price: number;
  expiration_date: string;
  type: string;
  ask_price?: number;
  bid_price?: number;
  last_price?: number;
  open_interest?: number;
  implied_volatility?: number;
  close_price?: number;
  close_price_date?: string;
  open_interest_date?: string;
}

export interface HighOpenInterestResult {
  short_term?: OptionContract;
  leap?: OptionContract;
  error?: string;
}

export interface HighOpenInterestResponse {
  ticker: string;
  result: HighOpenInterestResult;
}

export interface TrendingOptionsResult {
  symbol?: string;
  ticker?: string;
  underlying_score?: number;
  undervalued_score?: number;
  description?: string;
}

export interface TrendingOptionsResponse {
  results: TrendingOptionsResult[];
  summary: {
    total_analyzed: number;
    total_with_options: number;
    average_underlying_score: number;
    average_undervalued_score: number;
    top_underlying_tickers: string[];
    top_undervalued_tickers: string[];
  };
}

export interface NewsItem {
  title: string;
  summary: string;
  source: string;
  timestamp: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface HealthResponse {
  status: string;
}

export interface SystemStatus {
  status: string;
  timestamp: number;
  uptime: number;
  version: string;
  environment: string;
  services: {
    alpaca?: {
      status: string;
      last_check: number;
      error_count: number;
      response_time_ms: number;
    };
    yahoo_finance?: {
      status: string;
      last_check: number;
      error_count: number;
      response_time_ms: number;
    };
    reddit?: {
      status: string;
      last_check: number;
      error_count: number;
      response_time_ms: number;
    };
  };
}

export interface SystemMetrics {
  total_requests: number;
  error_rate: number;
  average_response_time: number;
  active_connections: number;
  memory_usage: {
    used_mb: number;
    total_mb: number;
    percentage: number;
  };
}

// Kraken types
export interface KrakenAsset {
  name: string;
  altname: string;
  aclass: string;
  decimals: number;
  display_decimals: number;
}

export interface KrakenAssetPair {
  name: string;
  altname: string;
  aclass_base: string;
  base: string;
  aclass_quote: string;
  quote: string;
  pair_decimals: number;
  lot_decimals: number;
  lot_multiplier: number;
  ordermin?: string;
  wsname?: string;
}

export interface KrakenTicker {
  pair: string;
  price: number;
  volume: number;
  high_24h: number;
  low_24h: number;
  change_24h: number;
  change_pct_24h: number;
}

export interface KrakenOrderBook {
  pair: string;
  bids: [number, number][];
  asks: [number, number][];
  timestamp: number;
}

// Market data types
export interface MarketDataItem {
  symbol?: string;
  ticker?: string;
  name?: string;
  price?: number;
  change?: number;
  volume?: number;
  market_cap?: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
  mentions?: number;
  signal?: string;
  description?: string;
}

// Yahoo Finance types
export interface YahooMetrics {
  symbol: string;
  metrics: {
    sharpe_ratio: number;
    sortino_ratio: number;
    calmar_ratio: number;
    max_drawdown: number;
    volatility: number;
    annual_return: number;
    composite_score: number;
  };
}

export interface YahooRankResult {
  symbol: string;
  metrics: {
    sharpe_ratio: number;
    sortino_ratio: number;
    calmar_ratio: number;
    max_drawdown: number;
    volatility: number;
    annual_return: number;
    composite_score: number;
  };
}

// Finviz types
export interface FinvizCandidate {
  ticker: string;
  company: string;
  sector: string;
  industry: string;
  country: string;
  market_cap: number;
  pe: number;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
}

export interface FinvizRecommendation {
  ticker: string;
  recommendation: string;
  price_target: number;
  upside: number;
  analysts: number;
  rating: number;
}

// Forex and Futures types
export interface ForexData {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
}

export interface FuturesData {
  symbol: string;
  price: number;
  change: number;
  change_percent: number;
}

export interface InsiderData {
  ticker: string;
  owner: string;
  relationship: string;
  date: string;
  transaction: string;
  shares: number;
  value: number;
}

export interface GroupData {
  name: string;
  performance: number;
  volume: number;
}

class TradingAPI {
  private async fetchApi<T>(endpoint: string): Promise<T> {
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      console.log('Making API request to:', url);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Handle wrapped responses
      if (data.success !== undefined && data.data !== undefined) {
        return data.data;
      }
      
      return data;
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error);
      throw error;
    }
  }

  // System endpoints
  async getHealth(): Promise<HealthResponse> {
    return this.fetchApi<HealthResponse>('/health');
  }

  async getSystemStatus(): Promise<SystemStatus> {
    return this.fetchApi<SystemStatus>('/status');
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    return this.fetchApi<SystemMetrics>('/metrics');
  }

  // Kraken-based market data (replacing CoinGecko)
  async getKrakenTopGainers(limit = 10): Promise<KrakenMarketData[]> {
    const tickers = await this.fetchApi<KrakenTicker[]>('/kraken/ticker');
    return tickers
      .filter(ticker => ticker.change_pct_24h > 0)
      .sort((a, b) => b.change_pct_24h - a.change_pct_24h)
      .slice(0, limit)
      .map(ticker => ({
        ...ticker,
        name: ticker.pair,
        symbol: ticker.pair
      }));
  }

  async getKrakenTopLosers(limit = 10): Promise<KrakenMarketData[]> {
    const tickers = await this.fetchApi<KrakenTicker[]>('/kraken/ticker');
    return tickers
      .filter(ticker => ticker.change_pct_24h < 0)
      .sort((a, b) => a.change_pct_24h - b.change_pct_24h)
      .slice(0, limit)
      .map(ticker => ({
        ...ticker,
        name: ticker.pair,
        symbol: ticker.pair
      }));
  }

  async getKrakenTopCryptocurrencies(limit = 20): Promise<KrakenMarketData[]> {
    const tickers = await this.fetchApi<KrakenTicker[]>('/kraken/ticker');
    return tickers
      .sort((a, b) => b.volume - a.volume) // Sort by volume
      .slice(0, limit)
      .map(ticker => ({
        ...ticker,
        name: ticker.pair,
        symbol: ticker.pair
      }));
  }

  async getKrakenTrendingCrypto(limit = 10): Promise<KrakenMarketData[]> {
    const trending = await this.fetchApi<Record<string, unknown>[]>('/kraken/trending');
    return trending
      .slice(0, limit)
      .map(item => ({
        pair: (item.pair as string) || (item.name as string) || 'Unknown',
        price: (item.price as number) || 0,
        volume: (item.volume as number) || 0,
        high_24h: (item.high_24h as number) || 0,
        low_24h: (item.low_24h as number) || 0,
        change_24h: (item.change_24h as number) || 0,
        change_pct_24h: (item.change_pct_24h as number) || 0,
        name: (item.pair as string) || (item.name as string) || 'Unknown',
        symbol: (item.pair as string) || (item.name as string) || 'Unknown'
      }));
  }

  // Legacy CoinGecko endpoints (keeping for fallback)
  async getTopGainers(limit = 10, vsCurrency = 'usd', order = 'desc', page = 1, sparkline = false, priceChangePercentage = '24h'): Promise<CoinGeckoCoin[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      vs_currency: vsCurrency,
      order,
      page: page.toString(),
      sparkline: sparkline.toString(),
      price_change_percentage: priceChangePercentage
    });
    return this.fetchApi<CoinGeckoCoin[]>(`/coingecko/gainers?${params}`);
  }

  async getTopLosers(limit = 10, vsCurrency = 'usd', order = 'desc', page = 1, sparkline = false, priceChangePercentage = '24h'): Promise<CoinGeckoCoin[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      vs_currency: vsCurrency,
      order,
      page: page.toString(),
      sparkline: sparkline.toString(),
      price_change_percentage: priceChangePercentage
    });
    return this.fetchApi<CoinGeckoCoin[]>(`/coingecko/losers?${params}`);
  }

  async getMarketOverview(): Promise<MarketOverview> {
    return this.fetchApi<MarketOverview>('/coingecko/market-overview');
  }

  async getTopCryptocurrencies(limit = 20, vsCurrency = 'usd', order = 'desc', page = 1, sparkline = false, priceChangePercentage = '24h'): Promise<CoinGeckoCoin[]> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      vs_currency: vsCurrency,
      order,
      page: page.toString(),
      sparkline: sparkline.toString(),
      price_change_percentage: priceChangePercentage
    });
    return this.fetchApi<CoinGeckoCoin[]>(`/coingecko/top?${params}`);
  }

  async getTrendingCrypto(): Promise<TrendingItem[]> {
    const response = await this.fetchApi<{ item: TrendingItem }[]>('/coingecko/trending');
    return response.map(item => item.item);
  }

  async getTrendingSymbols(): Promise<string[]> {
    return this.fetchApi<string[]>('/coingecko/trending-symbols');
  }

  async getMarketContext(): Promise<string> {
    const response = await this.fetchApi<{ context: string }>('/coingecko/market-context');
    return response.context;
  }

  async getSimplePrice(ids: string, vsCurrencies = 'usd', include24hrChange = true): Promise<Record<string, Record<string, number>>> {
    const params = new URLSearchParams({
      ids,
      vs_currencies: vsCurrencies,
      include_24hr_change: include24hrChange.toString()
    });
    return this.fetchApi<Record<string, Record<string, number>>>(`/coingecko/simple-price?${params}`);
  }

  // Options endpoints
  async getOptionsRecommendations(params: {
    symbol?: string;
    symbols?: string;
    symbols_source?: string;
    yahoo_search?: string;
    yahoo_limit?: number;
    yahoo_list?: string;
    yahoo_region?: string;
    side?: string;
    min_dte?: number;
    max_dte?: number;
    limit?: number;
    rf_annual?: number;
    range?: string;
    interval?: string;
    sharpe_w?: number;
    sortino_w?: number;
    calmar_w?: number;
    min_delta?: number;
    max_delta?: number;
    min_premium?: number;
    max_premium?: number;
    min_volume?: number;
    min_strike_ratio?: number;
    max_strike_ratio?: number;
    signal?: string;
    order?: string;
    screener?: string;
    symbols_limit?: number;
    per_symbol_limit?: number;
    max_spread_pct?: number;
    feed?: string;
    type?: string;
    strike_price_gte?: number;
    strike_price_lte?: number;
    expiration_date?: string;
    expiration_date_gte?: string;
    expiration_date_lte?: string;
    root_symbol?: string;
    page_token?: string;
    alpaca_limit?: number;
    underlying_top?: number;
    debug?: boolean;
  } = {}): Promise<MarketDataItem[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.fetchApi<MarketDataItem[]>(`/options/recommendations?${queryParams.toString()}`);
  }

  async getHighOpenInterest(ticker: string, optionType = 'call'): Promise<HighOpenInterestResponse> {
    return this.fetchApi<HighOpenInterestResponse>(`/high-open-interest/${ticker}?option_type=${optionType}`);
  }

  async getHighOpenInterestBatch(tickers: string[], optionType = 'call'): Promise<HighOpenInterestResponse[]> {
    const tickersParam = tickers.join(',');
    return this.fetchApi<HighOpenInterestResponse[]>(`/high-open-interest/batch?tickers=${tickersParam}&option_type=${optionType}`);
  }

  async getTrendingOptions(params: {
    option_type?: string;
    rf_annual?: number;
    range?: string;
    interval?: string;
    sharpe_w?: number;
    sortino_w?: number;
    calmar_w?: number;
    limit?: number;
    min_underlying_score?: number;
    min_undervalued_score?: number;
  } = {}): Promise<TrendingOptionsResponse> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.fetchApi<TrendingOptionsResponse>(`/trending-options?${queryParams.toString()}`);
  }

  // Trending and market data
  async getTrendingStocks(limit = 10): Promise<MarketDataItem[]> {
    return this.fetchApi<MarketDataItem[]>(`/trending/stocks?limit=${limit}`);
  }

  async getTrendingCryptoData(limit = 10): Promise<MarketDataItem[]> {
    return this.fetchApi<MarketDataItem[]>(`/trending/crypto?limit=${limit}`);
  }

  async getRedditStocks(limit = 10): Promise<MarketDataItem[]> {
    return this.fetchApi<MarketDataItem[]>(`/reddit/stocks?limit=${limit}`);
  }

  // News and recommendations
  async getNews(): Promise<NewsItem[]> {
    return this.fetchApi<NewsItem[]>('/news');
  }

  async getFinvizRecommendations(params: {
    signal?: string;
    order?: string;
    screener?: string;
    limit?: number;
    range?: string;
    interval?: string;
    rf_annual?: number;
    target_return_annual?: number;
    periods_per_year?: number;
  } = {}): Promise<FinvizRecommendation[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.fetchApi<FinvizRecommendation[]>(`/recommendations/finviz?${queryParams.toString()}`);
  }

  async getYahooRecommendations(params: {
    symbols?: string;
    range?: string;
    interval?: string;
    rf_annual?: number;
    target_return_annual?: number;
    periods_per_year?: number;
  } = {}): Promise<YahooRankResult[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.fetchApi<YahooRankResult[]>(`/recommendations/yahoo?${queryParams.toString()}`);
  }

  // Screener and analysis
  async getScreenerCandidates(params: {
    signal?: string;
    order?: string;
    screener?: string;
    limit?: number;
  } = {}): Promise<FinvizCandidate[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.fetchApi<FinvizCandidate[]>(`/screener/candidates?${queryParams.toString()}`);
  }

  async getYahooMetrics(params: {
    symbols?: string;
    range?: string;
    interval?: string;
    rf_annual?: number;
    target_return_annual?: number;
    periods_per_year?: number;
  } = {}): Promise<YahooMetrics> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.fetchApi<YahooMetrics>(`/metrics/yahoo?${queryParams.toString()}`);
  }

  async getRankYahoo(params: {
    symbols?: string;
    range?: string;
    interval?: string;
    rf_annual?: number;
    target_return_annual?: number;
    periods_per_year?: number;
  } = {}): Promise<YahooRankResult[]> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return this.fetchApi<YahooRankResult[]>(`/rank/yahoo?${queryParams.toString()}`);
  }

  // Market data endpoints
  async getCrypto(limit = 10): Promise<MarketDataItem[]> {
    return this.fetchApi<MarketDataItem[]>(`/crypto?limit=${limit}`);
  }

  async getForex(limit = 10): Promise<ForexData[]> {
    return this.fetchApi<ForexData[]>(`/forex?limit=${limit}`);
  }

  async getFuture(limit = 10): Promise<FuturesData[]> {
    return this.fetchApi<FuturesData[]>(`/future?limit=${limit}`);
  }

  async getGroup(limit = 10): Promise<GroupData[]> {
    return this.fetchApi<GroupData[]>(`/group?limit=${limit}`);
  }

  async getInsider(limit = 10): Promise<InsiderData[]> {
    return this.fetchApi<InsiderData[]>(`/insider?limit=${limit}`);
  }

  // Kraken endpoints
  async getKrakenAssets(): Promise<KrakenAsset[]> {
    return this.fetchApi<KrakenAsset[]>('/kraken/assets');
  }

  async getKrakenPairs(): Promise<KrakenAssetPair[]> {
    return this.fetchApi<KrakenAssetPair[]>('/kraken/pairs');
  }

  async getKrakenTicker(pairs?: string): Promise<KrakenTicker[]> {
    const endpoint = pairs ? `/kraken/ticker?pairs=${pairs}` : '/kraken/ticker';
    return this.fetchApi<KrakenTicker[]>(endpoint);
  }

  async getKrakenTickerByPair(pair: string): Promise<KrakenTicker> {
    return this.fetchApi<KrakenTicker>(`/kraken/ticker/${pair}`);
  }

  async getKrakenOrderBook(pair: string, depth?: number): Promise<KrakenOrderBook> {
    const endpoint = depth ? `/kraken/orderbook/${pair}?depth=${depth}` : `/kraken/orderbook/${pair}`;
    return this.fetchApi<KrakenOrderBook>(endpoint);
  }

  async getKrakenOHLC(pair: string, interval?: number): Promise<MarketDataItem> {
    const endpoint = interval ? `/kraken/ohlc/${pair}?interval=${interval}` : `/kraken/ohlc/${pair}`;
    return this.fetchApi<MarketDataItem>(endpoint);
  }

  async getKrakenTrades(pair: string): Promise<MarketDataItem[]> {
    return this.fetchApi<MarketDataItem[]>(`/kraken/trades/${pair}`);
  }

  async getKrakenStatus(): Promise<MarketDataItem> {
    return this.fetchApi<MarketDataItem>('/kraken/status');
  }

  async getKrakenTime(): Promise<MarketDataItem> {
    return this.fetchApi<MarketDataItem>('/kraken/time');
  }

  async getKrakenSummary(pair: string): Promise<MarketDataItem> {
    return this.fetchApi<MarketDataItem>(`/kraken/summary/${pair}`);
  }

  async getKrakenTrending(limit?: number): Promise<MarketDataItem[]> {
    const endpoint = limit ? `/kraken/trending?limit=${limit}` : '/kraken/trending';
    return this.fetchApi<MarketDataItem[]>(endpoint);
  }
}

export const tradingAPI = new TradingAPI();