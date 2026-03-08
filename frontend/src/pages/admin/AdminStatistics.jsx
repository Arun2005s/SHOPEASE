import { useEffect, useState } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const AdminStatistics = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsRes, ordersRes] = await Promise.all([
          api.get('/products'),
          api.get('/orders/all'),
        ]);
        setProducts(productsRes.data || []);
        setOrders(ordersRes.data || []);
      } catch (error) {
        console.error('Error fetching statistics data:', error);
        toast.error('Failed to load statistics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Stock by category
  const stockByCategoryMap = products.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + (p.stock || 0);
    return acc;
  }, {});
  const stockCategories = Object.keys(stockByCategoryMap);
  const stockValues = stockCategories.map((c) => stockByCategoryMap[c]);

  // Orders by status
  const ordersByStatusMap = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  const orderStatuses = Object.keys(ordersByStatusMap);
  const orderStatusCounts = orderStatuses.map((s) => ordersByStatusMap[s]);

  // Revenue by date (YYYY-MM-DD)
  const revenueByDateMap = orders.reduce((acc, o) => {
    const d = o.date ? new Date(o.date) : null;
    if (!d) return acc;
    const key = d.toISOString().slice(0, 10);
    // Skip cancelled orders
    if (o.status === 'cancelled') return acc;
    acc[key] = (acc[key] || 0) + (o.totalAmount || 0);
    return acc;
  }, {});
  const revenueDates = Object.keys(revenueByDateMap).sort();
  const revenueValues = revenueDates.map((d) => revenueByDateMap[d]);

  const stockByCategoryData = {
    labels: stockCategories,
    datasets: [
      {
        label: 'Stock Quantity',
        data: stockValues,
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(220, 38, 38, 1)',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const ordersByStatusData = {
    labels: orderStatuses.map(
      (s) => s.charAt(0).toUpperCase() + s.slice(1)
    ),
    datasets: [
      {
        label: 'Orders',
        data: orderStatusCounts,
        backgroundColor: [
          '#22c55e',
          '#eab308',
          '#3b82f6',
          '#f97316',
          '#ef4444',
        ],
        borderWidth: 1,
      },
    ],
  };

  const revenueOverTimeData = {
    labels: revenueDates,
    datasets: [
      {
        label: 'Revenue (₹)',
        data: revenueValues,
        fill: false,
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold gradient-text">
            Statistics
          </h1>
          <p className="text-gray-600 mt-1">
            Visual overview of stock levels and order performance.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gradient-to-r from-gray-200 to-gray-300 h-64 rounded-2xl animate-pulse shimmer"
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Stock by Category */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Stock by Category
              </h2>
              <span className="text-xs text-gray-500">
                Total products: {products.length}
              </span>
            </div>
            {stockCategories.length === 0 ? (
              <p className="text-gray-500 text-sm">No product data available.</p>
            ) : (
              <Bar
                data={stockByCategoryData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            )}
          </div>

          {/* Orders by Status */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Orders by Status
              </h2>
              <span className="text-xs text-gray-500">
                Total orders: {orders.length}
              </span>
            </div>
            {orderStatuses.length === 0 ? (
              <p className="text-gray-500 text-sm">No order data available.</p>
            ) : (
              <Pie
                data={ordersByStatusData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            )}
          </div>

          {/* Revenue over Time */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-4 sm:p-6 xl:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">
                Revenue Over Time
              </h2>
              <span className="text-xs text-gray-500">
                Days: {revenueDates.length}
              </span>
            </div>
            {revenueDates.length === 0 ? (
              <p className="text-gray-500 text-sm">No revenue data available.</p>
            ) : (
              <Line
                data={revenueOverTimeData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'bottom',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStatistics;

