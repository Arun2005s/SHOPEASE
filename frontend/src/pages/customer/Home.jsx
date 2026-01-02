import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../utils/axios';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const categories = [
  { name: 'Rice', icon: '🌾' },
  { name: 'Pulses', icon: '🫘' },
  { name: 'Oils', icon: '🛢️' },
  { name: 'Snacks', icon: '🍿' },
  { name: 'Beverages', icon: '🥤' },
  { name: 'Spices', icon: '🌶️' },
  { name: 'Dairy', icon: '🥛' },
  { name: 'Household', icon: '🧹' },
];

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await api.get('/products?sort=price-low');
      const products = response.data.slice(0, 8);
      setFeaturedProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      addToCart(product);
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error('Product out of stock');
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white opacity-5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-6xl md:text-7xl font-extrabold mb-6 animate-slideIn">
            Welcome to <span className="text-yellow-300">ShopEase</span>
          </h1>
          <p className="text-2xl md:text-3xl mb-10 font-light animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            Your One-Stop Indian Department Store
          </p>
          <Link
            to="/products"
            className="inline-block bg-white text-primary-600 px-10 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 hover:bg-yellow-50 animate-scaleIn"
            style={{ animationDelay: '0.4s' }}
          >
            Shop Now →
          </Link>
        </div>
      </section>

      {/* Offers Banner */}
      <section className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 py-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-shimmer"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <p className="text-lg md:text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <span className="text-2xl animate-bounce">🎉</span>
            <span>Special Offer: Get 10% off on all products above ₹500! Use code: <span className="bg-white px-3 py-1 rounded-full shadow-lg">SAVE10</span></span>
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to={`/products?category=${category.name}`}
                className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center card-hover transform hover:scale-105"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="text-5xl mb-3 transform group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300">
                  {category.icon}
                </div>
                <div className="font-bold text-gray-700 group-hover:text-primary-600 transition-colors">
                  {category.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 gradient-text">Featured Products</h2>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gradient-to-br from-gray-200 to-gray-300 h-96 rounded-2xl animate-pulse shimmer"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden card-hover group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="image-zoom h-56 overflow-hidden bg-gray-100">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-xl mb-2 text-gray-800 group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-primary-600 font-bold text-2xl mb-3">
                      ₹{product.price} <span className="text-sm text-gray-500 font-normal">/ {product.unit || 'piece'}</span>
                    </p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-semibold px-3 py-1 rounded-full ${
                          product.stock > 0 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {product.stock > 0 ? '✓ In Stock' : '✗ Out of Stock'}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className="btn-primary px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full font-semibold disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed disabled:hover:transform-none"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-block px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
            >
              View All Products →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

