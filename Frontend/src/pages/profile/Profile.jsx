import React, { useState, useEffect } from 'react';
import { User, Mail, Calendar, Shield, Key, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { SUCCESS_MESSAGES } from '../../utils/constants';
import { validationUtils, errorUtils, dateUtils, userUtils } from '../../utils/helpers';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        username: user.username || '',
      });
    }
  }, [user]);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (profileErrors[name]) {
      setProfileErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateProfile = () => {
    const errors = {};

    if (!profileData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!profileData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!profileData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validationUtils.validateEmail(profileData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (!validationUtils.validatePassword(passwordData.newPassword)) {
      errors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!passwordData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateProfile()) {
      return;
    }

    try {
      setIsUpdatingProfile(true);
      
      const response = await userService.updateProfile(profileData);
      
      if (response.success) {
        updateUser(response.data);
        toast.success(SUCCESS_MESSAGES.PROFILE_UPDATED);
      }
    } catch (err) {
      const validationErrors = errorUtils.getValidationErrors(err);
      if (Object.keys(validationErrors).length > 0) {
        setProfileErrors(validationErrors);
      } else {
        toast.error(err.message || 'Failed to update profile');
      }
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePassword()) {
      return;
    }

    try {
      setIsChangingPassword(true);
      
      const response = await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      
      if (response.success) {
        toast.success(SUCCESS_MESSAGES.PASSWORD_CHANGED);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowPasswordModal(false);
      }
    } catch (err) {
      const validationErrors = errorUtils.getValidationErrors(err);
      if (Object.keys(validationErrors).length > 0) {
        setPasswordErrors(validationErrors);
      } else {
        toast.error(err.message || 'Failed to change password');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">
              {userUtils.getUserInitials(user)}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
            <p className="text-gray-600">Manage your account information and security</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Information */}
        <div className="lg:col-span-2">
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Personal Information</span>
              </Card.Title>
            </Card.Header>

            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleProfileChange}
                  error={profileErrors.firstName}
                  required
                />
                <Input
                  label="Last Name"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleProfileChange}
                  error={profileErrors.lastName}
                  required
                />
              </div>

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={profileData.email}
                onChange={handleProfileChange}
                error={profileErrors.email}
                required
              />

              <Input
                label="Username"
                name="username"
                value={profileData.username}
                disabled
                helperText="Username cannot be changed"
              />

              <Button
                type="submit"
                variant="primary"
                loading={isUpdatingProfile}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Update Profile</span>
              </Button>
            </form>
          </Card>
        </div>

        {/* Account Information */}
        <div className="space-y-6">
          {/* Account Details */}
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>Account Details</span>
              </Card.Title>
            </Card.Header>
            <Card.Content className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Account Type</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    userUtils.isAdmin(user) 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {userUtils.isAdmin(user) ? 'Admin' : 'User'}
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Member Since</p>
                <p className="text-sm text-gray-900">
                  {dateUtils.formatDate(user?.createdAt)}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-600">Status</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-900">Active</span>
                </div>
              </div>
            </Card.Content>
          </Card>

          {/* Security */}
          <Card>
            <Card.Header>
              <Card.Title className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-red-600" />
                <span>Security</span>
              </Card.Title>
            </Card.Header>
            <Card.Content>
              <Button
                onClick={() => setShowPasswordModal(true)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                Change Password
              </Button>
            </Card.Content>
          </Card>
        </div>
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        size="md"
      >
        <form onSubmit={handlePasswordSubmit}>
          <Modal.Body className="space-y-4">
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.currentPassword}
              required
            />
            
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.newPassword}
              required
              helperText="At least 6 characters"
            />
            
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.confirmPassword}
              required
            />
          </Modal.Body>
          
          <Modal.Footer>
            <Button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isChangingPassword}
            >
              Change Password
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;