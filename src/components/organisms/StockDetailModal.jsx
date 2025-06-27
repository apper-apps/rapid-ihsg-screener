import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Chart from 'react-apexcharts';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import stockService from '@/services/api/stockService';

const StockDetailModal = ({ stock, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('chart');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState('1M');
  const [showIndicators, setShowIndicators] = useState({
    sma20: true,
    ema20: true,
    rsi: false
  });

  useEffect(() => {
    if (isOpen && stock) {
      loadChartData();
    }
  }, [isOpen, stock, period]);

  const loadChartData = async () => {
    if (!stock) return;
    
    setLoading(true);
    try {
      const data = await stockService.getHistoricalData(stock.Id, period);
      setChartData(data);
    } catch (error) {
      toast.error('Failed to load chart data');
      console.error('Chart data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID').format(price);
  };

  const formatNumber = (num) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num?.toLocaleString() || '0';
  };

  const getChartOptions = () => {
    if (!chartData) return {};

    const candlestickData = chartData.data.map(item => ({
      x: new Date(item.timestamp),
      y: [item.open, item.high, item.low, item.close]
    }));

    const volumeData = chartData.data.map(item => ({
      x: new Date(item.timestamp),
      y: item.volume
    }));

    const smaData = chartData.data
      .filter(item => item.sma20)
      .map(item => ({
        x: new Date(item.timestamp),
        y: item.sma20
      }));

    const emaData = chartData.data
      .filter(item => item.ema20)
      .map(item => ({
        x: new Date(item.timestamp),
        y: item.ema20
      }));

    return {
      chart: {
        type: 'candlestick',
        height: 400,
        toolbar: {
          show: true,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        },
        zoom: {
          enabled: true
        }
      },
      title: {
        text: `${stock.symbol} - ${stock.name}`,
        align: 'left',
        style: {
          fontSize: '18px',
          fontWeight: 600
        }
      },
      xaxis: {
        type: 'datetime',
        labels: {
          format: 'dd MMM'
        }
      },
      yaxis: [
        {
          title: {
            text: 'Price (IDR)'
          },
          labels: {
            formatter: (val) => formatPrice(val)
          }
        },
        {
          opposite: true,
          title: {
            text: 'Volume'
          },
          labels: {
            formatter: (val) => formatNumber(val)
          },
          max: Math.max(...volumeData.map(d => d.y)) * 4
        }
      ],
      plotOptions: {
        candlestick: {
          colors: {
            upward: '#10B981',
            downward: '#EF4444'
          }
        }
      },
      series: [
        {
          name: 'Price',
          type: 'candlestick',
          data: candlestickData
        },
        {
          name: 'Volume',
          type: 'column',
          yAxisIndex: 1,
          data: volumeData,
          color: '#9CA3AF'
        },
        ...(showIndicators.sma20 ? [{
          name: 'SMA 20',
          type: 'line',
          data: smaData,
          color: '#3B82F6'
        }] : []),
        ...(showIndicators.ema20 ? [{
          name: 'EMA 20',
          type: 'line',
          data: emaData,
          color: '#8B5CF6'
        }] : [])
      ],
      legend: {
        show: true
      },
      tooltip: {
        enabled: true,
        shared: true
      }
    };
  };

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

  const TabButton = ({ id, label, icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        activeTab === id
          ? 'bg-primary text-white'
          : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100'
      }`}
    >
      <ApperIcon name={icon} size={16} />
      <span>{label}</span>
    </button>
  );

  if (!stock) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-surface-100">
              <div className="flex items-center space-x-4">
                <div>
                  <h2 className="text-xl font-heading font-semibold text-surface-900">
                    {stock.symbol}
                  </h2>
                  <p className="text-surface-600">{stock.name}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-mono font-bold text-surface-900">
                    {formatPrice(stock.price)}
                  </span>
                  <div className={`flex items-center space-x-1 ${
                    stock.change >= 0 ? 'text-accent' : 'text-secondary'
                  }`}>
                    <ApperIcon 
                      name={stock.change >= 0 ? 'TrendingUp' : 'TrendingDown'} 
                      size={16} 
                    />
                    <span className="font-mono">
                      {stock.change >= 0 ? '+' : ''}{formatPrice(stock.change)} ({stock.changePercent}%)
                    </span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <ApperIcon name="X" size={20} />
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex items-center space-x-4 p-6 border-b border-surface-100">
              <TabButton id="chart" label="Price Chart" icon="TrendingUp" />
              <TabButton id="analysis" label="Technical Analysis" icon="BarChart3" />
              <TabButton id="info" label="Company Info" icon="Info" />
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {activeTab === 'chart' && (
                <div className="space-y-6">
                  {/* Period and Indicator Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-surface-700">Period:</span>
                      {['1D', '1W', '1M', '3M', '6M', '1Y'].map((p) => (
                        <Button
                          key={p}
                          variant={period === p ? 'primary' : 'outline'}
                          size="sm"
                          onClick={() => setPeriod(p)}
                        >
                          {p}
                        </Button>
                      ))}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium text-surface-700">Indicators:</span>
                      {Object.entries(showIndicators).map(([key, enabled]) => (
                        <label key={key} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setShowIndicators(prev => ({
                              ...prev,
                              [key]: e.target.checked
                            }))}
                            className="rounded border-surface-300"
                          />
                          <span className="text-sm text-surface-600">
                            {key.toUpperCase()}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Chart */}
                  <Card>
                    {loading ? (
                      <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : chartData ? (
                      <Chart
                        options={getChartOptions()}
                        series={getChartOptions().series}
                        type="candlestick"
                        height={400}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-96 text-surface-500">
                        No chart data available
                      </div>
                    )}
                  </Card>
                </div>
              )}

              {activeTab === 'analysis' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {stock.indicators?.map((indicator) => (
                      <Card key={indicator.Id}>
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-surface-900">
                              {indicator.type}
                            </h3>
                            {getSignalBadge(indicator.signal)}
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-surface-600">Value:</span>
                              <span className="font-mono font-bold">
                                {indicator.value}
                              </span>
                            </div>
                            <p className="text-sm text-surface-600">
                              {indicator.description || 'Technical indicator analysis'}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'info' && (
                <div className="space-y-6">
                  <Card>
                    <div className="p-4">
                      <h3 className="font-semibold text-surface-900 mb-4">Company Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-surface-600">Sector:</span>
                          <p className="font-medium">{stock.sector}</p>
                        </div>
                        <div>
                          <span className="text-surface-600">Volume:</span>
                          <p className="font-mono">{formatNumber(stock.volume)}</p>
                        </div>
                        <div>
                          <span className="text-surface-600">Market Cap:</span>
                          <p className="font-mono">{formatNumber(stock.marketCap || stock.price * 1000000)}</p>
                        </div>
                        <div>
                          <span className="text-surface-600">P/E Ratio:</span>
                          <p className="font-mono">{stock.pe || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StockDetailModal;