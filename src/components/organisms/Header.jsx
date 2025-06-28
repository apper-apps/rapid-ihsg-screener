import { motion } from "framer-motion";
import React, { useContext } from "react";
import { useSelector } from "react-redux";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import { AuthContext } from "@/App";

function Header({ onExport, resultsCount, totalCount, loading }) {
  const { user } = useSelector((state) => state.user);
  const { logout } = useContext(AuthContext);
  
  const handleLogout = () => {
    logout();
  };

  const ihsgValue = 7245.73;
  const ihsgChange = 0.45;
  const ihsgChangePercent = 0.62;

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-surface-200 px-6 py-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary-dark rounded-lg flex items-center justify-center">
              <ApperIcon name="TrendingUp" className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-heading font-bold text-surface-900">
                IHSG Screener
              </h1>
              <p className="text-sm text-surface-600">Real-time stock analysis</p>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4 pl-6 border-l border-surface-200">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-surface-700">IHSG:</span>
              <span className="font-mono font-bold text-surface-900">
                {ihsgValue.toLocaleString()}
              </span>
              <div className={`flex items-center space-x-1 ${
                ihsgChange >= 0 ? 'text-accent' : 'text-secondary'
              }`}>
                <ApperIcon 
                  name={ihsgChange >= 0 ? 'TrendingUp' : 'TrendingDown'} 
                  size={14} 
                />
                <span className="text-sm font-mono">
                  {ihsgChange >= 0 ? '+' : ''}{ihsgChange} ({ihsgChangePercent}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4 text-sm text-surface-600">
            <span>
              Showing {resultsCount?.toLocaleString() || 0} of {totalCount?.toLocaleString() || 0} stocks
            </span>
            {loading && (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                <span>Loading...</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {user && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-surface-50 rounded-lg">
                <ApperIcon name="User" size={16} className="text-surface-600" />
                <span className="text-sm text-surface-700">
                  {user.firstName || user.name || 'User'}
                </span>
              </div>
            )}
            
            <Button
              variant="secondary"
              size="sm"
              icon="Download"
              onClick={onExport}
              disabled={!resultsCount || resultsCount === 0}
            >
              Export CSV
            </Button>

            <Button
              variant="ghost"
              size="sm"
              icon="LogOut"
              onClick={handleLogout}
              title="Logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
);
}

export default Header;