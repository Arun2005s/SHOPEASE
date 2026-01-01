import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const capturePayment = async () => {
      try {
        const orderId = sessionStorage.getItem('paypal_orderId');
        const productsJson = sessionStorage.getItem('paypal_products');

        if (!orderId || !productsJson) {
          toast.error('Payment information not found');
          navigate('/cart');
          return;
        }

        const products = JSON.parse(productsJson);

        // Capture the PayPal order
        const response = await api.post('/payment/capture-order', {
          orderId,
          products,
        });

        if (response.data.success) {
          // Clear session storage
          sessionStorage.removeItem('paypal_orderId');
          sessionStorage.removeItem('paypal_products');

          // Clear cart
          clearCart();

          toast.success('Payment successful! Order placed.');
          navigate('/orders');
        }
      } catch (error) {
        console.error('Payment capture error:', error);
        const message = error.response?.data?.message || 'Failed to process payment';
        toast.error(message);
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };

    // Check if user approved the payment
    const token = searchParams.get('token');
    if (token) {
      capturePayment();
    } else {
      // Payment was cancelled
      toast.info('Payment was cancelled');
      sessionStorage.removeItem('paypal_orderId');
      sessionStorage.removeItem('paypal_products');
      navigate('/cart');
    }
  }, [searchParams, navigate, clearCart, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default PaymentSuccess;

