import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const CustomerLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default CustomerLayout;

