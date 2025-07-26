import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, Mail } from 'lucide-react';
import { ROUTES } from '../../utils/constants';
import Button from '../../components/ui/Button';

const NotFound = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Simple Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to={ROUTES.HOME} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-gray-900">ShortLink</span>
            </Link>
            
            <div className="flex items-center space-x-3">
              <Link to={ROUTES.LOGIN}>
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to={ROUTES.REGISTER}>
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 404 Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="text-9xl font-bold text-blue-600 mb-4">404</div>
            <div className="w-32 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>

          {/* Error Message */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Sorry, we couldn't find the page you're looking for. 
              The link might be broken or the page may have been moved.
            </p>
            <p className="text-sm text-gray-500">
              Error Code: 404 | Page Not Found
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button
              onClick={() => navigate(ROUTES.HOME)}
              variant="primary"
              size="lg"
              className="w-full sm:w-auto flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Go Home</span>
            </Button>
            
            <Button
              onClick={goBack}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </Button>
          </div>

          {/* Additional Help */}
          <div className="mt-12 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Need Help?
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center space-x-3">
                <Search className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">
                  Try searching for what you're looking for
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Home className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">
                  Visit our homepage to explore available features
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-600">
                  Contact our support team if you need assistance
                </span>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-3">
                Common pages you might be looking for:
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  to={ROUTES.HOME}
                  className="text-xs text-blue-600 hover:text-blue-500 bg-blue-50 px-2 py-1 rounded"
                >
                  Home
                </Link>
                <Link
                  to={ROUTES.LOGIN}
                  className="text-xs text-blue-600 hover:text-blue-500 bg-blue-50 px-2 py-1 rounded"
                >
                  Login
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="text-xs text-blue-600 hover:text-blue-500 bg-blue-50 px-2 py-1 rounded"
                >
                  Register
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simple Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2024 ShortLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NotFound;