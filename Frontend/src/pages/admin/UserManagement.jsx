import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Shield, 
  ShieldOff, 
  Trash2, 
  MoreVertical,
  Mail,
  Calendar
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { numberUtils, dateUtils, errorUtils, userUtils } from '../../utils/helpers';
import { usePaginatedApi } from '../../hooks/useApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  const {
    data: users,
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
  } = usePaginatedApi(adminService.getUsersPaginated);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      
      const response = await adminService.toggleUserStatus(userId);
      
      if (response.success) {
        toast.success(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`);
        refresh();
      }
    } catch (err) {
      toast.error(errorUtils.getErrorMessage(err));
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleToggleUserRole = async (userId, isAdmin) => {
    try {
      setActionLoading(prev => ({ ...prev, [userId]: true }));
      
      const response = await adminService.toggleUserRole(userId);
      
      if (response.success) {
        toast.success(`User role changed to ${isAdmin ? 'User' : 'Admin'}`);
        refresh();
      }
    } catch (err) {
      toast.error(errorUtils.getErrorMessage(err));
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [selectedUser.id]: true }));
      
      const response = await adminService.deleteUser(selectedUser.id);
      
      if (response.success) {
        toast.success('User deleted successfully');
        setShowDeleteModal(false);
        setSelectedUser(null);
        refresh();
      }
    } catch (err) {
      toast.error(errorUtils.getErrorMessage(err));
    } finally {
      setActionLoading(prev => ({ ...prev, [selectedUser.id]: false }));
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const UserCard = ({ user }) => {
    const [showActions, setShowActions] = useState(false);
    const isLoading = actionLoading[user.id];
    const isAdmin = userUtils.isAdmin(user);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">
                {userUtils.getUserInitials(user)}
              </span>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </h3>
                <div className="flex items-center space-x-1">
                  {isAdmin && (
                    <span className="px-2 py-1 text-xs font-medium text-purple-600 bg-purple-100 rounded-full">
                      Admin
                    </span>
                  )}
                  {!user.enabled && (
                    <span className="px-2 py-1 text-xs font-medium text-red-600 bg-red-100 rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                <div className="flex items-center space-x-1">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {dateUtils.getRelativeTime(user.createdAt)}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                <span>URLs: {user.urlCount || 0}</span>
                <span>Clicks: {numberUtils.formatNumber(user.totalClicks || 0)}</span>
              </div>
            </div>
          </div>

          <div className="relative">
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
                    handleToggleUserStatus(user.id, user.enabled);
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {user.enabled ? (
                    <>
                      <UserX className="w-4 h-4 mr-2" />
                      Deactivate User
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4 mr-2" />
                      Activate User
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    handleToggleUserRole(user.id, isAdmin);
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {isAdmin ? (
                    <>
                      <ShieldOff className="w-4 h-4 mr-2" />
                      Revoke Admin
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Make Admin
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setSelectedUser(user);
                    setShowDeleteModal(true);
                    setShowActions(false);
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
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
        {Math.min((currentPage + 1) * 10, totalElements)} of {totalElements} users
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
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
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
              placeholder="Search users by name, email, or username..."
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

      {/* User List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loading size="lg" text="Loading users..." />
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
      ) : filteredUsers.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No users found' : 'No users yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Users will appear here once they register'}
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <UserCard key={user.id} user={user} />
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
        title="Delete User"
        size="sm"
      >
        <Modal.Body>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Delete User</h3>
              <p className="text-sm text-gray-500">This action cannot be undone</p>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete this user? This will also delete all their URLs and analytics data.
          </p>
          
          {selectedUser && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">
                {selectedUser.firstName} {selectedUser.lastName}
              </p>
              <p className="text-sm text-gray-500">{selectedUser.email}</p>
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
            onClick={handleDeleteUser}
            variant="danger"
            loading={selectedUser && actionLoading[selectedUser.id]}
          >
            Delete User
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserManagement;