import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Music,
  Zap,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

interface QueueStats {
  total: number;
  byStatus: {
    [key: string]: {
      count: number;
      avgProcessingTime: number;
    };
  };
  avgProcessingTime: number;
}

interface JobStats {
  totalProcessed: number;
  successCount: number;
  errorCount: number;
  lastRun: string;
  averageProcessingTime: number;
  isRunning: boolean;
  config: {
    batchSize: number;
    processingInterval: string;
    enableAutoGeneration: boolean;
  };
}

interface ProcessingMetrics {
  avgProcessingTime: number;
  minProcessingTime: number;
  maxProcessingTime: number;
  totalProcessed: number;
}

interface QueueOverview {
  queueStats: QueueStats;
  jobStats: JobStats;
  recentItems: any[];
  processingMetrics: ProcessingMetrics;
}

const AILyricsMonitoring: React.FC = () => {
  const [overview, setOverview] = useState<QueueOverview | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    fetchOverview();
    fetchAnalytics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchOverview();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedTab === 'analytics') {
      fetchAnalytics();
    }
  }, [dateRange, selectedTab]);

  const fetchOverview = async () => {
    try {
      const response = await fetch('/api/admin/lyrics/queue/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch overview');
      }

      const data = await response.json();
      setOverview(data.overview);
    } catch (error) {
      console.error('Fetch overview error:', error);
      toast.error('Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const dateFrom = getDateFromRange(dateRange);
      const response = await fetch(`/api/admin/lyrics/queue/analytics?dateFrom=${dateFrom}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Fetch analytics error:', error);
      toast.error('Failed to load analytics data');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchOverview();
    if (selectedTab === 'analytics') {
      await fetchAnalytics();
    }
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const handleTriggerProcessing = async () => {
    try {
      const response = await fetch('/api/admin/lyrics/queue/trigger', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to trigger processing');
      }

      toast.success('Queue processing triggered');
      setTimeout(fetchOverview, 2000);
    } catch (error) {
      console.error('Trigger processing error:', error);
      toast.error('Failed to trigger processing');
    }
  };

  const getDateFromRange = (range: string) => {
    const now = new Date();
    switch (range) {
      case '1d':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load monitoring data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Lyrics Generation Monitoring
            </h1>
            <p className="text-gray-600">
              Monitor and manage the AI lyrics generation system
            </p>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              onClick={handleTriggerProcessing}
              className="bg-green-600 hover:bg-green-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              Trigger Processing
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {/* System Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Queue Status</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.queueStats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Total items in queue
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className={getStatusColor('pending')}>
                    {overview.queueStats.byStatus.pending?.count || 0} Pending
                  </Badge>
                  <Badge className={getStatusColor('processing')}>
                    {overview.queueStats.byStatus.processing?.count || 0} Processing
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overview.jobStats.totalProcessed > 0 
                    ? ((overview.jobStats.successCount / overview.jobStats.totalProcessed) * 100).toFixed(1)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {overview.jobStats.successCount} of {overview.jobStats.totalProcessed} successful
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="bg-green-100 text-green-800">
                    {overview.jobStats.successCount} Success
                  </Badge>
                  <Badge className="bg-red-100 text-red-800">
                    {overview.jobStats.errorCount} Errors
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatDuration(overview.processingMetrics.avgProcessingTime)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Average time per generation
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  Min: {formatDuration(overview.processingMetrics.minProcessingTime)} | 
                  Max: {formatDuration(overview.processingMetrics.maxProcessingTime)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Job Status</CardTitle>
                <div className={`h-3 w-3 rounded-full ${overview.jobStats.isRunning ? 'bg-green-500' : 'bg-red-500'}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {overview.jobStats.isRunning ? 'Running' : 'Stopped'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last run: {overview.jobStats.lastRun ? formatDate(overview.jobStats.lastRun) : 'Never'}
                </p>
                <div className="text-xs text-gray-500 mt-2">
                  Batch size: {overview.jobStats.config.batchSize}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Queue Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overview.recentItems.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.songId?.title || 'Unknown Song'}</p>
                        <p className="text-xs text-gray-500">
                          Artist: {item.artistId?.name || 'Unknown Artist'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Created: {formatDate(item.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Priority: {item.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                  {overview.recentItems.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No recent items</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Queue Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={Object.entries(overview.queueStats.byStatus).map(([status, data]) => ({
                          name: status,
                          value: data.count,
                          color: COLORS[Object.keys(overview.queueStats.byStatus).indexOf(status)]
                        }))}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {Object.entries(overview.queueStats.byStatus).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1d">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Processing Time Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analytics.processingTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <Tooltip 
                          formatter={(value) => [formatDuration(value), 'Avg Processing Time']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="avgProcessingTime" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.statusDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Priority Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.priorityDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Errors</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.errorAnalysis.slice(0, 5).map((error: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-red-800">
                            {error._id}
                          </p>
                        </div>
                        <Badge className="bg-red-100 text-red-800">
                          {error.count} occurrences
                        </Badge>
                      </div>
                    ))}
                    {analytics.errorAnalysis.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No errors in selected period</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <p className="text-sm text-gray-600">
                Current system settings and configuration
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Processing Settings</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Batch Size:</span>
                      <span className="font-medium">{overview.jobStats.config.batchSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Interval:</span>
                      <span className="font-medium">{overview.jobStats.config.processingInterval}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Auto Generation:</span>
                      <span className="font-medium">
                        {overview.jobStats.config.enableAutoGeneration ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">System Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Job Status:</span>
                      <Badge className={overview.jobStats.isRunning ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {overview.jobStats.isRunning ? 'Running' : 'Stopped'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Processed:</span>
                      <span className="font-medium">{overview.jobStats.totalProcessed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-medium">
                        {overview.jobStats.totalProcessed > 0 
                          ? ((overview.jobStats.successCount / overview.jobStats.totalProcessed) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AILyricsMonitoring;