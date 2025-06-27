import { useState } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import StockRow from '@/components/molecules/StockRow';
import SkeletonLoader from '@/components/molecules/SkeletonLoader';
import EmptyState from '@/components/molecules/EmptyState';
import ErrorState from '@/components/molecules/ErrorState';
import ApperIcon from '@/components/ApperIcon';

const StockTable = ({ 
  stocks, 
  loading, 
  error, 
  onRetry,
  className = ''
}) => {
  const [sortField, setSortField] = useState('symbol');
  const [sortDirection, setSortDirection] = useState('asc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const SortButton = ({ field, children }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="text-left font-medium text-surface-700 hover:text-surface-900"
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          <ApperIcon 
            name={sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown'} 
            className="w-4 h-4" 
          />
        )}
      </div>
    </Button>
  );

  if (loading) {
    return (
      <Card className={className}>
        <div className="p-4 border-b border-surface-100">
          <h2 className="font-heading font-semibold text-surface-900">
            Stock Results
          </h2>
        </div>
        <SkeletonLoader count={8} type="table" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <div className="p-4 border-b border-surface-100">
          <h2 className="font-heading font-semibold text-surface-900">
            Stock Results
          </h2>
        </div>
        <ErrorState 
          message={error}
          onRetry={onRetry}
        />
      </Card>
    );
  }

  if (stocks.length === 0) {
    return (
      <Card className={className}>
        <div className="p-4 border-b border-surface-100">
          <h2 className="font-heading font-semibold text-surface-900">
            Stock Results
          </h2>
        </div>
        <EmptyState
          title="No stocks match your criteria"
          description="Try adjusting your filters to see more results, or clear all filters to view all stocks."
          icon="SearchX"
        />
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-4 border-b border-surface-100">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-semibold text-surface-900">
            Stock Results
          </h2>
          <span className="text-sm text-surface-600">
            {stocks.length} stocks found
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-100 bg-surface-50">
              <th className="px-4 py-3 text-left">
                <SortButton field="symbol">Symbol</SortButton>
              </th>
              <th className="px-4 py-3 text-right">
                <SortButton field="price">Price</SortButton>
              </th>
              <th className="px-4 py-3 text-right">
                <SortButton field="change">Change</SortButton>
              </th>
              <th className="px-4 py-3 text-right">
                <SortButton field="volume">Volume</SortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <SortButton field="sector">Sector</SortButton>
              </th>
              <th className="px-4 py-3 text-left">
                <span className="text-sm font-medium text-surface-700">
                  Indicators
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedStocks.map((stock, index) => (
              <StockRow 
                key={stock.Id} 
                stock={stock} 
                index={index}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default StockTable;