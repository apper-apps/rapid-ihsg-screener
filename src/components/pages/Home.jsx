import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import stockService from "@/services/api/stockService";
import Header from "@/components/organisms/Header";
import StockDetailModal from "@/components/organisms/StockDetailModal";
import StockTable from "@/components/organisms/StockTable";
import FilterPanel from "@/components/organisms/FilterPanel";

const Home = () => {
const [stocks, setStocks] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const loadStocks = async () => {
    setLoading(true);
    setError(null);
    try {
      const stocksWithIndicators = await stockService.getAllWithIndicators();
      setAllStocks(stocksWithIndicators);
      setStocks(stocksWithIndicators);
    } catch (err) {
      setError(err.message || 'Failed to load stocks');
      toast.error('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    if (filters.length === 0) {
      setStocks(allStocks);
      return;
    }

    const enabledFilters = filters.filter(f => f.enabled);
    if (enabledFilters.length === 0) {
      setStocks(allStocks);
      return;
    }

    setLoading(true);
    try {
      const filteredStocks = await stockService.screenStocks(enabledFilters);
      setStocks(filteredStocks);
      
      if (filteredStocks.length === 0) {
        toast.info('No stocks match the current filter criteria');
      }
    } catch (err) {
      setError(err.message || 'Failed to apply filters');
      toast.error('Failed to filter stocks');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearAllFilters = () => {
    setFilters([]);
    setStocks(allStocks);
    toast.success('All filters cleared');
  };

  const handleExportCSV = () => {
    if (stocks.length === 0) {
      toast.warn('No data to export');
      return;
    }

    try {
      const headers = [
        'Symbol',
        'Name', 
        'Price',
        'Change',
        'Change %',
        'Volume',
        'Market Cap',
        'Sector',
        'RSI',
        'MACD',
        'SMA 20',
        'EMA 12'
      ];

      const csvData = stocks.map(stock => {
        const rsi = stock.indicators?.find(ind => ind.type === 'RSI')?.value || '';
        const macd = stock.indicators?.find(ind => ind.type === 'MACD')?.value || '';
        const sma = stock.indicators?.find(ind => ind.type === 'SMA_20')?.value || '';
        const ema = stock.indicators?.find(ind => ind.type === 'EMA_12')?.value || '';

        return [
          stock.symbol,
          stock.name,
          stock.price,
          stock.change,
          stock.changePercent,
          stock.volume,
          stock.marketCap,
          stock.sector,
          rsi,
          macd,
          sma,
          ema
        ];
      });

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `ihsg-screener-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${stocks.length} stocks to CSV`);
    } catch (err) {
      toast.error('Failed to export data');
    }
};

  const handleStockClick = (stock) => {
    setSelectedStock(stock);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedStock(null);
  };

  useEffect(() => {
    loadStocks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, allStocks]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Header
        onExport={handleExportCSV}
        resultsCount={stocks.length}
        totalCount={allStocks.length}
        loading={loading}
      />

      <div className="flex-1 flex overflow-hidden">
        <motion.aside
          initial={{ x: -300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-96 bg-surface-50 border-r border-surface-200 overflow-y-auto p-6"
        >
          <FilterPanel
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearAll={handleClearAllFilters}
          />
        </motion.aside>

        <motion.main
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex-1 overflow-y-auto p-6"
        >
<StockTable
            stocks={stocks}
            loading={loading}
            error={error}
            onRetry={loadStocks}
            onStockClick={handleStockClick}
          />
        </motion.main>
      </div>

      <StockDetailModal
        stock={selectedStock}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default Home;