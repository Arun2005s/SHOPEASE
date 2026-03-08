import { useEffect, useState } from 'react';
import api from '../../utils/axios';
import toast from 'react-hot-toast';

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minAmount: '',
    expiryDate: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await api.get('/coupons');
      setCoupons(res.data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || !form.discountValue || !form.expiryDate) {
      toast.error('Code, discount value and expiry date are required');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        code: form.code.trim(),
        discountValue: Number(form.discountValue),
        minAmount: form.minAmount ? Number(form.minAmount) : 0,
      };
      await api.post('/coupons', payload);
      toast.success('Coupon created successfully');
      setForm({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minAmount: '',
        expiryDate: '',
      });
      fetchCoupons();
    } catch (error) {
      console.error('Create coupon error:', error);
      toast.error(error.response?.data?.message || 'Failed to create coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      toast.success('Coupon deleted successfully');
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.error('Delete coupon error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const formatDate = (value) => {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold gradient-text">
            Coupons
          </h1>
          <p className="text-gray-600 mt-1">
            Create and manage discount coupons for your customers.
          </p>
        </div>
      </div>

      {/* Create Coupon Form */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-4 sm:p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Create New Coupon</h2>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coupon Code
            </label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={handleChange}
              placeholder="SAVE10"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Get 10% off on orders above ₹500"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Type
            </label>
            <select
              name="discountType"
              value={form.discountType}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat (₹)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Value
            </label>
            <input
              type="number"
              min="0"
              name="discountValue"
              value={form.discountValue}
              onChange={handleChange}
              placeholder={form.discountType === 'percentage' ? '10' : '100'}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Minimum Order Amount (₹)
            </label>
            <input
              type="number"
              min="0"
              name="minAmount"
              value={form.minAmount}
              onChange={handleChange}
              placeholder="500"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiry Date
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formatDate(form.expiryDate)}
              onChange={handleChange}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <div className="md:col-span-2 flex justify-end mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-bold shadow-md hover:shadow-xl disabled:from-gray-300 disabled:to-gray-400"
            >
              {submitting ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </form>
      </div>

      {/* Coupon List */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Existing Coupons</h2>
          <span className="text-sm text-gray-500">
            Total: {coupons.length}
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
        ) : coupons.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No coupons created yet.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-gray-600">
                  <th className="px-3 sm:px-4 py-2 font-semibold">Code</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold">
                    Description
                  </th>
                  <th className="px-3 sm:px-4 py-2 font-semibold">Type</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold">Value</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold">Min Amount</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold">Expiry</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold">Active</th>
                  <th className="px-3 sm:px-4 py-2 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const expired = new Date(c.expiryDate) < new Date();
                  return (
                    <tr
                      key={c._id}
                      className="border-t border-gray-100 hover:bg-gray-50 transition"
                    >
                      <td className="px-3 sm:px-4 py-2 font-bold text-gray-800">
                        {c.code}
                      </td>
                      <td className="px-3 sm:px-4 py-2 text-gray-600 max-w-xs truncate">
                        {c.description}
                      </td>
                      <td className="px-3 sm:px-4 py-2 text-gray-600 capitalize">
                        {c.discountType}
                      </td>
                      <td className="px-3 sm:px-4 py-2 text-gray-800">
                        {c.discountType === 'percentage'
                          ? `${c.discountValue}%`
                          : `₹${c.discountValue}`}
                      </td>
                      <td className="px-3 sm:px-4 py-2 text-gray-800">
                        ₹{c.minAmount || 0}
                      </td>
                      <td className="px-3 sm:px-4 py-2 text-gray-600">
                        {formatDate(c.expiryDate)}
                      </td>
                      <td className="px-3 sm:px-4 py-2">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                            expired || !c.isActive
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {expired || !c.isActive ? 'Expired' : 'Active'}
                        </span>
                      </td>
                      <td className="px-3 sm:px-4 py-2 text-right">
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="px-3 py-1.5 rounded-lg bg-red-50 text-red-700 text-xs font-bold hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;

