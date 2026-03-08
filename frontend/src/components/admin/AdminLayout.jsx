import { useState } from 'react';
import { Outlet, Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationPanel from './NotificationPanel';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    [
      'group flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200',
      'text-sm sm:text-base font-semibold',
      isActive
        ? 'bg-primary-50 text-primary-700 shadow-sm'
        : 'text-gray-700 hover:bg-gray-50 hover:text-primary-700',
    ].join(' ');

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      {/* Admin Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/30 shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-10">
          <div className="h-16 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Mobile: hamburger */}
              <button
                type="button"
                className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open admin menu"
              >
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <Link to="/admin/dashboard" className="flex items-center gap-2">
                <span className="text-2xl font-extrabold gradient-text">ShopEase</span>
                <span className="hidden sm:inline text-sm text-gray-600 font-semibold">Admin Panel</span>
              </Link>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden md:inline text-sm text-gray-700 truncate max-w-[220px]">
                Welcome, <span className="font-semibold">{user?.name}</span>
              </span>

              <NotificationPanel />

              <Link
                to="/"
                className="hidden sm:inline-flex items-center gap-2 px-3 py-2 rounded-xl text-gray-700 hover:text-primary-700 hover:bg-gray-50 transition font-semibold"
              >
                View Store
              </Link>

              <button
                onClick={handleLogout}
                className="btn-primary px-3 py-2 sm:px-4 rounded-xl bg-gradient-to-r from-gray-200 to-gray-100 text-gray-800 hover:from-red-600 hover:to-red-700 hover:text-white font-bold shadow-sm hover:shadow-md transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 w-full">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-6">
          <div className="flex gap-6">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-72 shrink-0">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-4">
                <div className="px-2 pb-3">
                  <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Navigation</div>
                </div>
                <nav className="space-y-2">
                  <NavLink to="/admin/dashboard" className={navLinkClass}>
                    <span className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center group-hover:bg-primary-100 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
                        </svg>
                      </span>
                      Dashboard
                    </span>
                  </NavLink>

                  <NavLink to="/admin/statistics" className={navLinkClass}>
                    <span className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:bg-indigo-100 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 19h16M5 15l3-6 4 8 3-5 4 7"
                          />
                        </svg>
                      </span>
                      Statistics
                    </span>
                  </NavLink>

                  <NavLink to="/admin/products" className={navLinkClass}>
                    <span className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-blue-100 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0H4" />
                        </svg>
                      </span>
                      Products
                    </span>
                  </NavLink>

                  <NavLink to="/admin/orders" className={navLinkClass}>
                    <span className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-amber-100 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h4M9 17H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v4M9 17h6a2 2 0 002-2v-2" />
                        </svg>
                      </span>
                      Orders
                    </span>
                  </NavLink>

                  <NavLink to="/admin/coupons" className={navLinkClass}>
                    <span className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-100 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v2m0 0v6a2 2 0 002 2h2m-4-8h4m6-4h2a2 2 0 012 2v2m0 0v6a2 2 0 01-2 2h-2m4-8h-4" />
                        </svg>
                      </span>
                      Coupons
                    </span>
                  </NavLink>

                  <NavLink to="/admin/reports" className={navLinkClass}>
                    <span className="flex items-center gap-3">
                      <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-100 transition">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6h6v6m-9 4h12a2 2 0 002-2V7a2 2 0 00-2-2h-3.586a1 1 0 01-.707-.293L12.414 3.293A1 1 0 0011.707 3H9a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </span>
                      Reports
                    </span>
                  </NavLink>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">
              <Outlet />
            </main>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Drawer */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeSidebar}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 w-[85%] max-w-sm bg-white shadow-2xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold gradient-text">ShopEase</span>
                <span className="text-xs font-bold text-gray-500">ADMIN</span>
              </div>
              <button
                type="button"
                className="p-2 rounded-xl hover:bg-gray-100 transition"
                onClick={closeSidebar}
                aria-label="Close admin menu"
              >
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4 p-3 rounded-2xl bg-gray-50">
              <div className="text-xs text-gray-500">Signed in as</div>
              <div className="font-bold text-gray-800 truncate">{user?.name}</div>
            </div>

            <nav className="space-y-2">
              <NavLink to="/admin/dashboard" className={navLinkClass} onClick={closeSidebar}>
                <span className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-primary-50 text-primary-700 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" />
                    </svg>
                  </span>
                  Dashboard
                </span>
              </NavLink>
              <NavLink to="/admin/statistics" className={navLinkClass} onClick={closeSidebar}>
                <span className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 19h16M5 15l3-6 4 8 3-5 4 7"
                      />
                    </svg>
                  </span>
                  Statistics
                </span>
              </NavLink>
              <NavLink to="/admin/products" className={navLinkClass} onClick={closeSidebar}>
                <span className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V7a2 2 0 00-2-2H6a2 2 0 00-2 2v6m16 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6m16 0H4" />
                    </svg>
                  </span>
                  Products
                </span>
              </NavLink>
              <NavLink to="/admin/orders" className={navLinkClass} onClick={closeSidebar}>
                <span className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h4M9 17H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v4M9 17h6a2 2 0 002-2v-2" />
                    </svg>
                  </span>
                  Orders
                </span>
              </NavLink>

              <NavLink to="/admin/reports" className={navLinkClass} onClick={closeSidebar}>
                <span className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6h6v6m-9 4h12a2 2 0 002-2V7a2 2 0 00-2-2h-3.586a1 1 0 01-.707-.293L12.414 3.293A1 1 0 0011.707 3H9a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </span>
                  Reports
                </span>
              </NavLink>
              <NavLink to="/admin/coupons" className={navLinkClass} onClick={closeSidebar}>
                <span className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v2m0 0v6a2 2 0 002 2h2m-4-8h4m6-4h2a2 2 0 012 2v2m0 0v6a2 2 0 01-2 2h-2m4-8h-4" />
                    </svg>
                  </span>
                  Coupons
                </span>
              </NavLink>
            </nav>

            <div className="mt-6 flex gap-3">
              <Link
                to="/"
                onClick={closeSidebar}
                className="flex-1 text-center px-4 py-2.5 rounded-xl bg-gray-100 text-gray-800 font-bold hover:bg-gray-200 transition"
              >
                View Store
              </Link>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-extrabold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;

