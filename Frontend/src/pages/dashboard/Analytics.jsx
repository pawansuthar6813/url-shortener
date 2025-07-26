import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, TrendingUp, Globe, Monitor, Smartphone, MapPin } from 'lucide-react';
import { userService } from '../../services/userService';
import { dateUtils, numberUtils, errorUtils } from '../../utils/helpers';
import { CHART_COLORS } from '../../utils/constants';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import toast from 'react-hot-toast';

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userService.getAnalytics(timeRange);
      
      if (response.success) {
        setAnalyticsData(response.data);
      }
    } catch (err) {
      const errorMessage = errorUtils.getErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = (data) => {
    if (!data || typeof data !== 'object') return [];
    
    return Object.entries(data).map(([key, value]) => ({
      name: key,
      value: value,
      count: value
    }));
  };

  const formatDateData = (data) => {
    if (!data || typeof data !== 'object') return [];
    
    return Object.entries(data)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, clicks]) => ({
        date: dateUtils.formatDate(date),
        clicks: clicks
      }));
  };

  const StatCard = ({ title, value, icon: Icon, change, color = 'blue' }) => (
    <Card>
      <div className="flex items-center">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {numberUtils.formatNumber(value)}
          </p>
          {change && (
            <p className={`text-sm flex items-center mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {change >= 0 ? '+' : ''}{change}% vs last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
  );

  const COLORS = [CHART_COLORS.PRIMARY, CHART_COLORS.SECONDARY, CHART_COLORS.WARNING, CHART_COLORS.DANGER, CHART_COLORS.INFO];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loading size="lg" text="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchAnalytics} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const clicksByDate = formatDateData(analyticsData.clicksByDate);
  const clicksByCountry = formatChartData(analyticsData.clicksByCountry);
  const clicksByDevice = formatChartData(analyticsData.clicksByDevice);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600 mt-1">
            Track your URL performance and audience insights
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Clicks"
          value={analyticsData.totalClicks || 0}
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Unique Visitors"
          value={analyticsData.uniqueVisitors || 0}
          icon={Globe}
          color="green"
        />
        <StatCard
          title="Top Country"
          value={clicksByCountry[0]?.name || 'N/A'}
          icon={MapPin}
          color="purple"
        />
        <StatCard
          title="Avg. Daily Clicks"
          value={Math.round((analyticsData.totalClicks || 0) / timeRange)}
          icon={Calendar}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Clicks Over Time */}
        <Card>
          <Card.Header>
            <Card.Title>Clicks Over Time</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={clicksByDate}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke={CHART_COLORS.PRIMARY}
                    strokeWidth={2}
                    dot={{ fill: CHART_COLORS.PRIMARY }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        {/* Top Countries */}
        <Card>
          <Card.Header>
            <Card.Title>Traffic by Country</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={clicksByCountry.slice(0, 5)}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {clicksByCountry.slice(0, 5).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        {/* Device Types */}
        <Card>
          <Card.Header>
            <Card.Title>Device Types</Card.Title>
          </Card.Header>
          <Card.Content>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clicksByDevice}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={CHART_COLORS.SECONDARY} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Content>
        </Card>

        {/* Top URLs */}
        <Card>
          <Card.Header>
            <Card.Title>Top Performing URLs</Card.Title>
          </Card.Header>
          <Card.Content>
            {analyticsData.topUrls && analyticsData.topUrls.length > 0 ? (
              <div className="space-y-4">
                {analyticsData.topUrls.slice(0, 5).map((url, index) => (
                  <div key={url.id} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {url.title || 'Untitled'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {url.shortUrl}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {numberUtils.formatNumber(url.clickCount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No URL data available</p>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;