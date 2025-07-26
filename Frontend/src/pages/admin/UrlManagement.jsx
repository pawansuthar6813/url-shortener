import React, { useState, useEffect } from 'react';
import { 
  Link, 
  Search, 
  Filter, 
  ExternalLink, 
  Copy, 
  ToggleLeft, 
  ToggleRight, 
  Trash2, 
  MoreVertical,
  Eye,
  Calendar,
  Clock,
  User
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { urlUtils, dateUtils, numberUtils, errorUtils } from '../../utils/helpers';
import { usePaginatedApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const UrlManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUrl, setSelectedUrl] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const {
    data: urls,
    currentPage,
    totalPages,
    totalElements,
    loading,
    error,
    fetchData,
    nextPage,
    prevPage,
    goToPage,
    refresh
  } = usePaginatedApi(adminService.getAllUrls);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopyUrl = async (shortUrl) => {
    try {
      await urlUtils.copyToClipboard(shortUrl);
      toast.success('URL copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy URL');
    }
  };

  const handleToggleUrlStatus = async (urlId, currentStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [urlId]: true }));
      
      const response = await adminService.toggleUrlStatus(urlId);
      
      if (response.success) {
        toast.success(`URL ${currentStatus ? 'deactivated' : 'activated'} successfully`);
        refresh();
      }
    } catch (err) {
      toast.error(errorUtils.getErrorMessage(err));
    } finally {
      setActionLoading(prev => ({ ...prev, [urlId]: false }));
    }
  };

  const handleDeleteUrl = async () => {
    if (!selectedUrl) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [selectedUrl.id]: true }));
      
      const response = await adminService.deleteUrl(selectedUrl.id);
      
      if (response.success) {
        toast.success('URL deleted successfully');
        setShowDeleteModal(false);
        setSelectedUrl(null);
        refresh();
      }
    } catch (err) {
      toast.error(errorUtils.getErrorMessage(err));
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedUrl.id]: false }));
    }
  };

  const filteredUrls = urls.filter(url =>
    url.originalUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.shortCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.createdBy?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const UrlCard = ({ url }) => {
    const [showActions, setShowActions] = useState(false);
    const isLoading = actionLoading[url.id];
    const isExpired = dateUtils.isExpired(url.expirationDate);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Header */}
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

            {/* URLs */}
            <div className="space-y-2 mb-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Original URL:</p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-blue-600 truncate flex-1">
                    {urlUtils.shortenForDisplay(url.originalUrl, 80)}
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

              <div>
                <p className="text-xs text-gray-500 mb-1">Short URL:</p>
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
            </div>

            {/* Meta Info */}
            <div className="flex items-center flex-wrap gap-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{numberUtils.formatNumber(url.clickCount)} clicks</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-3 h-3" />
                <span>By {url.createdBy}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>Created {dateUtils.getRelativeTime(url.createdAt)}</span>
              </div>
              {url.expirationDate && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Expires {dateUtils.formatDate(url.expirationDate)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
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
                    handleToggleUrlStatus(url.id, url.isActive);
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {url.isActive ? (
                    <>
                      <ToggleLeft className="w-4 h-4 mr-2" />
                      Deactivate URL
                    </>
                  ) : (
                    <>
                      <ToggleRight className="w-4 h-4 mr-2" />
                      Activate URL
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setSelectedUrl(url);
                    setShowDeleteModal(true);
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete URL
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const Pagination = () => (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-700">
        Showing {Math.min((currentPage * 10) + 1, totalElements)} to{' '}
        {Math.min((currentPage + 1) * 10, totalElements)} of {totalElements} URLs
      </p>
      <div className="flex items-center space-x-2">
        <Button
          onClick={prevPage}
          disabled={currentPage === 0}
          variant="outline"
          size="sm"
        >
          Previous
        </Button>
        <span className="text-sm text-gray-600">
          Page {currentPage + 1} of {totalPages}
        </span>
        <Button
          onClick={nextPage}
          disabled={currentPage >= totalPages - 1}
          variant="outline"
          size="sm"
        >
          Next
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">URL Management</h1>
          <p className="text-gray-600 mt-1">Manage all shortened URLs in the system</p>
        </div>
        <Button onClick={refresh} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search URLs by title, original URL, short code, or creator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm" className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </Button>
        </div>
      </Card>

      {/* URL List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loading size="lg" text="Loading URLs..." />
        </div>
      ) : error ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refresh} variant="outline">
              Try Again
            </Button>
          </div>
        </Card>
      ) : filteredUrls.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Link className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No URLs found' : 'No URLs yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'URLs will appear here once users create them'}
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {filteredUrls.map((url) => (
              <UrlCard key={url.id} url={url} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <Card>
              <Pagination />
            </Card>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete URL"
        size="sm"
      >
        <Modal.Body>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Delete URL</h3>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this URL? This will also delete all associated analytics data.
          </p>
          
          {selectedUrl && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">
                {selectedUrl.title || 'Untitled'}
              </p>
              <p className="text-sm text-gray-500 truncate">{selectedUrl.shortUrl}</p>
              <p className="text-xs text-gray-400 mt-1">
                {numberUtils.formatNumber(selectedUrl.clickCount)} clicks
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
            onClick={handleDeleteUrl}
            variant="danger"
            loading={selectedUrl && actionLoading[selectedUrl.id]}
          >
            Delete URL
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UrlManagement;