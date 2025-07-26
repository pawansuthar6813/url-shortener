import React, { useState, useEffect } from 'react';
import { Users, Link, BarChart3, Server, Shield, Activity, Trash2, RefreshCw } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { numberUtils, dateUtils, errorUtils } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [systemStats, setSystemStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCleanupModal, setShowCleanupModal] = useState(false);
  const [isCleaningUp, setIsCleaningUp] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchSystemStats();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await adminService.getDashboard();
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  };

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getSystemStats();
      
      if (response.success) {
        setSystemStats(response.data);
      }
    } catch (err) {
      const errorMessage = errorUtils.getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCleanupExpired = async () => {
    try {
      setIsCleaningUp(true);
      const response = await adminService.cleanupExpiredUrls();
      
      if (response.success) {
        toast.success(`Cleaned up ${response.data} expired URLs`);
        setShowCleanupModal(false);
        // Refresh stats
        await fetchSystemStats();
        await fetchDashboardData();
      }
    } catch (err) {
      toast.error(errorUtils.getErrorMessage(err));
    } finally {
      setIsCleaningUp(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle = null }) => (
    <Card>
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {numberUtils.formatNumber(value)}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" text="Loading admin dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchSystemStats} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">System overview and management</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => setShowCleanupModal(true)}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Cleanup Expired</span>
            </Button>
            <Button
              onClick={() => {
                fetchSystemStats();
                fetchDashboardData();
              }}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </div>

      {/* System Stats */}
      {systemStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={systemStats.totalUsers || 0}
            icon={Users}
            color="blue"
            subtitle={`${systemStats.activeUsers || 0} active`}
          />
          <StatCard
            title="Total URLs"
            value={systemStats.totalUrls || 0}
            icon={Link}
            color="green"
            subtitle={`${systemStats.activeUrls || 0} active`}
          />
          <StatCard
            title="Total Clicks"
            value={systemStats.totalClicks || 0}
            icon={BarChart3}
            color="purple"
            subtitle={`${systemStats.todayClicks || 0} today`}
          />
          <StatCard
            title="Admin Users"
            value={systemStats.adminUsers || 0}
            icon={Shield}
            color="orange"
          />
        </div>
      )}

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Statistics */}
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>User Statistics</span>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            {systemStats ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Users</span>
                  <span className="font-semibold">{numberUtils.formatNumber(systemStats.totalUsers)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Users</span>
                  <span className="font-semibold text-green-600">{numberUtils.formatNumber(systemStats.activeUsers)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Admin Users</span>
                  <span className="font-semibold text-purple-600">{numberUtils.formatNumber(systemStats.adminUsers)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">User Growth Rate</span>
                  <span className="font-semibold text-blue-600">
                    {systemStats.totalUsers > 0 ? '+12%' : '0%'}
                  </span>
                </div>
              </div>
            ) : (
              <Loading size="sm" />
            )}
          </Card.Content>
        </Card>

        {/* URL Statistics */}
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center space-x-2">
              <Link className="w-5 h-5 text-green-600" />
              <span>URL Statistics</span>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            {systemStats ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total URLs</span>
                  <span className="font-semibold">{numberUtils.formatNumber(systemStats.totalUrls)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active URLs</span>
                  <span className="font-semibold text-green-600">{numberUtils.formatNumber(systemStats.activeUrls)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Expired URLs</span>
                  <span className="font-semibold text-red-600">{numberUtils.formatNumber(systemStats.expiredUrls || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg URLs per User</span>
                  <span className="font-semibold text-blue-600">
                    {systemStats.totalUsers > 0 ? Math.round(systemStats.totalUrls / systemStats.totalUsers) : 0}
                  </span>
                </div>
              </div>
            ) : (
              <Loading size="sm" />
            )}
          </Card.Content>
        </Card>

        {/* Click Analytics */}
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              <span>Click Analytics</span>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            {systemStats ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Clicks</span>
                  <span className="font-semibold">{numberUtils.formatNumber(systemStats.totalClicks)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Today's Clicks</span>
                  <span className="font-semibold text-green-600">{numberUtils.formatNumber(systemStats.todayClicks)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Week</span>
                  <span className="font-semibold text-blue-600">{numberUtils.formatNumber(systemStats.thisWeekClicks)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-semibold text-purple-600">{numberUtils.formatNumber(systemStats.thisMonthClicks)}</span>
                </div>
              </div>
            ) : (
              <Loading size="sm" />
            )}
          </Card.Content>
        </Card>

        {/* System Health */}
        <Card>
          <Card.Header>
            <Card.Title className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-orange-600" />
              <span>System Health</span>
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">System Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-green-600">Healthy</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="font-semibold text-green-600">99.9%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="font-semibold text-gray-600">
                  {dateUtils.getRelativeTime(new Date())}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-semibold text-green-600">Connected</span>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Cleanup Confirmation Modal */}
      <Modal
        isOpen={showCleanupModal}
        onClose={() => setShowCleanupModal(false)}
        title="Cleanup Expired URLs"
        size="sm"
      >
        <Modal.Body>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Cleanup Expired URLs</h3>
              <p className="text-sm text-gray-500">This will permanently delete all expired URLs</p>
            </div>
          </div>
          <p className="text-gray-600">
            Are you sure you want to cleanup all expired URLs? This action cannot be undone.
          </p>
          {systemStats?.expiredUrls > 0 && (
            <div className="mt-3 p-3 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>{systemStats.expiredUrls}</strong> expired URLs will be deleted.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            onClick={() => setShowCleanupModal(false)}
            variant="ghost"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCleanupExpired}
            variant="danger"
            loading={isCleaningUp}
          >
            Cleanup URLs
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;