import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  ExternalLink, 
  MoreVertical, 
  Eye, 
  BarChart3, 
  Trash2, 
  ToggleLeft, 
  ToggleRight,
  Calendar,
  Clock
} from 'lucide-react';
import { urlService } from '../../services/urlService';
import { SUCCESS_MESSAGES } from '../../utils/constants';
import { urlUtils, dateUtils, numberUtils, errorUtils } from '../../utils/helpers';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Loading from '../ui/Loading';
import Modal from '../ui/Modal';
import toast from 'react-hot-toast';

const UrlList = ({ refreshTrigger }) => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchUrls();
  }, [refreshTrigger]);

  const fetchUrls = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await urlService.getUserUrls();
      
      if (response.success) {
        setUrls(response.data || []);
      }
    } catch (err) {
      const errorMessage = errorUtils.getErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUrl = async (shortUrl) => {
    try {
      await urlUtils.copyToClipboard(shortUrl);
      toast.success('URL copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  const handleToggleStatus = async (urlId, currentStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [urlId]: true }));
      
      const response = await urlService.toggleUrlStatus(urlId);
      
      if (response.success) {
        setUrls(prev => prev.map(url => 
          url.id === urlId 
            ? { ...url, isActive: !currentStatus }
            : url
        ));
        toast.success(`URL ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      }
    } catch (err) {
      toast.error(errorUtils.getErrorMessage(err));
    } finally {
      setActionLoading(prev => ({ ...prev, [urlId]: false }));
    }
  };

  const handleDeleteClick = (url) => {
    setUrlToDelete(url);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!urlToDelete) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [urlToDelete.id]: true }));
      
      const response = await urlService.deleteUrl(urlToDelete.id);
      
      if (response.success) {
        setUrls(prev => prev.filter(url => url.id !== urlToDelete.id));
        toast.success(SUCCESS_MESSAGES.URL_DELETED);
        setShowDeleteModal(false);
        setUrlToDelete(null);
      }
    } catch (err) {
      toast.error(errorUtils.getErrorMessage(err));
    } finally {
      setActionLoading(prev => ({ ...prev, [urlToDelete.id]: false }));
    }
  };

  const UrlCard = ({ url }) => {
    const [showActions, setShowActions] = useState(false);
    const isExpired = dateUtils.isExpired(url.expirationDate);
    const isLoading = actionLoading[url.id];

    return (
      <Card hover className="relative">
        <div className="flex items-start justify-between">
          {/* URL Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {url.title || 'Untitled'}
              </h3>
              <div className="flex items-center space-x-1">
                {!url.isActive && (
                  <span className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                    Inactive
                  </span>
                )}
                {isExpired && (
                  <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                    Expired
                  </span>
                )}
              </div>
            </div>

            {/* Original URL */}
            <div className="mb-3">
              <p className="text-sm text-gray-500 mb-1">Original URL:</p>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-blue-600 truncate flex-1">
                  {urlUtils.shortenForDisplay(url.originalUrl, 60)}
                </p>
                <button
                  onClick={() => window.open(url.originalUrl, '_blank')}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Open original URL"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Short URL */}
            <div className="mb-3">
              <p className="text-sm text-gray-500 mb-1">Short URL:</p>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-mono text-gray-900 flex-1">
                  {url.shortUrl}
                </p>
                <button
                  onClick={() => handleCopyUrl(url.shortUrl)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Copy short URL"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{numberUtils.formatNumber(url.clickCount)} clicks</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Created {dateUtils.getRelativeTime(url.createdAt)}</span>
              </div>
              {url.expirationDate && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    Expires {dateUtils.formatDate(url.expirationDate)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative ml-4">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loading size="sm" />
              ) : (
                <MoreVertical className="w-5 h-5" />
              )}
            </button>

            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <button
                  onClick={() => {
                    // Navigate to analytics page
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </button>
                
                <button
                  onClick={() => {
                    handleToggleStatus(url.id, url.isActive);
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {url.isActive ? (
                    <>
                      <ToggleLeft className="w-4 h-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <ToggleRight className="w-4 h-4 mr-2" />
                      Activate
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    handleDeleteClick(url);
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <Loading size="lg" text="Loading your URLs..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchUrls} variant="outline">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  if (urls.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No URLs created yet
          </h3>
          <p className="text-gray-500 mb-4">
            Create your first short URL to get started
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
              <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Your URLs ({urls.length})
          </h2>
          <Button
            onClick={fetchUrls}
            variant="ghost"
            size="sm"
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {/* URL Cards */}
        <div className="space-y-4">
          {urls.map((url) => (
            <UrlCard key={url.id} url={url} />
          ))}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete URL"
        size="sm"
      >
        <Modal.Body>
          <p className="text-gray-600">
            Are you sure you want to delete this URL? This action cannot be undone.
          </p>
          {urlToDelete && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">
                {urlToDelete.title || 'Untitled'}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {urlToDelete.shortUrl}
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => setShowDeleteModal(false)}
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="danger"
            loading={urlToDelete && actionLoading[urlToDelete.id]}
          >
            Delete URL
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UrlList;