
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-20">
        <div className="container-custom text-center">
          <h1 className="text-8xl font-bold text-travel-blue-dark mb-6">404</h1>
          <p className="text-2xl mb-8 text-gray-600">Oops! Page not found</p>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </p>
          <Link to="/" className="btn-primary text-lg">
            Back to Homepage
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
