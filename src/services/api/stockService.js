import { toast } from "react-toastify";
import React from "react";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Yahoo Finance API integration using fetch
const yahooFinance = {
  quote: async (symbol) => {
    try {
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`);
      if (!response.ok) throw new Error('Yahoo Finance API error');
      const data = await response.json();
      return data.chart?.result?.[0]?.meta || null;
    } catch (error) {
      console.warn(`Yahoo Finance quote failed for ${symbol}:`, error);
      return null;
    }
  },
  historical: async (symbol, { period1, period2, interval = '1d' }) => {
    try {
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=${interval}`);
      if (!response.ok) throw new Error('Yahoo Finance API error');
      const data = await response.json();
      return data.chart?.result?.[0] || null;
    } catch (error) {
      console.warn(`Yahoo Finance historical data failed for ${symbol}:`, error);
      return null;
    }
  }
};

class StockService {
  constructor() {
    this.apperClient = null;
    this.initializeClient();
  }

initializeClient() {
    try {
      // Check if ApperSDK is available
      if (typeof window === 'undefined' || !window.ApperSDK) {
        console.warn('ApperSDK not available, running in offline mode');
        return;
      }

      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    } catch (error) {
      console.error('Failed to initialize ApperClient:', error);
      this.apperClient = null;
    }
  }

async getAll() {
    try {
      // Return empty array if ApperClient is not available
      if (!this.apperClient) {
        console.warn('ApperClient not available, returning empty stocks array');
        return [];
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "symbol" } },
          { field: { Name: "price" } },
          { field: { Name: "change" } },
          { field: { Name: "change_percent" } },
          { field: { Name: "volume" } },
          { field: { Name: "market_cap" } },
          { field: { Name: "sector" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "ModifiedOn" } }
        ],
        orderBy: [
          {
            fieldName: "Name",
            sorttype: "ASC"
          }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('stock', params);
      
      if (!response || !response.success) {
        const errorMsg = response?.message || 'Failed to fetch stocks';
        console.error(errorMsg);
        toast.error(errorMsg);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching stocks:', error);
      toast.error('Failed to load stocks');
      return [];
    }
  }

async getById(id) {
    try {
      if (!this.apperClient) {
        throw new Error('ApperClient not available');
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "symbol" } },
          { field: { Name: "price" } },
          { field: { Name: "change" } },
          { field: { Name: "change_percent" } },
          { field: { Name: "volume" } },
          { field: { Name: "market_cap" } },
          { field: { Name: "sector" } }
        ]
      };

      const response = await this.apperClient.getRecordById('stock', parseInt(id), params);
      
      if (!response || !response.success) {
        const errorMsg = response?.message || `Failed to fetch stock with ID ${id}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching stock with ID ${id}:`, error);
      throw error;
    }
  }

