import { useEffect, useState } from 'react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter((order) => {
        const orderId = order._id.toLowerCase();
        const search = searchQuery.toLowerCase();
        return orderId.includes(search);
      });
      setFilteredOrders(filtered);
    }
  }, [searchQuery, orders]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/all');
      console.log('Orders fetched:', response.data);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      const message = error.response?.data?.message || 'Failed to fetch orders';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await api.put(`/orders/${orderId}`, { status });
      toast.success('Order status updated successfully');
      fetchOrders();
    } catch (error) {
      console.error('Update order status error:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.errors?.[0]?.msg ||
                          error.message || 
                          'Failed to update order status';
      toast.error(errorMessage);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'packed':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold gradient-text">All Orders</h1>
          <p className="text-gray-600 mt-1">Search orders and update fulfillment status.</p>
        </div>
        <div className="w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm hover:shadow-md bg-white/80 backdrop-blur"
          />
        </div>
      </div>

      {filteredOrders.length === 0 && orders.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg">No orders found matching "{searchQuery}"</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg">No orders found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-6 card-hover">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID: {order._id.slice(-8)}</p>
                  <p className="text-sm text-gray-600">
                    Date: {new Date(order.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Customer: {typeof order.userId === 'object' && order.userId 
                      ? `${order.userId.name} (${order.userId.email})` 
                      : order.userId?.slice(-8) || 'N/A'}
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <span
                    className={`px-3 py-1.5 rounded-full text-sm font-bold ${getStatusColor(order.status)}`}
                  >
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <select
                    value={order.status}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    className="px-3 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white hover:shadow-sm transition"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="packed">Packed</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {order.products.map((item, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl shadow-sm"
                    />
                    <div className="flex-grow min-w-0">
                      <p className="font-bold text-gray-800 truncate">{item.name}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} {item.unit || 'piece'} × ₹{item.price}
                      </p>
                    </div>
                    <p className="font-extrabold text-primary-600">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-xl font-bold text-primary-600">
                  ₹{order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;

