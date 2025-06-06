import { useEffect, useState, useCallback, useRef } from "react";
import {
  Users,
  Clock,
  Activity,
  TrendingUp,
  Building2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Send,
  MessageCircle,
  X,
  Minimize2
} from "lucide-react";
import echo from "../../services/echo";
import { useToast } from "../../contexts/ToastContext";
import convertUTCToTimeZone from "../../utils/convertUTCToTimeZone";

const Dashboard = ({axiosInstance, profile}) => {
  const showToast = useToast();

  // Dashboard data states
  const [dashboardData, setDashboardData] = useState({
    todayStats: {
      totalPatients: 0,
      waitingPatients: 0,
      inProgressPatients: 0,
      completedPatients: 0
    },
    departmentStats: [],
    recentActivity: [],
    systemAlerts: []
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chat states (keeping existing functionality)
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch dashboard data from API
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [statsResponse, departmentsResponse, activityResponse] = await Promise.all([
        axiosInstance.get('/dashboard/stats'),
        axiosInstance.get('/departments/stats'),
        axiosInstance.get('/dashboard/recent-activity')
      ]);

      setDashboardData({
        todayStats: statsResponse.data.todayStats || {
          totalPatients: 0,
          waitingPatients: 0,
          inProgressPatients: 0,
          completedPatients: 0
        },
        departmentStats: departmentsResponse.data || [],
        recentActivity: activityResponse.data || [],
        systemAlerts: statsResponse.data.alerts || []
      });

      showToast({
        severity: "success",
        summary: "Dashboard Updated",
        detail: "Dashboard data loaded successfully",
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
      showToast({
        severity: "error",
        summary: "Error",
        detail: "Failed to load dashboard data",
      });
    } finally {
      setIsLoading(false);
    }
  }, [axiosInstance, showToast]);

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time updates
    console.log("Echo connected:", echo.connector.socket);
    console.log("Subscribed Channels:", echo.connector.channels);

    const channel = echo.channel("cms_chat");

    channel.listen(".MessageSent", (e) => {
      console.log("📩 Received (Short Name):", e);
      setMessages((prev) => [...prev, e.message]);

      // Increment unread count if chat is not open or minimized
      if (!showChat || isMinimized) {
        setUnreadCount(prev => prev + 1);
      }
    });

    // Set up periodic refresh every 60 seconds for real-time updates
    // const refreshInterval = setInterval(() => {
    //   fetchDashboardData();
    // }, 60000); // Refresh every 60 seconds

    return () => {
      echo.leaveChannel("cms_chat");
    };
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Mark messages as read when chat is opened
  useEffect(() => {
    if (showChat && !isMinimized) {
      setUnreadCount(0);
    }
  }, [showChat, isMinimized]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      await axiosInstance.post('/messages', { message: newMessage });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle opening chat and marking messages as read
  const handleChatToggle = () => {
    setShowChat(!showChat);
    if (!showChat) {
      // Opening chat - mark all messages as read
      setUnreadCount(0);
      setIsMinimized(false);
    }
  };

  // Handle minimizing chat
  const handleChatMinimize = () => {
    setIsMinimized(true);
    setShowChat(false);
  };

  // Handle closing chat completely
  const handleChatClose = () => {
    setShowChat(false);
    setIsMinimized(false);
    setUnreadCount(0);
  };

  // Helper function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in-progress':
        return 'text-blue-600 bg-blue-100';
      case 'waiting':
        return 'text-yellow-600 bg-yellow-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // Stats card component
  const StatsCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  // Department card component
  const DepartmentCard = ({ department }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <h4 className="font-medium text-gray-900">{department.name}</h4>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          department.current_patients > 10 ? 'bg-red-100 text-red-800' :
          department.current_patients > 5 ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {department.current_patients || 0} patients
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center">
          <p className="text-gray-500">Waiting</p>
          <p className="font-semibold text-yellow-600">{department.waiting_patients || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Active</p>
          <p className="font-semibold text-blue-600">{department.active_patients || 0}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-500">Completed</p>
          <p className="font-semibold text-green-600">{department.completed_today || 0}</p>
        </div>
      </div>
    </div>
  );

  // Chat bubble component
  const ChatBubble = ({ message, isCurrentUser }) => {
    // Handle both old format (string) and new format (object)
    const messageText = typeof message === 'string' ? message : (message.text || message);
    const messageUser = typeof message === 'object' ? (message.user || 'User') : 'User';
    const messageTime = typeof message === 'object' && message.timestamp
      ? convertUTCToTimeZone(message.timestamp, "hh:mm A")
      : 'Now';

    const bubbleClass = isCurrentUser
      ? "ml-auto bg-blue-500 text-white"
      : "mr-auto bg-white border border-gray-200";

    const containerClass = isCurrentUser
      ? "flex justify-end"
      : "flex justify-start";

    return (
      <div className={`${containerClass} mb-3`}>
        <div className={`max-w-[200px] px-3 py-2 rounded-lg shadow-sm ${bubbleClass}`}>
          {!isCurrentUser && (
            <p className="text-xs font-medium text-gray-600 mb-1">{messageUser}</p>
          )}
          <p className={`text-sm ${isCurrentUser ? 'text-white' : 'text-gray-800'}`}>
            {messageText}
          </p>
          <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {messageTime}
          </p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Dashboard Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Today's Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Patients Today"
          value={dashboardData.todayStats.totalPatients}
          icon={Users}
          color="text-blue-600"
          subtitle="All patients registered today"
        />
        <StatsCard
          title="Currently Waiting"
          value={dashboardData.todayStats.waitingPatients}
          icon={Clock}
          color="text-yellow-600"
          subtitle="Patients in queue"
        />
        <StatsCard
          title="In Progress"
          value={dashboardData.todayStats.inProgressPatients}
          icon={Activity}
          color="text-blue-600"
          subtitle="Active consultations"
        />
        <StatsCard
          title="Completed Today"
          value={dashboardData.todayStats.completedPatients}
          icon={CheckCircle}
          color="text-green-600"
          subtitle="Finished consultations"
        />
      </div>

      {/* System Alerts */}
      {dashboardData.systemAlerts && dashboardData.systemAlerts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-sm font-medium text-yellow-800">System Alerts</h3>
          </div>
          <div className="mt-2 space-y-1">
            {dashboardData.systemAlerts.map((alert, index) => (
              <p key={index} className="text-sm text-yellow-700">• {alert.message}</p>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Department Overview</h2>
              <Building2 className="h-5 w-5 text-gray-400" />
            </div>
            {dashboardData.departmentStats.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dashboardData.departmentStats.slice(0, 6).map((department) => (
                  <DepartmentCard key={department.id} department={department} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>No department data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
              <TrendingUp className="h-5 w-5 text-gray-400" />
            </div>
            {dashboardData.recentActivity.length > 0 ? (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {dashboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`p-1 rounded-full ${getStatusColor(activity.type)}`}>
                      {activity.type === 'completed' ? <CheckCircle className="h-3 w-3" /> :
                       activity.type === 'cancelled' ? <XCircle className="h-3 w-3" /> :
                       <Clock className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.patient_name}</p>
                      <p className="text-xs text-gray-500">{activity.department}</p>
                      <p className="text-xs text-gray-400">
                        {convertUTCToTimeZone(activity.timestamp, "hh:mm A")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-4 right-4 z-50">
        {/* Chat Toggle Button */}
        {!showChat && (
          <button
            onClick={handleChatToggle}
            className="relative bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
            title="Open Team Chat"
          >
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        )}

        {/* Chat Window */}
        {showChat && (
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 h-96 flex flex-col">
            {/* Chat Header */}
            <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
              <h3 className="font-semibold">Team Chat</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleChatMinimize}
                  className="text-blue-100 hover:text-white transition-colors"
                  title="Minimize"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleChatClose}
                  className="text-blue-100 hover:text-white transition-colors"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-grow overflow-y-auto p-3 bg-gray-50">
              {messages.length === 0 && (
                <p className="text-center text-gray-500 text-sm">No messages yet. Start a conversation!</p>
              )}
              {messages.map((msg, index) => {
                // Determine if this is the current user's message
                const isCurrentUser = typeof msg === 'object'
                  ? (msg.isCurrentUser || msg.user === profile?.name)
                  : false; // For old string format, assume it's from others

                return (
                  <ChatBubble
                    key={index}
                    message={msg}
                    isCurrentUser={isCurrentUser}
                  />
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="flex items-center p-3 border-t border-gray-200 bg-white rounded-b-lg">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mr-2"
                aria-label="Chat message input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(e);
                  }
                }}
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 p-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                disabled={!newMessage.trim()}
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;