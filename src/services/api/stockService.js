import indicatorData from "@/services/mockData/indicators.json";
import stockData from "@/services/mockData/stocks.json";
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

class StockService {
  async getAll() {
    await delay(300);
    return [...stockData];
  }

  async getById(id) {
    await delay(200);
    const stock = stockData.find(item => item.Id === parseInt(id, 10));
    if (!stock) {
      throw new Error('Stock not found');
    }
    return { ...stock };
  }

  async getIndicators(stockId) {
    await delay(200);
    const indicators = indicatorData.filter(item => item.stockId === parseInt(stockId, 10));
    return indicators.map(item => ({ ...item }));
  }

  async getAllWithIndicators() {
    await delay(400);
    const stocks = [...stockData];
    const indicators = [...indicatorData];
    
    return stocks.map(stock => {
      const stockIndicators = indicators.filter(ind => ind.stockId === stock.Id);
      return {
        ...stock,
        indicators: stockIndicators
      };
    });
  }

async screenStocks(filters) {
    await delay(300);
    const stocksWithIndicators = await this.getAllWithIndicators();
    
    if (!filters || filters.length === 0) {
      return stocksWithIndicators;
    }

    return stocksWithIndicators.filter(stock => {
      return filters.every(filter => {
        if (!filter.enabled) return true;
        
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
  }

  // Calculate technical indicators for a stock
  calculateRSI(prices, period = 14) {
    if (prices.length < period) return null;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains += change;
      } else {
        losses += Math.abs(change);
      }
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    return Math.round(rsi * 100) / 100;
  }

  calculateSMA(prices, period) {
    if (prices.length < period) return null;
    
    const sum = prices.slice(-period).reduce((acc, price) => acc + price, 0);
    return Math.round((sum / period) * 100) / 100;
  }

calculateEMA(prices, period) {
    if (prices.length < period) return null;
    
    const multiplier = 2 / (period + 1);
    let ema = this.calculateSMA(prices.slice(0, period), period);
    
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }
return Math.round(ema * 100) / 100;
  }

  calculateBollingerBands(prices, period = 20, multiplier = 2) {
    if (prices.length < period) return null;
    
    const sma = this.calculateSMA(prices, period);
    if (!sma) return null;
    
    // Calculate standard deviation
    const recentPrices = prices.slice(-period);
    const variance = recentPrices.reduce((acc, price) => {
      return acc + Math.pow(price - sma, 2);
    }, 0) / period;
    
    const standardDeviation = Math.sqrt(variance);
    
    const upperBand = sma + (multiplier * standardDeviation);
    const lowerBand = sma - (multiplier * standardDeviation);
    const middleBand = sma;
    
    return {
      upper: Math.round(upperBand * 100) / 100,
      lower: Math.round(lowerBand * 100) / 100,
      middle: Math.round(middleBand * 100) / 100
    };
  }

  calculateATR(highs, lows, closes, period = 14) {
    if (highs.length < period + 1 || lows.length < period + 1 || closes.length < period + 1) {
      return null;
    }
    
    const trueRanges = [];
    
    // Calculate True Range for each period
    for (let i = 1; i < highs.length; i++) {
      const high = highs[i];
      const low = lows[i];
      const prevClose = closes[i - 1];
      
      const tr1 = high - low;
      const tr2 = Math.abs(high - prevClose);
      const tr3 = Math.abs(low - prevClose);
      
      const trueRange = Math.max(tr1, tr2, tr3);
      trueRanges.push(trueRange);
    }
    
    if (trueRanges.length < period) return null;
    
    // Calculate initial ATR (simple average of first period)
    let atr = trueRanges.slice(0, period).reduce((sum, tr) => sum + tr, 0) / period;
    
    // Calculate smoothed ATR using Wilder's smoothing method
    for (let i = period; i < trueRanges.length; i++) {
      atr = ((atr * (period - 1)) + trueRanges[i]) / period;
    }
    
    return Math.round(atr * 100) / 100;
  }
  async getHistoricalData(stockId, period = '1M') {
    await delay(300);
    const stock = stockData.find(item => item.Id === parseInt(stockId, 10));
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
  }
}

export default new StockService();