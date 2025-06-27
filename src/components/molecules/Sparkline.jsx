import { LineChart, Line, ResponsiveContainer } from 'recharts';

const Sparkline = ({ data, className = '' }) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Convert price array to chart data format
  const chartData = data.map((price, index) => ({
    index,
    price: price
  }));

  // Determine trend color based on first and last values
  const firstPrice = data[0];
  const lastPrice = data[data.length - 1];
  const isPositive = lastPrice >= firstPrice;
  const strokeColor = isPositive ? '#10b981' : '#ef4444'; // green for positive, red for negative

  return (
    <div className={`w-16 h-8 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="price"
            stroke={strokeColor}
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Sparkline;