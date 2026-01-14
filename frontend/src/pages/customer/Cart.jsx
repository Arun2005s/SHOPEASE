import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import toast from 'react-hot-toast';
import { useState } from 'react';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    try {
      setLoading(true);

      const orderData = {
        products: cart.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
      };

      // Create Razorpay order
      const response = await api.post('/payment/create-order', orderData);
      const { orderId, amount, currency, key } = response.data;

      if (!window.Razorpay) {
        toast.error('Payment SDK not loaded. Please refresh the page and try again.');
        setLoading(false);
        return;
      }

      const options = {
        key,
        amount,
        currency,
        name: 'ShopEase',
        description: 'Order Payment',
        order_id: orderId,
        handler: async function (paymentResult) {
          try {
            const verifyResponse = await api.post('/payment/verify', {
              razorpay_order_id: paymentResult.razorpay_order_id,
              razorpay_payment_id: paymentResult.razorpay_payment_id,
              razorpay_signature: paymentResult.razorpay_signature,
              products: orderData.products,
            });

            if (verifyResponse.data.success) {
              clearCart();
              toast.success('Payment successful! Order placed.');
              navigate('/orders');
            } else {
              toast.error('Payment verification failed.');
            }
          } catch (verifyError) {
            console.error('Payment verification error:', verifyError);
            const message =
              verifyError.response?.data?.message || 'Failed to verify payment';
            toast.error(message);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: 'ShopEase Customer',
        },
        theme: {
          color: '#dc2626',
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Checkout error:', error);
      const message = error.response?.data?.message || 'Failed to initiate payment';
      toast.error(message);
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center animate-fadeIn">
        <div className="text-8xl mb-6 animate-float">🛒</div>
        <h1 className="text-4xl font-extrabold mb-4 gradient-text">Your Cart is Empty</h1>
        <p className="text-gray-600 text-xl mb-10">Add some products to your cart to get started!</p>
        <Link
          to="/products"
          className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
        >
          Browse Products →
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 animate-fadeIn">
      <h1 className="text-5xl font-extrabold mb-8 text-center gradient-text">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="glass rounded-2xl shadow-2xl p-6 backdrop-blur-lg">
            {cart.map((item, index) => (
              <div
                key={item._id}
                className="flex items-center space-x-6 py-6 border-b border-gray-200 last:border-b-0 group hover:bg-gray-50 rounded-xl px-4 transition-all duration-300"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="image-zoom w-28 h-28 rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-all">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-xl mb-1 text-gray-800 group-hover:text-primary-600 transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-primary-600 font-bold text-lg">₹{item.price} / {item.unit || 'piece'}</p>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3 bg-gray-100 rounded-full p-2">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-10 h-10 bg-white rounded-full shadow-md hover:bg-primary-600 hover:text-white transition-all duration-300 flex items-center justify-center font-bold text-lg hover:scale-110"
                    >
                      −
                    </button>
                    <span className="w-12 text-center font-bold text-lg">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-10 h-10 bg-white rounded-full shadow-md hover:bg-primary-600 hover:text-white transition-all duration-300 flex items-center justify-center font-bold text-lg hover:scale-110"
                    >
                      +
                    </button>
                  </div>
                  <p className="font-bold text-xl w-24 text-right text-primary-600">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button
                    onClick={() => removeFromCart(item._id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 p-3 rounded-full transition-all duration-300 hover:scale-110"
                    title="Remove item"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl shadow-2xl p-8 sticky top-24 backdrop-blur-lg">
            <h2 className="text-3xl font-extrabold mb-6 gradient-text">Order Summary</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-bold">₹{getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">Delivery</span>
                <span className="text-green-600 font-bold">Free 🎉</span>
              </div>
              <div className="border-t-2 border-gray-200 pt-4 flex justify-between font-extrabold text-2xl">
                <span>Total</span>
                <span className="text-primary-600">₹{getCartTotal().toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn-primary w-full py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full hover:from-primary-700 hover:to-primary-800 disabled:from-gray-300 disabled:to-gray-400 transition-all font-bold text-lg shadow-xl disabled:hover:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Proceed to Checkout →'
              )}
            </button>
            {!isAuthenticated && (
              <p className="text-sm text-gray-600 mt-4 text-center bg-yellow-50 p-3 rounded-lg">
                ⚠️ Please login to checkout
              </p>
            )}
            <Link
              to="/products"
              className="block text-center mt-6 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

