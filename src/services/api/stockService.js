import { toast } from 'react-toastify';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class StockService {
  constructor() {
    this.apperClient = null;
    this.initializeClient();
  }

  initializeClient() {
    try {
      const { ApperClient } = window.ApperSDK;
      this.apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });
    } catch (error) {
      console.error('Failed to initialize ApperClient:', error);
    }
  }

  async getAll() {
    try {
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
        ],
        orderBy: [
          {
            fieldName: "symbol",
            sorttype: "ASC"
          }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords('stock', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
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
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching stock with ID ${id}:`, error);
      throw error;
    }
  }

  async getIndicators(stockId) {
    try {
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
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error('Error fetching indicators:', error);
      return [];
    }
  }

  async getAllWithIndicators() {
    try {
      const stocks = await this.getAll();
      
      // Get all indicators
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
      const indicators = indicatorResponse.success ? indicatorResponse.data || [] : [];

      // Match indicators to stocks
      return stocks.map(stock => {
        const stockIndicators = indicators.filter(ind => ind.stock_id === stock.Id);
        return {
          ...stock,
          // Map database fields to UI expected fields
          symbol: stock.symbol,
          name: stock.Name,
          price: stock.price,
          change: stock.change,
          changePercent: stock.change_percent,
          volume: stock.volume,
          marketCap: stock.market_cap,
          sector: stock.sector,
          indicators: stockIndicators.map(ind => ({
            Id: ind.Id,
            type: ind.type,
            value: ind.value,
            signal: ind.signal,
            timestamp: ind.timestamp
          }))
        };
      });
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

      // Generate mock historical data based on period
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
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) toast.error(record.message);
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
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to update ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) toast.error(record.message);
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
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const failedRecords = response.results.filter(result => !result.success);
        if (failedRecords.length > 0) {
          console.error(`Failed to delete ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
          failedRecords.forEach(record => {
            if (record.message) toast.error(record.message);
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