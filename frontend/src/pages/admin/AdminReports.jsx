import { useEffect, useState } from 'react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const AdminReports = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products for reports:', error);
      toast.error('Failed to load products for reports');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (type) => {
    try {
      const endpoint =
        type === 'products'
          ? '/admin/reports/products'
          : '/admin/reports/purchases';

      const response = await api.get(endpoint, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        type === 'products' ? 'product-stock-report.csv' : 'purchase-report.csv'
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating report:', error);
      const message =
        error.response?.data?.message || 'Failed to generate report';
      toast.error(message);
    }
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold gradient-text">
            Reports
          </h1>
          <p className="text-gray-600 mt-1">
            Generate stock and purchase reports and view current inventory.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => downloadReport('products')}
            className="btn-primary px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold shadow-md hover:shadow-xl transition"
          >
            Generate Product Report
          </button>
          <button
            onClick={() => downloadReport('purchases')}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold shadow-md hover:shadow-xl transition"
          >
            Generate Purchase Report
          </button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Current Stock Overview
          </h2>
          <span className="text-sm text-gray-500">
            Total products: {products.length}
          </span>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-gradient-to-r from-gray-200 to-gray-300 h-10 rounded-xl animate-pulse shimmer"
              ></div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No products found.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600">
                  <th className="px-3 sm:px-4 py-2 font-semibold">Product</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold">Category</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold">Unit</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold">Price (₹)</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold">
                    Remaining Stock
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p._id}
                    className="border-t border-gray-100 hover:bg-gray-50 transition"
                  >
                    <td className="px-3 sm:px-4 py-2 font-semibold text-gray-800">
                      {p.name}
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-gray-600">
                      {p.category}
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-gray-600">
                      {p.unit || 'piece'}
                    </td>
                    <td className="px-3 sm:px-4 py-2 text-gray-800">
                      {p.price}
                    </td>
                    <td className="px-3 sm:px-4 py-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          p.stock === 0
                            ? 'bg-red-100 text-red-700'
                            : p.stock < 10
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReports;

