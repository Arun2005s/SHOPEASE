import { useEffect, useState } from 'react';
import api from '../../utils/axios';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.totalProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Orders</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Pending Orders</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendingOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm font-medium mb-2">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">₹{stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="flex space-x-4">
          <Link
            to="/admin/products"
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Manage Products
          </Link>
          <Link
            to="/admin/orders"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            View Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

