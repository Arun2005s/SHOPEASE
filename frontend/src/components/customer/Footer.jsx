const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-auto relative overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="animate-fadeIn">
            <h3 className="text-3xl font-extrabold mb-4 bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
              ShopEase
            </h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              Your trusted Indian department store for all your grocery needs. Quality products, fast delivery, and great prices.
            </p>
          </div>
          <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <h4 className="font-bold text-xl mb-6 text-primary-300">Quick Links</h4>
            <ul className="space-y-3 text-gray-300">
              <li>
                <a href="/products" className="hover:text-primary-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  Products
                </a>
              </li>
              <li>
                <a href="/cart" className="hover:text-primary-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  Shopping Cart
                </a>
              </li>
              <li>
                <a href="/orders" className="hover:text-primary-400 transition-colors duration-300 flex items-center gap-2 group">
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                  My Orders
                </a>
              </li>
            </ul>
          </div>
          <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <h4 className="font-bold text-xl mb-6 text-primary-300">Contact Us</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center gap-3">
                <span className="text-2xl">📧</span>
                <a href="mailto:support@shopease.com" className="hover:text-primary-400 transition-colors">
                  support@shopease.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-2xl">📞</span>
                <a href="tel:+911234567890" className="hover:text-primary-400 transition-colors">
                  +91 1234567890
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            &copy; 2024 <span className="text-primary-400 font-bold">ShopEase</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

