import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  Home,
  Shield,
  UserCog,
  BarChart3,
  Building,
  Bell,
  Settings,
  Search,
  Eye,
  Check,
  X,
  ChevronDown,
  Clock,
  AlertTriangle,
  Info,
} from "lucide-react";

// API service
const API_BASE_URL = "http://localhost:3000/api";

const api = {
  get: async (endpoint: string) => {
    const token = localStorage.getItem("accessToken");
    console.log("Making API call to:", endpoint);
    console.log(
      "Token being used:",
      token ? `${token.substring(0, 20)}...` : "No token"
    );

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Error response:", errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  post: async (endpoint: string, data?: any) => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

// Self-contained Button component
const Button = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  className = "",
  disabled = false,
  ...props
}: any) => {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
    ghost: "hover:bg-gray-100 text-gray-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    blue: "bg-blue-500 text-white hover:bg-blue-600",
    green: "bg-green-500 text-white hover:bg-green-600",
    red: "bg-red-500 text-white hover:bg-red-600",
  };

  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-8 px-3 text-xs rounded-md",
    lg: "h-11 px-8 rounded-md",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

// Self-contained Card components
const Card = ({ children, className = "", ...props }: any) => (
  <div className={`rounded-lg shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

// Helper functions
const getRoleColor = (role: string) => {
  switch (role?.toLowerCase()) {
    case "teacher":
      return "text-blue-600";
    case "staff":
      return "text-green-600";
    case "student":
      return "text-purple-600";
    case "admin":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState("dashboard");
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingVerifications: 0,
    verifiedCount: 0,
    rejectedCount: 0,
  });
  const [verificationQueue, setVerificationQueue] = useState<any[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const menuItems = [
    { name: "Dashboard Home", view: "dashboard", icon: Home },
    { name: "User Verification", view: "verification", icon: UserCheck },
    {
      name: "Finance & Marketing",
      view: "finance",
      icon: DollarSign,
      route: "/marketing-finance",
    },
    { name: "System Access", view: "system", icon: Shield },
    { name: "Employee Management", view: "employees", icon: UserCog },
    { name: "Payroll", view: "payroll", icon: DollarSign },
    { name: "Leave Management", view: "leave", icon: Calendar },
    { name: "Performance Tracking", view: "performance", icon: BarChart3 },
    { name: "Asset Management", view: "assets", icon: Building },
    { name: "Notifications", view: "notifications", icon: Bell },
    { name: "Settings", view: "settings", icon: Settings },
  ];

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Check if user is authenticated
        const token = localStorage.getItem("accessToken");
        console.log("Checking authentication...");
        console.log(
          "Token from localStorage:",
          token ? `${token.substring(0, 20)}...` : "No token found"
        );
        console.log("All localStorage keys:", Object.keys(localStorage));
        console.log("localStorage contents:");
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          const value = localStorage.getItem(key);
          console.log(
            `${key}:`,
            value ? `${value.substring(0, 30)}...` : value
          );
        }

        if (!token) {
          setError("Please log in to access the admin dashboard");
          setLoading(false);
          return;
        }

        // First check if user has admin access by calling /auth/me
        try {
          const userInfo = await api.get("/auth/me");
          console.log("Current user:", userInfo);

          if (userInfo.user?.role?.name !== "admin") {
            setError("Access denied. Admin privileges required.");
            setLoading(false);
            return;
          }
        } catch (authError) {
          console.error("Auth check failed:", authError);
          setError("Authentication failed. Please log in again.");
          setLoading(false);
          return;
        }

        // Fetch verification stats
        const verificationStats = await api.get(
          "/verifications/stats/overview"
        );
        console.log("Verification stats:", verificationStats);

        setStats({
          totalUsers: verificationStats.totalVerifications || 0,
          pendingVerifications: verificationStats.pendingVerifications || 0,
          verifiedCount: verificationStats.verifiedCount || 0,
          rejectedCount: verificationStats.rejectedCount || 0,
        });

        // Fetch pending verifications
        const verifications = await api.get(
          "/verifications?status=pending&limit=10"
        );
        console.log("Pending verifications:", verifications);
        setVerificationQueue(verifications.data || []);

        // Mock data for leave requests and recent activity
        setLeaveRequests([
          {
            id: 1,
            name: "Alice Brown",
            type: "Annual Leave",
            startDate: "2025-09-01",
            endDate: "2025-09-05",
            days: 5,
            status: "pending",
          },
          {
            id: 2,
            name: "Robert Wilson",
            type: "Sick Leave",
            startDate: "2025-08-30",
            endDate: "2025-08-31",
            days: 2,
            status: "pending",
          },
          {
            id: 3,
            name: "Lisa Anderson",
            type: "Personal Leave",
            startDate: "2025-09-15",
            endDate: "2025-09-16",
            days: 2,
            status: "pending",
          },
        ]);

        setRecentActivity([
          {
            id: 1,
            type: "User Verified",
            description: "John Smith (Teacher)",
            time: "2 hours ago",
            icon: Check,
            color: "text-green-600",
            bgColor: "bg-green-100",
          },
          {
            id: 2,
            type: "Leave Approved",
            description: "Maria Garcia (Staff)",
            time: "4 hours ago",
            icon: Calendar,
            color: "text-blue-600",
            bgColor: "bg-blue-100",
          },
          {
            id: 3,
            type: "Payroll Generated",
            description: "Finance Department",
            time: "1 day ago",
            icon: DollarSign,
            color: "text-purple-600",
            bgColor: "bg-purple-100",
          },
          {
            id: 4,
            type: "Role Updated",
            description: "Admin Team",
            time: "1 day ago",
            icon: Shield,
            color: "text-orange-600",
            bgColor: "bg-orange-100",
          },
          {
            id: 5,
            type: "Asset Assigned",
            description: "IT Department",
            time: "2 days ago",
            icon: Building,
            color: "text-teal-600",
            bgColor: "bg-teal-100",
          },
        ]);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle verification approval
  const handleApproveVerification = async (verificationId: number) => {
    try {
      console.log("Approving verification:", verificationId);

      await api.post(`/verifications/approve/${verificationId}`, {
        comments: "Approved by admin",
      });

      // Remove from queue
      setVerificationQueue((prev) =>
        prev.filter((v) => v.id !== verificationId)
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        pendingVerifications: prev.pendingVerifications - 1,
        verifiedCount: prev.verifiedCount + 1,
      }));

      alert("Verification approved successfully!");
    } catch (err) {
      console.error("Error approving verification:", err);
      alert("Failed to approve verification");
    }
  };

  // Handle verification rejection
  const handleRejectVerification = async (verificationId: number) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (!reason) return;

    try {
      console.log("Rejecting verification:", verificationId, "Reason:", reason);

      await api.post(`/verifications/reject/${verificationId}`, {
        comments: reason,
      });

      // Remove from queue
      setVerificationQueue((prev) =>
        prev.filter((v) => v.id !== verificationId)
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        pendingVerifications: prev.pendingVerifications - 1,
        rejectedCount: prev.rejectedCount + 1,
      }));

      alert("Verification rejected successfully!");
    } catch (err) {
      console.error("Error rejecting verification:", err);
      alert("Failed to reject verification");
    }
  };

  // Handle leave request approval
  const handleApproveLeave = (leaveId: number) => {
    setLeaveRequests((prev) => prev.filter((leave) => leave.id !== leaveId));
    // In a real app, you would make an API call here
  };

  // Handle leave request rejection
  const handleRejectLeave = (leaveId: number) => {
    setLeaveRequests((prev) => prev.filter((leave) => leave.id !== leaveId));
    // In a real app, you would make an API call here
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case "teacher":
        return "text-blue-600";
      case "staff":
        return "text-green-600";
      case "student":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-slate-800 text-white flex flex-col z-30">
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-lg">Admin Panel</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => {
                if (item.route) {
                  navigate(item.route);
                } else {
                  setCurrentView(item.view);
                }
              }}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                currentView === item.view
                  ? "bg-slate-700 text-white border-r-2 border-orange-500"
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="text-sm">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content - with left margin to account for fixed sidebar */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Administration & Human Resource Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search employees, records..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    3
                  </span>
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">C</span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">
                    Claude
                  </div>
                  <div className="text-xs text-gray-500">HR Admin</div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-lg text-gray-600">
                Loading dashboard data...
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-red-800">{error}</div>
            </div>
          )}

          {!loading && !error && currentView === "dashboard" && (
            <div className="space-y-6">
              {/* Key Metrics - Aligned Card Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">
                        Total Verifications
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {stats.totalUsers}
                      </p>
                    </div>
                    <div className="bg-blue-600 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <UserCheck className="h-4 w-4 text-blue-200 mr-1" />
                    <span className="text-blue-100">
                      {stats.verifiedCount} verified •{" "}
                      {stats.pendingVerifications} pending
                    </span>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">
                        Pending Verifications
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {stats.pendingVerifications}
                      </p>
                    </div>
                    <div className="bg-orange-600 p-3 rounded-lg">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <Clock className="h-4 w-4 text-orange-200 mr-1" />
                    <span className="text-orange-100">
                      Awaiting admin approval
                    </span>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        Leave Requests
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {leaveRequests.length}
                      </p>
                    </div>
                    <div className="bg-green-600 p-3 rounded-lg">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <AlertTriangle className="h-4 w-4 text-green-200 mr-1" />
                    <span className="text-green-100">
                      5 urgent approvals needed
                    </span>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">
                        Payroll Due
                      </p>
                      <p className="text-2xl font-bold text-white">5 days</p>
                    </div>
                    <div className="bg-purple-600 p-3 rounded-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-purple-200 mr-1" />
                    <span className="text-purple-100">
                      Next cycle: Sep 1, 2025
                    </span>
                  </div>
                </Card>
              </div>

              {/* Main Dashboard Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side - Quick Actions & Department Overview (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Quick Actions Grid */}
                  <Card className="bg-white p-6">
                    <div className="flex items-center space-x-2 mb-6">
                      <Settings className="h-5 w-5 text-blue-500" />
                      <h2 className="text-lg font-semibold text-gray-900">
                        Quick Actions
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        onClick={() => setCurrentView("verification")}
                        className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <UserCheck className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            User Verification
                          </div>
                          <div className="text-sm text-gray-500">
                            {stats.pendingVerifications} pending requests
                          </div>
                        </div>
                      </button>

                      <button className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            Leave Management
                          </div>
                          <div className="text-sm text-gray-500">
                            {leaveRequests.length} pending approvals
                          </div>
                        </div>
                      </button>

                      <button className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <DollarSign className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            Payroll Management
                          </div>
                          <div className="text-sm text-gray-500">
                            5 days until next cycle
                          </div>
                        </div>
                      </button>

                      <button className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                          <Shield className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            Role Management
                          </div>
                          <div className="text-sm text-gray-500">
                            Update permissions
                          </div>
                        </div>
                      </button>

                      <button className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-teal-50 hover:border-teal-300 transition-colors">
                        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                          <Building className="h-6 w-6 text-teal-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            Asset Management
                          </div>
                          <div className="text-sm text-gray-500">
                            Track resources
                          </div>
                        </div>
                      </button>

                      <button className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-colors">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <BarChart3 className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium text-gray-900">
                            Performance Reports
                          </div>
                          <div className="text-sm text-gray-500">
                            View analytics
                          </div>
                        </div>
                      </button>
                    </div>
                  </Card>

                  {/* Department Overview */}
                  <Card className="bg-white p-6">
                    <div className="flex items-center space-x-2 mb-6">
                      <Users className="h-5 w-5 text-gray-600" />
                      <h2 className="text-lg font-semibold text-gray-900">
                        Department Overview
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Users className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                          45
                        </div>
                        <div className="text-sm text-blue-700">
                          Total Employees
                        </div>
                      </div>

                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <UserCheck className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-green-600">
                          38
                        </div>
                        <div className="text-sm text-green-700">
                          Active Staff
                        </div>
                      </div>

                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                        <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Calendar className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-2xl font-bold text-purple-600">
                          7
                        </div>
                        <div className="text-sm text-purple-700">On Leave</div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Right Sidebar - System Alerts & Recent Activity (1/3 width) */}
                <div className="lg:col-span-1 space-y-6">
                  {/* System Alerts */}
                  <Card className="bg-white p-6">
                    <div className="flex items-center space-x-2 mb-6">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <h2 className="text-lg font-semibold text-gray-900">
                        System Alerts
                      </h2>
                    </div>

                    <div className="space-y-3">
                      {/* Payroll Deadline Alert */}
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="font-medium text-gray-900 text-sm">
                          Payroll Deadline
                        </div>
                        <div className="text-xs text-yellow-700 mt-1">
                          5 days remaining until next payroll cycle
                        </div>
                      </div>

                      {/* Pending Verifications Alert */}
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="font-medium text-gray-900 text-sm">
                          Pending Verifications
                        </div>
                        <div className="text-xs text-red-700 mt-1">
                          {stats.pendingVerifications} users awaiting
                          verification approval
                        </div>
                      </div>

                      {/* System Update Alert */}
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="font-medium text-gray-900 text-sm">
                          System Update
                        </div>
                        <div className="text-xs text-blue-700 mt-1">
                          Scheduled maintenance this Sunday
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Recent Activity Summary */}
                  <Card className="bg-white p-6">
                    <div className="flex items-center space-x-2 mb-6">
                      <Clock className="h-5 w-5 text-gray-600" />
                      <h2 className="text-lg font-semibold text-gray-900">
                        Recent Activity
                      </h2>
                    </div>

                    <div className="space-y-4">
                      {recentActivity.slice(0, 4).map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-start space-x-3"
                        >
                          <div
                            className={`w-6 h-6 ${activity.bgColor} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}
                          >
                            <activity.icon
                              className={`w-3 h-3 ${activity.color}`}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 text-sm">
                              {activity.type}
                            </div>
                            <div className="text-xs text-gray-600">
                              {activity.description}
                            </div>
                            <div className="text-xs text-gray-500">
                              {activity.time}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>

              {/* Performance Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* HR Summary */}
                <Card className="bg-white p-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <BarChart3 className="h-5 w-5 text-purple-500" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      HR Summary
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <UserCheck className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">
                          Employee Satisfaction
                        </span>
                      </div>
                      <span className="text-blue-600 font-semibold">85%</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <Clock className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">
                          Attendance Rate
                        </span>
                      </div>
                      <span className="text-green-600 font-semibold">92%</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">
                          Payroll Accuracy
                        </span>
                      </div>
                      <span className="text-purple-600 font-semibold">
                        99.8%
                      </span>
                    </div>
                  </div>
                </Card>

                {/* Quick Leave Overview */}
                <Card className="bg-white p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-teal-500" />
                      <h2 className="text-lg font-semibold text-gray-900">
                        Leave Overview
                      </h2>
                    </div>
                    <Button
                      variant="blue"
                      size="sm"
                      onClick={() => setCurrentView("leave")}
                    >
                      Manage All
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {leaveRequests.slice(0, 3).map((leave) => (
                      <div
                        key={leave.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {leave.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {leave.type}
                          </div>
                          <div className="text-xs text-gray-500">
                            {leave.startDate} - {leave.endDate}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                            {leave.days} days
                          </span>
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="green"
                              onClick={() => handleApproveLeave(leave.id)}
                            >
                              ✓
                            </Button>
                            <Button
                              size="sm"
                              variant="red"
                              onClick={() => handleRejectLeave(leave.id)}
                            >
                              ✗
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {leaveRequests.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No pending leave requests
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {!loading && !error && currentView === "verification" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">
                  User Verification Management
                </h2>
                <Button
                  variant="blue"
                  onClick={() => {
                    // Refresh verification data
                    const fetchData = async () => {
                      try {
                        const verifications = await api.get(
                          "/verifications?status=pending&limit=50"
                        );
                        setVerificationQueue(verifications.data || []);
                      } catch (err) {
                        console.error("Error refreshing data:", err);
                      }
                    };
                    fetchData();
                  }}
                >
                  Refresh
                </Button>
              </div>

              <Card className="bg-white p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <UserCheck className="h-5 w-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pending Verifications ({verificationQueue.length})
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                          USER
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                          EMAIL
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                          ROLE REQUESTED
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                          DEPARTMENT
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                          SUBMITTED
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                          STATUS
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {verificationQueue.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-12 px-4 text-center text-gray-500"
                          >
                            <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <div className="text-lg font-medium">
                              No pending verifications
                            </div>
                            <div className="text-sm">
                              All verification requests have been processed
                            </div>
                          </td>
                        </tr>
                      ) : (
                        verificationQueue.map((verification) => (
                          <tr
                            key={verification.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                          >
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm font-medium">
                                    {verification.user?.name?.charAt(0) || "U"}
                                  </span>
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {verification.user?.name || "Unknown User"}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    ID:{" "}
                                    {verification.user?.employeeId ||
                                      verification.user?.studentId ||
                                      "N/A"}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-gray-600">
                              {verification.user?.email || "N/A"}
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(
                                  verification.role
                                )} bg-gray-100`}
                              >
                                {verification.role}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-gray-600">
                              {verification.user?.department || "N/A"}
                            </td>
                            <td className="py-4 px-4 text-gray-600">
                              {formatDate(verification.submissionDate)}
                            </td>
                            <td className="py-4 px-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                {verification.status}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="green"
                                  onClick={() =>
                                    handleApproveVerification(verification.id)
                                  }
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="red"
                                  onClick={() =>
                                    handleRejectVerification(verification.id)
                                  }
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Eye className="h-3 w-3 mr-1" />
                                  View
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
