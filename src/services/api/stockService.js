import stockData from '@/services/mockData/stocks.json';
import indicatorData from '@/services/mockData/indicators.json';

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
}

export default new StockService();