async getIndicators(stockId) {
    try {
      if (!this.apperClient) {
        console.warn('ApperClient not available, returning empty indicators array');
        return [];
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "type" } },
          { field: { Name: "value" } },
          { field: { Name: "signal" } },
          { field: { Name: "timestamp" } },
          { field: { Name: "stock_id" } }
        ],
        where: [
          {
            FieldName: "stock_id",
            Operator: "EqualTo",
            Values: [parseInt(stockId)]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords('indicator', params);
      
      if (!response || !response.success) {
        const errorMsg = response?.message || `Failed to fetch indicators for stock ${stockId}`;
        console.error(errorMsg);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching indicators:', error);
      return [];
    }
  }

async fetchYahooFinanceData(symbol) {
    if (!yahooFinance || !symbol) return null;
    
    try {
      const quote = await yahooFinance.quote(symbol);
      if (!quote) return null;
      
      return {
        price: quote.regularMarketPrice || quote.previousClose || null,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        volume: quote.regularMarketVolume || 0,
        marketCap: quote.marketCap || 0
      };
    } catch (error) {
      // Handle CORS errors and other API failures gracefully
      if (error.message.includes('CORS') || error.message.includes('fetch')) {
        console.warn(`CORS error fetching Yahoo Finance data for ${symbol}, using database fallback`);
      } else {
        console.warn(`Failed to fetch Yahoo Finance data for ${symbol}:`, error);
      }
      return null;
    }
  }

async getAllWithIndicators() {
    try {
      const stocks = await this.getAll();
      
      // Get all indicators if ApperClient is available
      let indicators = [];
      if (this.apperClient) {
        try {
          const indicatorParams = {
            fields: [
              { field: { Name: "Name" } },
              { field: { Name: "type" } },
              { field: { Name: "value" } },
              { field: { Name: "signal" } },
              { field: { Name: "timestamp" } },
              { field: { Name: "stock_id" } }
            ],
            pagingInfo: {
              limit: 1000,
              offset: 0
            }
          };

          const indicatorResponse = await this.apperClient.fetchRecords('indicator', indicatorParams);
          indicators = indicatorResponse?.success ? indicatorResponse.data || [] : [];
        } catch (indicatorError) {
          console.warn('Failed to fetch indicators:', indicatorError);
          indicators = [];
        }
      }

      // Enhance stocks with Yahoo Finance data
      const enhancedStocks = await Promise.all(stocks.map(async (stock) => {
        const stockIndicators = indicators.filter(ind => ind.stock_id === stock.Id);
        
        // Try to get real-time data from Yahoo Finance (with CORS fallback)
        let yahooData = null;
        if (stock.symbol && typeof stock.symbol === 'string') {
          try {
            yahooData = await this.fetchYahooFinanceData(stock.symbol);
          } catch (yahooError) {
            console.warn(`Yahoo Finance error for ${stock.symbol}:`, yahooError);
            yahooData = null;
          }
        }
        
        return {
          ...stock,
          // Use Yahoo Finance data if available, otherwise fallback to database values
          symbol: stock.symbol || '',
          name: stock.Name || stock.name || '',
          price: yahooData?.price !== null ? yahooData.price : (stock.price || 0),
          change: yahooData?.change !== null ? yahooData.change : (stock.change || 0),
          changePercent: yahooData?.changePercent !== null ? yahooData.changePercent : (stock.change_percent || 0),
          volume: yahooData?.volume !== null ? yahooData.volume : (stock.volume || 0),
          marketCap: yahooData?.marketCap !== null ? yahooData.marketCap : (stock.market_cap || 0),
          sector: stock.sector || '',
          indicators: stockIndicators.map(ind => ({
            Id: ind.Id,
            type: ind.type,
            value: ind.value,
            signal: ind.signal,
            timestamp: ind.timestamp
          }))
        };
      }));

      return enhancedStocks;
    } catch (error) {
      console.error('Error fetching stocks with indicators:', error);
      toast.error('Failed to load stock data');
      return [];
    }
  }

  async screenStocks(filters) {
    try {
      const stocksWithIndicators = await this.getAllWithIndicators();
      
      if (!filters || filters.length === 0) {
        return stocksWithIndicators;
      }

      const enabledFilters = filters.filter(f => f.enabled);
      if (enabledFilters.length === 0) {
        return stocksWithIndicators;
      }

      return stocksWithIndicators.filter(stock => {
        return enabledFilters.every(filter => {
          // Handle price-based filters
          if (filter.indicatorType === 'PRICE') {
            const { operator, threshold, maxThreshold } = filter;
            const price = stock.price;
            
            switch (operator) {
              case '>':
                return price > threshold;
              case '<':
                return price < threshold;
              case '>=':
                return price >= threshold;
              case '<=':
                return price <= threshold;
              case '=':
                return Math.abs(price - threshold) < 0.01;
              case 'between':
                const min = Math.min(threshold, maxThreshold || threshold);
                const max = Math.max(threshold, maxThreshold || threshold);
                return price >= min && price <= max;
              default:
                return true;
            }
          }
          
          // Handle technical indicator filters
          const indicator = stock.indicators.find(ind => ind.type === filter.indicatorType);
          if (!indicator) return false;
          
          const { operator, threshold } = filter;
          const value = indicator.value;
          
          switch (operator) {
            case '>':
              return value > threshold;
            case '<':
              return value < threshold;
            case '>=':
              return value >= threshold;
            case '<=':
              return value <= threshold;
            case '=':
              return Math.abs(value - threshold) < 0.01;
            default:
              return true;
          }
        });
      });
    } catch (error) {
      console.error('Error screening stocks:', error);
      toast.error('Failed to apply filters');
      return [];
    }
  }

async getHistoricalData(stockId, period = '1M') {
    try {
      await delay(300);
      const stock = await this.getById(stockId);
      if (!stock) {
        throw new Error('Stock not found');
      }

      // Try to get real historical data from Yahoo Finance
      if (yahooFinance && stock.symbol) {
        try {
          const periods = {
            '1D': { days: 1, interval: '1m' },
            '1W': { days: 7, interval: '1h' },
            '1M': { days: 30, interval: '1d' },
            '3M': { days: 90, interval: '1d' },
            '6M': { days: 180, interval: '1d' },
            '1Y': { days: 365, interval: '1d' }
          };

          const periodConfig = periods[period] || periods['1M'];
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(endDate.getDate() - periodConfig.days);

          const historicalData = await yahooFinance.historical(stock.symbol, {
            period1: Math.floor(startDate.getTime() / 1000),
            period2: Math.floor(endDate.getTime() / 1000),
            interval: periodConfig.interval
          });

          if (historicalData && historicalData.timestamp) {
            const data = historicalData.timestamp.map((timestamp, index) => ({
              timestamp: new Date(timestamp * 1000).toISOString(),
              open: historicalData.indicators?.quote?.[0]?.open?.[index] || stock.price,
              high: historicalData.indicators?.quote?.[0]?.high?.[index] || stock.price,
              low: historicalData.indicators?.quote?.[0]?.low?.[index] || stock.price,
              close: historicalData.indicators?.quote?.[0]?.close?.[index] || stock.price,
              volume: historicalData.indicators?.quote?.[0]?.volume?.[index] || stock.volume,
              sma20: null, // Calculate if needed
              ema20: null  // Calculate if needed
            })).filter(item => item.close != null);

            return {
              symbol: stock.symbol,
              period,
              data
            };
          }
        } catch (yahooError) {
          console.warn('Yahoo Finance historical data failed, falling back to mock data:', yahooError);
        }
      }

      // Fallback to mock data generation if Yahoo Finance is unavailable
      const periods = {
        '1D': 1,
        '1W': 7, 
        '1M': 30,
        '3M': 90,
        '6M': 180,
        '1Y': 365
      };

      const days = periods[period] || 30;
      const data = [];
      const basePrice = stock.price;
      
      for (let i = days; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // Generate realistic OHLCV data with some volatility
        const volatility = 0.02 + (Math.random() * 0.03);
        const priceChange = (Math.random() - 0.5) * volatility;
        const open = basePrice * (1 + priceChange);
        const high = open * (1 + Math.random() * 0.02);
        const low = open * (1 - Math.random() * 0.02);
        const close = low + (Math.random() * (high - low));
        const volume = stock.volume * (0.5 + Math.random());

        data.push({
          timestamp: date.toISOString(),
          open: Math.round(open),
          high: Math.round(high), 
          low: Math.round(low),
          close: Math.round(close),
          volume: Math.round(volume),
          sma20: i < days - 20 ? Math.round(close * (0.98 + Math.random() * 0.04)) : null,
          ema20: i < days - 20 ? Math.round(close * (0.99 + Math.random() * 0.02)) : null
        });
      }

      return {
        symbol: stock.symbol,
        period,
        data
      };
    } catch (error) {
      console.error('Error fetching historical data:', error);
      throw error;
    }
  }

  async create(stockData) {
    try {
      const params = {
        records: [
          {
            Name: stockData.Name,
            Tags: stockData.Tags,
            symbol: stockData.symbol,
            price: stockData.price,
            change: stockData.change,
            change_percent: stockData.change_percent,
            volume: stockData.volume,
            market_cap: stockData.market_cap,
            sector: stockData.sector
          }
        ]
      };

      const response = await this.apperClient.createRecord('stock', params);
      
if (!response || !response.success) {
        const errorMsg = response?.message || 'Failed to create stock';
        console.error(errorMsg);
        toast.error(errorMsg);
        return null;
      }

      if (response.results) {
const failedRecords = response.results?.filter(result => !result.success) || [];
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record?.message) toast.error(record.message);
          });
        }
        
        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }

      return null;
    } catch (error) {
      console.error('Error creating stock:', error);
      toast.error('Failed to create stock');
      return null;
    }
  }

  async update(id, updateData) {
    try {
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: updateData.Name,
            Tags: updateData.Tags,
            symbol: updateData.symbol,
            price: updateData.price,
            change: updateData.change,
            change_percent: updateData.change_percent,
            volume: updateData.volume,
            market_cap: updateData.market_cap,
            sector: updateData.sector
          }
        ]
      };

      const response = await this.apperClient.updateRecord('stock', params);
      
if (!response || !response.success) {
        const errorMsg = response?.message || 'Failed to update stock';
        console.error(errorMsg);
        toast.error(errorMsg);
        return null;
      }

      if (response.results) {
const failedRecords = response.results?.filter(result => !result.success) || [];
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record?.message) toast.error(record.message);
          });
        }

        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords.length > 0 ? successfulRecords[0].data : null;
      }

      return null;
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error('Failed to update stock');
      return null;
    }
  }

  async delete(id) {
    try {
      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord('stock', params);
      
      if (!response.success) {
const errorMsg = response?.message || 'Failed to delete stock';
        console.error(errorMsg);
        toast.error(errorMsg);
        return false;
      }
if (response.results) {
        const failedRecords = response.results?.filter(result => !result.success) || [];
        if (failedRecords.length > 0) {
          console.error(`Failed to delete ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record?.message) toast.error(record.message);
          });
        }

        const successfulRecords = response.results.filter(result => result.success);
        return successfulRecords.length > 0;
      }

      return false;
    } catch (error) {
      console.error('Error deleting stock:', error);
      toast.error('Failed to delete stock');
      return false;
    }
  }
}

export default new StockService();