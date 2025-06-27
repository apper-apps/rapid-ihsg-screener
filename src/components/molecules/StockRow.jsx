import { motion } from "framer-motion";
import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Sparkline from "@/components/molecules/Sparkline";
import Badge from "@/components/atoms/Badge";
const StockRow = ({ stock, index, onClick }) => {
  const getSignalBadge = (signal) => {
    const variants = {
      bullish: 'bullish',
      bearish: 'bearish',
      neutral: 'neutral',
      overbought: 'warning',
      oversold: 'info'
    };
    
    const icons = {
      bullish: 'TrendingUp',
      bearish: 'TrendingDown',
      neutral: 'Minus',
      overbought: 'AlertTriangle',
      oversold: 'AlertCircle'
    };

    return (
      <Badge 
        variant={variants[signal] || 'default'} 
        icon={icons[signal]}
        size="sm"
      >
        {signal}
      </Badge>
    );
  };

  const formatNumber = (num) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

return (
    <motion.tr
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => onClick?.(stock)}
      className="border-b border-surface-100 hover:bg-surface-50 transition-colors duration-150 cursor-pointer"
    >
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="font-mono font-medium text-surface-900">
            {stock.symbol}
          </span>
          <span className="text-xs text-surface-500 truncate max-w-[150px]">
            {stock.name}
          </span>
        </div>
      </td>
      
      <td className="px-4 py-3 text-right">
        <span className="font-mono text-surface-900">
          {formatPrice(stock.price)}
        </span>
      </td>
      
      <td className="px-4 py-3 text-right">
        <div className="flex flex-col items-end">
          <span className={`font-mono text-sm ${
            stock.change >= 0 ? 'text-accent' : 'text-secondary'
          }`}>
            {stock.change >= 0 ? '+' : ''}{formatPrice(stock.change)}
          </span>
          <span className={`text-xs ${
            stock.changePercent >= 0 ? 'text-accent' : 'text-secondary'
          }`}>
            ({stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%)
          </span>
        </div>
      </td>
      
      <td className="px-4 py-3 text-right">
        <span className="font-mono text-sm text-surface-600">
          {formatNumber(stock.volume)}
        </span>
      </td>
      
      <td className="px-4 py-3">
        <span className="text-sm text-surface-600 bg-surface-50 px-2 py-1 rounded">
          {stock.sector}
        </span>
      </td>
      
<td className="px-4 py-3">
        <div className="flex flex-col space-y-2">
          {/* Price trend sparkline */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-surface-500 font-mono">Trend:</span>
            <Sparkline data={stock.priceHistory} />
          </div>
          
          {/* Indicators */}
          <div className="flex flex-wrap gap-1">
            {stock.indicators?.map((indicator) => (
              <div key={indicator.Id} className="flex items-center space-x-1">
                <span className="text-xs text-surface-500 font-mono">
                  {indicator.type}:
                </span>
                <span className="text-xs font-mono text-surface-700">
                  {indicator.value}
                </span>
                {getSignalBadge(indicator.signal)}
              </div>
            ))}
          </div>
        </div>
      </td>
    </motion.tr>
  );
};

export default StockRow;