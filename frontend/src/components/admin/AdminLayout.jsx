import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Admin Navbar */}
      <nav className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between h-16 gap-3">
            <Link to="/admin" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary-600">ShopEase</span>
              <span className="text-sm text-gray-600 hidden sm:inline">Admin Panel</span>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:inline text-sm text-gray-700 truncate max-w-[140px]">
                Welcome, {user?.name}
              </span>
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 transition text-sm sm:text-base"
              >
                View Store
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 w-full">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="w-full lg:w-64 bg-white rounded-lg shadow-md p-4">
              <nav className="space-y-2">
                <Link
                  to="/admin/dashboard"
                  className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded transition text-sm sm:text-base"
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/products"
                  className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded transition text-sm sm:text-base"
                >
                  Products
                </Link>
                <Link
                  to="/admin/orders"
                  className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded transition text-sm sm:text-base"
                >
                  Orders
                </Link>
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <div className="w-full overflow-x-auto">
                <Outlet />
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

