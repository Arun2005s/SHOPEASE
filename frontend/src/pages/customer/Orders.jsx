import { useEffect, useState } from 'react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      console.log('Orders fetched:', response.data);
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId, status) => {
    if (status === 'delivered') {
      toast.error('Delivered orders cannot be cancelled');
      return;
    }

    if (status === 'cancelled') {
      toast.error('This order is already cancelled');
      return;
    }

    const confirmMessage = status === 'pending' 
      ? 'Are you sure you want to cancel this order?'
      : 'Are you sure you want to cancel this confirmed order?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await api.delete(`/orders/${orderId}`);
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to cancel order';
      toast.error(message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
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
      <div className="container mx-auto px-4 py-12">
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gradient-to-br from-gray-200 to-gray-300 h-48 rounded-2xl animate-pulse shimmer"></div>
          ))}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-fadeIn">
        <div className="text-8xl mb-6 animate-float">📦</div>
        <h1 className="text-4xl font-extrabold mb-4 gradient-text">My Orders</h1>
        <p className="text-gray-600 text-xl">You haven't placed any orders yet.</p>
        <a
          href="/products"
          className="inline-block mt-8 px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
        >
          Start Shopping →
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <h1 className="text-5xl font-extrabold mb-10 text-center gradient-text">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order, index) => (
          <div 
            key={order._id} 
            className="glass rounded-2xl shadow-2xl p-8 backdrop-blur-lg card-hover"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-200">
              <div>
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="text-lg font-bold text-gray-800 font-mono">{order._id.slice(-8).toUpperCase()}</p>
                <p className="text-sm text-gray-500 mt-2">
                  📅 {new Date(order.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {order.products.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center space-x-6 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all group"
                >
                  <div className="image-zoom w-20 h-20 rounded-xl overflow-hidden shadow-lg">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-lg text-gray-800 group-hover:text-primary-600 transition-colors">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Quantity: <span className="font-semibold">{item.quantity}</span> {item.unit || 'piece'} × ₹{item.price}
                    </p>
                  </div>
                  <p className="font-bold text-xl text-primary-600">₹{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <div className="border-t-2 border-gray-200 pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-bold text-xl text-gray-700">Total Amount:</span>
                <span className="text-3xl font-extrabold text-primary-600">
                  ₹{order.totalAmount.toFixed(2)}
                </span>
              </div>
              {/* Delete button - shows for pending and confirmed orders */}
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => handleDeleteOrder(order._id, order.status)}
                    className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-full hover:from-red-700 hover:to-red-800 transition-all font-bold flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <span>Cancel Order</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;

