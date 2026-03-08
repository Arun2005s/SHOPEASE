import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Auto-close mobile menu on route change
  useEffect(() => {
    if (mobileOpen) {
      setMobileOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <nav className="glass shadow-xl sticky top-0 z-50 backdrop-blur-lg border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="text-3xl font-extrabold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent group-hover:from-primary-700 group-hover:to-primary-900 transition-all">
              ShopEase
            </div>
            <span className="text-sm text-gray-600 hidden sm:block">Indian Department Store</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-gray-700 hover:text-primary-600 font-semibold transition-all duration-300 relative group"
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              to="/products"
              className="text-gray-700 hover:text-primary-600 font-semibold transition-all duration-300 relative group"
            >
              Products
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            {isAuthenticated && (
              <Link
                to="/orders"
                className="text-gray-700 hover:text-primary-600 font-semibold transition-all duration-300 relative group"
              >
                My Orders
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className="px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full font-bold hover:from-primary-700 hover:to-primary-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Admin Panel
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link
              to="/cart"
              className="relative p-3 text-gray-700 hover:text-primary-600 transition-all duration-300 hover:bg-primary-50 rounded-full group"
            >
              <svg
                className="w-6 h-6 transform group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              {getCartItemsCount() > 0 && (
                <span className="absolute top-1 right-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse shadow-lg">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-3 rounded-full hover:bg-gray-100 transition"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Open menu"
            >
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-5 py-2 bg-gray-200 text-gray-700 rounded-full hover:bg-red-600 hover:text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden md:inline-flex px-6 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full hover:from-primary-700 hover:to-primary-800 font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 right-0 w-[85%] max-w-sm bg-white shadow-2xl p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="text-xl font-extrabold gradient-text">Menu</div>
              <button
                type="button"
                className="p-2 rounded-xl hover:bg-gray-100 transition"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {isAuthenticated && (
              <div className="mb-4 p-3 rounded-2xl bg-gray-50">
                <div className="text-xs text-gray-500">Signed in as</div>
                <div className="font-bold text-gray-800 truncate">{user?.name}</div>
              </div>
            )}

            <div className="space-y-2">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl font-bold text-gray-800 hover:bg-gray-50 transition"
              >
                Home
              </Link>
              <Link
                to="/products"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl font-bold text-gray-800 hover:bg-gray-50 transition"
              >
                Products
              </Link>
              {isAuthenticated && (
                <Link
                  to="/orders"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl font-bold text-gray-800 hover:bg-gray-50 transition"
                >
                  My Orders
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-xl font-extrabold text-white bg-gradient-to-r from-primary-600 to-primary-700 shadow-md hover:shadow-lg transition"
                >
                  Admin Panel
                </Link>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 text-white font-extrabold shadow-md hover:shadow-lg transition"
                >
                  Login
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-extrabold shadow-md hover:shadow-lg transition"
                >
                  Logout
                </button>
              )}
              <Link
                to="/cart"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center px-4 py-3 rounded-xl bg-gray-100 text-gray-900 font-extrabold hover:bg-gray-200 transition"
              >
                Cart
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

