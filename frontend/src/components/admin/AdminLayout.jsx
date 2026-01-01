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
    <div className="min-h-screen bg-gray-100">
      {/* Admin Navbar */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/admin" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary-600">ShopEase</span>
              <span className="text-sm text-gray-600">Admin Panel</span>
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <Link
                to="/"
                className="text-gray-700 hover:text-primary-600 transition"
              >
                View Store
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="flex">
          {/* Sidebar */}
          <aside className="w-64 bg-white rounded-lg shadow-md p-4 mr-6">
            <nav className="space-y-2">
              <Link
                to="/admin/dashboard"
                className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded transition"
              >
                Dashboard
              </Link>
              <Link
                to="/admin/products"
                className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded transition"
              >
                Products
              </Link>
              <Link
                to="/admin/orders"
                className="block px-4 py-2 text-gray-700 hover:bg-primary-50 hover:text-primary-600 rounded transition"
              >
                Orders
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;

