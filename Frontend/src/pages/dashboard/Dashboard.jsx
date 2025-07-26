import React, { useState, useEffect } from 'react';
import { Link, BarChart3, Users, Globe, TrendingUp } from 'lucide-react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { numberUtils, errorUtils } from '../../utils/helpers';
import Card from '../../components/ui/Card';
import Loading from '../../components/ui/Loading';
import UrlCreateForm from '../../components/forms/UrlCreateForm';
import UrlList from '../../components/url/UrlList';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getDashboard();
      
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (err) {
      const errorMessage = errorUtils.getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUrlCreated = () => {
    // Trigger refresh of URL list and dashboard stats
    setRefreshTrigger(prev => prev + 1);
    fetchDashboardData();
  };

  const StatCard = ({ title, value, icon: Icon, color = 'blue', trend = null }) => (
    <Card>
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {numberUtils.formatNumber(value)}
          </p>
          {trend && (
            <p className="text-sm text-green-600 flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              {trend}% this week
            </p>
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
        <Loading size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="text-blue-600 hover:text-blue-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.firstName || user?.username}!
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your shortened URLs and track their performance.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total URLs"
            value={dashboardData.totalUrls || 0}
            icon={Link}
            color="blue"
          />
          <StatCard
            title="Total Clicks"
            value={dashboardData.totalClicks || 0}
            icon={BarChart3}
            color="green"
            trend={((dashboardData.thisWeekClicks / dashboardData.totalClicks) * 100).toFixed(1)}
          />
          <StatCard
            title="This Month"
            value={dashboardData.thisMonthClicks || 0}
            icon={TrendingUp}
            color="purple"
          />
          <StatCard
            title="Today"
            value={dashboardData.todayClicks || 0}
            icon={Globe}
            color="orange"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* URL Creation Form */}
        <div className="lg:col-span-1">
          <UrlCreateForm onUrlCreated={handleUrlCreated} />
        </div>

        {/* URL List */}
        <div className="lg:col-span-2">
          <UrlList refreshTrigger={refreshTrigger} />
        </div>
      </div>

      {/* Recent Activity Section */}
      {dashboardData?.recentUrls && dashboardData.recentUrls.length > 0 && (
        <Card>
          <Card.Header>
            <Card.Title>Recent Activity</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="space-y-4">
              {dashboardData.recentUrls.slice(0, 5).map((url) => (
                <div key={url.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Link className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {url.title || 'Untitled'}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {url.shortUrl}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {numberUtils.formatNumber(url.clickCount)} clicks
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;