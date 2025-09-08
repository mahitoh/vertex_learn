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
  Edit,
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

          {/* System Access Management */}
          {!loading && !error && currentView === "system" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">
                  System Access Management
                </h2>
                <Button variant="blue">Add New User</Button>
              </div>

              {/* Access Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">
                        Total Users
                      </p>
                      <p className="text-2xl font-bold text-white">245</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        Active Sessions
                      </p>
                      <p className="text-2xl font-bold text-white">142</p>
                    </div>
                    <Shield className="h-8 w-8 text-green-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">
                        Permission Groups
                      </p>
                      <p className="text-2xl font-bold text-white">8</p>
                    </div>
                    <UserCog className="h-8 w-8 text-orange-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-red-500 to-red-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">
                        Security Alerts
                      </p>
                      <p className="text-2xl font-bold text-white">3</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-red-200" />
                  </div>
                </Card>
              </div>

              {/* User Access Table */}
              <Card className="bg-white p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    User Access Control
                  </h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      Export
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                          USER
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                          ROLE
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                          PERMISSIONS
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                          LAST LOGIN
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
                      {[
                        {
                          id: 1,
                          name: "John Smith",
                          email: "john@school.edu",
                          role: "Teacher",
                          permissions: "Course Management",
                          lastLogin: "2 hours ago",
                          status: "Active",
                        },
                        {
                          id: 2,
                          name: "Sarah Johnson",
                          email: "sarah@school.edu",
                          role: "Admin",
                          permissions: "Full Access",
                          lastLogin: "1 day ago",
                          status: "Active",
                        },
                        {
                          id: 3,
                          name: "Mike Chen",
                          email: "mike@school.edu",
                          role: "Staff",
                          permissions: "Limited Access",
                          lastLogin: "3 days ago",
                          status: "Inactive",
                        },
                      ].map((user) => (
                        <tr
                          key={user.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {user.permissions}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {user.lastLogin}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {user.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                Edit
                              </Button>
                              <Button size="sm" variant="red">
                                Disable
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Employee Management */}
          {!loading && !error && currentView === "employees" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Employee Management
                </h2>
                <Button variant="blue">Add Employee</Button>
              </div>

              {/* Employee Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">
                        Total Employees
                      </p>
                      <p className="text-2xl font-bold text-white">187</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        Active
                      </p>
                      <p className="text-2xl font-bold text-white">165</p>
                    </div>
                    <UserCheck className="h-8 w-8 text-green-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">
                        On Leave
                      </p>
                      <p className="text-2xl font-bold text-white">12</p>
                    </div>
                    <Calendar className="h-8 w-8 text-yellow-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-red-500 to-red-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">
                        Inactive
                      </p>
                      <p className="text-2xl font-bold text-white">10</p>
                    </div>
                    <X className="h-8 w-8 text-red-200" />
                  </div>
                </Card>
              </div>

              {/* Employee Directory */}
              <Card className="bg-white p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Employee Directory
                  </h3>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Search employees..."
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button variant="outline" size="sm">
                      Department
                    </Button>
                    <Button variant="outline" size="sm">
                      Status
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      id: 1,
                      name: "Alice Johnson",
                      position: "Math Teacher",
                      department: "Mathematics",
                      email: "alice@school.edu",
                      phone: "+1234567890",
                      status: "Active",
                    },
                    {
                      id: 2,
                      name: "Bob Wilson",
                      position: "Science Teacher",
                      department: "Science",
                      email: "bob@school.edu",
                      phone: "+1234567891",
                      status: "Active",
                    },
                    {
                      id: 3,
                      name: "Carol Brown",
                      position: "Librarian",
                      department: "Library",
                      email: "carol@school.edu",
                      phone: "+1234567892",
                      status: "On Leave",
                    },
                    {
                      id: 4,
                      name: "David Lee",
                      position: "IT Specialist",
                      department: "Technology",
                      email: "david@school.edu",
                      phone: "+1234567893",
                      status: "Active",
                    },
                    {
                      id: 5,
                      name: "Emma Davis",
                      position: "English Teacher",
                      department: "English",
                      email: "emma@school.edu",
                      phone: "+1234567894",
                      status: "Active",
                    },
                    {
                      id: 6,
                      name: "Frank Miller",
                      position: "PE Teacher",
                      department: "Physical Education",
                      email: "frank@school.edu",
                      phone: "+1234567895",
                      status: "Inactive",
                    },
                  ].map((employee) => (
                    <Card
                      key={employee.id}
                      className="p-4 border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {employee.name.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {employee.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {employee.position}
                          </div>
                          <div className="text-xs text-gray-500">
                            {employee.department}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {employee.email}
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                employee.status === "Active"
                                  ? "bg-green-100 text-green-800"
                                  : employee.status === "On Leave"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {employee.status}
                            </span>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost">
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="ghost">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Payroll Management */}
          {!loading && !error && currentView === "payroll" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Payroll Management
                </h2>
                <Button variant="blue">Generate Payroll</Button>
              </div>

              {/* Payroll Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        Monthly Total
                      </p>
                      <p className="text-2xl font-bold text-white">$284,500</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">
                        Employees Paid
                      </p>
                      <p className="text-2xl font-bold text-white">165/187</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">
                        Pending
                      </p>
                      <p className="text-2xl font-bold text-white">22</p>
                    </div>
                    <Clock className="h-8 w-8 text-orange-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">
                        Next Cycle
                      </p>
                      <p className="text-2xl font-bold text-white">5 days</p>
                    </div>
                    <Calendar className="h-8 w-8 text-purple-200" />
                  </div>
                </Card>
              </div>

              {/* Payroll Table */}
              <Card className="bg-white p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Current Month Payroll
                  </h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Export CSV
                    </Button>
                    <Button variant="outline" size="sm">
                      Print Reports
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                          EMPLOYEE
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                          POSITION
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                          BASE SALARY
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                          DEDUCTIONS
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">
                          NET PAY
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
                      {[
                        {
                          id: 1,
                          name: "Alice Johnson",
                          position: "Math Teacher",
                          baseSalary: 4500,
                          deductions: 450,
                          netPay: 4050,
                          status: "Paid",
                        },
                        {
                          id: 2,
                          name: "Bob Wilson",
                          position: "Science Teacher",
                          baseSalary: 4200,
                          deductions: 420,
                          netPay: 3780,
                          status: "Paid",
                        },
                        {
                          id: 3,
                          name: "Carol Brown",
                          position: "Librarian",
                          baseSalary: 3500,
                          deductions: 350,
                          netPay: 3150,
                          status: "Pending",
                        },
                      ].map((employee) => (
                        <tr
                          key={employee.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-900">
                              {employee.name}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {employee.position}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            ${employee.baseSalary.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            ${employee.deductions.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-900">
                            ${employee.netPay.toLocaleString()}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                employee.status === "Paid"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {employee.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                View
                              </Button>
                              {employee.status === "Pending" && (
                                <Button size="sm" variant="green">
                                  Process
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {/* Leave Management */}
          {!loading && !error && currentView === "leave" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Leave Management
                </h2>
                <Button variant="blue">Add Leave Policy</Button>
              </div>

              {/* Leave Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">
                        Pending Requests
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {leaveRequests.length}
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        Approved This Month
                      </p>
                      <p className="text-2xl font-bold text-white">28</p>
                    </div>
                    <Check className="h-8 w-8 text-green-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">
                        Currently On Leave
                      </p>
                      <p className="text-2xl font-bold text-white">12</p>
                    </div>
                    <Calendar className="h-8 w-8 text-yellow-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-red-500 to-red-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">
                        Rejected
                      </p>
                      <p className="text-2xl font-bold text-white">3</p>
                    </div>
                    <X className="h-8 w-8 text-red-200" />
                  </div>
                </Card>
              </div>

              {/* Leave Requests */}
              <Card className="bg-white p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Leave Requests
                  </h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Filter by Type
                    </Button>
                    <Button variant="outline" size="sm">
                      Filter by Status
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {leaveRequests.map((leave) => (
                    <Card key={leave.id} className="p-4 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {leave.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {leave.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {leave.type}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">
                              {leave.startDate}
                            </div>
                            <div className="text-xs text-gray-500">
                              Start Date
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">
                              {leave.endDate}
                            </div>
                            <div className="text-xs text-gray-500">
                              End Date
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">
                              {leave.days} days
                            </div>
                            <div className="text-xs text-gray-500">
                              Duration
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="green"
                              onClick={() => handleApproveLeave(leave.id)}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="red"
                              onClick={() => handleRejectLeave(leave.id)}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Reject
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="h-3 w-3 mr-1" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Performance Tracking */}
          {!loading && !error && currentView === "performance" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Performance Tracking
                </h2>
                <Button variant="blue">New Review</Button>
              </div>

              {/* Performance Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        Average Rating
                      </p>
                      <p className="text-2xl font-bold text-white">4.2/5</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-green-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">
                        Reviews Completed
                      </p>
                      <p className="text-2xl font-bold text-white">145/187</p>
                    </div>
                    <Check className="h-8 w-8 text-blue-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">
                        Top Performers
                      </p>
                      <p className="text-2xl font-bold text-white">23</p>
                    </div>
                    <Users className="h-8 w-8 text-purple-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">
                        Improvement Plans
                      </p>
                      <p className="text-2xl font-bold text-white">8</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-200" />
                  </div>
                </Card>
              </div>

              {/* Performance Reviews */}
              <Card className="bg-white p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Performance Reviews
                  </h3>
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      id: 1,
                      name: "Alice Johnson",
                      position: "Math Teacher",
                      rating: 4.8,
                      lastReview: "2024-08-15",
                      status: "Excellent",
                    },
                    {
                      id: 2,
                      name: "Bob Wilson",
                      position: "Science Teacher",
                      rating: 4.2,
                      lastReview: "2024-08-10",
                      status: "Good",
                    },
                    {
                      id: 3,
                      name: "Carol Brown",
                      position: "Librarian",
                      rating: 3.9,
                      lastReview: "2024-08-05",
                      status: "Satisfactory",
                    },
                  ].map((employee) => (
                    <Card
                      key={employee.id}
                      className="p-4 border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium">
                              {employee.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {employee.name}
                            </div>
                            <div className="text-sm text-gray-600">
                              {employee.position}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                              {employee.rating}
                            </div>
                            <div className="text-xs text-gray-500">Rating</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">
                              {employee.lastReview}
                            </div>
                            <div className="text-xs text-gray-500">
                              Last Review
                            </div>
                          </div>
                          <div className="text-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                employee.status === "Excellent"
                                  ? "bg-green-100 text-green-800"
                                  : employee.status === "Good"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {employee.status}
                            </span>
                          </div>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Asset Management */}
          {!loading && !error && currentView === "assets" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Asset Management
                </h2>
                <Button variant="blue">Add Asset</Button>
              </div>

              {/* Asset Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">
                        Total Assets
                      </p>
                      <p className="text-2xl font-bold text-white">342</p>
                    </div>
                    <Building className="h-8 w-8 text-blue-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        In Use
                      </p>
                      <p className="text-2xl font-bold text-white">289</p>
                    </div>
                    <Check className="h-8 w-8 text-green-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100 text-sm font-medium">
                        Under Maintenance
                      </p>
                      <p className="text-2xl font-bold text-white">15</p>
                    </div>
                    <Settings className="h-8 w-8 text-yellow-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-red-500 to-red-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">
                        Retired
                      </p>
                      <p className="text-2xl font-bold text-white">38</p>
                    </div>
                    <X className="h-8 w-8 text-red-200" />
                  </div>
                </Card>
              </div>

              {/* Asset Categories */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Asset Categories
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        category: "IT Equipment",
                        count: 156,
                        value: "$245,000",
                      },
                      { category: "Furniture", count: 89, value: "$78,000" },
                      { category: "Vehicles", count: 12, value: "$180,000" },
                      {
                        category: "Laboratory Equipment",
                        count: 45,
                        value: "$125,000",
                      },
                      { category: "Audio/Visual", count: 40, value: "$65,000" },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.category}
                          </div>
                          <div className="text-sm text-gray-600">
                            {item.count} items
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {item.value}
                          </div>
                          <div className="text-sm text-gray-500">
                            Total Value
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="bg-white p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Asset Activity
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        action: "Asset Assigned",
                        item: "Laptop - Dell XPS",
                        user: "John Smith",
                        time: "2 hours ago",
                      },
                      {
                        action: "Maintenance Started",
                        item: "Projector - Room 101",
                        user: "IT Team",
                        time: "4 hours ago",
                      },
                      {
                        action: "Asset Returned",
                        item: "Camera Equipment",
                        user: "Sarah Johnson",
                        time: "1 day ago",
                      },
                      {
                        action: "New Asset Added",
                        item: "Smart Board",
                        user: "Admin",
                        time: "2 days ago",
                      },
                      {
                        action: "Asset Retired",
                        item: "Old Printer",
                        user: "IT Team",
                        time: "3 days ago",
                      },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {activity.action}
                          </div>
                          <div className="text-sm text-gray-600">
                            {activity.item}
                          </div>
                          <div className="text-xs text-gray-500">
                            {activity.user} • {activity.time}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Notifications */}
          {!loading && !error && currentView === "notifications" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">
                  Notifications
                </h2>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    Mark All Read
                  </Button>
                  <Button variant="blue">Send Notification</Button>
                </div>
              </div>

              {/* Notification Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">
                        Total Notifications
                      </p>
                      <p className="text-2xl font-bold text-white">1,245</p>
                    </div>
                    <Bell className="h-8 w-8 text-blue-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">
                        Unread
                      </p>
                      <p className="text-2xl font-bold text-white">23</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-orange-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">
                        Sent Today
                      </p>
                      <p className="text-2xl font-bold text-white">45</p>
                    </div>
                    <Check className="h-8 w-8 text-green-200" />
                  </div>
                </Card>
                <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">
                        System Alerts
                      </p>
                      <p className="text-2xl font-bold text-white">7</p>
                    </div>
                    <Settings className="h-8 w-8 text-purple-200" />
                  </div>
                </Card>
              </div>

              {/* Notifications List */}
              <Card className="bg-white p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Recent Notifications
                  </h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      Search
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: 1,
                      type: "System",
                      title: "Payroll Processing Complete",
                      message:
                        "Monthly payroll has been successfully processed for all employees.",
                      time: "2 hours ago",
                      read: false,
                    },
                    {
                      id: 2,
                      type: "Leave",
                      title: "Leave Request Approved",
                      message:
                        "Alice Johnson's leave request has been approved by the department head.",
                      time: "4 hours ago",
                      read: false,
                    },
                    {
                      id: 3,
                      type: "Verification",
                      title: "New User Verification",
                      message:
                        "3 new users are pending verification and require admin approval.",
                      time: "6 hours ago",
                      read: true,
                    },
                    {
                      id: 4,
                      type: "Asset",
                      title: "Asset Maintenance Due",
                      message:
                        "5 assets are due for scheduled maintenance this week.",
                      time: "1 day ago",
                      read: true,
                    },
                    {
                      id: 5,
                      type: "Performance",
                      title: "Performance Reviews Due",
                      message:
                        "12 employee performance reviews are due for completion.",
                      time: "2 days ago",
                      read: true,
                    },
                  ].map((notification) => (
                    <Card
                      key={notification.id}
                      className={`p-4 border ${
                        notification.read
                          ? "border-gray-200"
                          : "border-blue-200 bg-blue-50"
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`w-2 h-2 rounded-full mt-2 ${
                            notification.read ? "bg-gray-400" : "bg-blue-500"
                          }`}
                        ></div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                notification.type === "System"
                                  ? "bg-purple-100 text-purple-800"
                                  : notification.type === "Leave"
                                  ? "bg-green-100 text-green-800"
                                  : notification.type === "Verification"
                                  ? "bg-orange-100 text-orange-800"
                                  : notification.type === "Asset"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {notification.type}
                            </span>
                            <span className="text-xs text-gray-500">
                              {notification.time}
                            </span>
                          </div>
                          <div
                            className={`font-medium ${
                              notification.read
                                ? "text-gray-900"
                                : "text-gray-900 font-semibold"
                            }`}
                          >
                            {notification.title}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!notification.read && (
                            <Button size="sm" variant="outline">
                              Mark Read
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Settings */}
          {!loading && !error && currentView === "settings" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">
                  System Settings
                </h2>
                <Button variant="blue">Save Changes</Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* General Settings */}
                <Card className="bg-white p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    General Settings
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        School Name
                      </label>
                      <input
                        type="text"
                        defaultValue="Vertex Learning Academy"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Academic Year
                      </label>
                      <input
                        type="text"
                        defaultValue="2024-2025"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Time Zone
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>Eastern Time (ET)</option>
                        <option>Pacific Time (PT)</option>
                        <option>Central Time (CT)</option>
                        <option>Mountain Time (MT)</option>
                      </select>
                    </div>
                  </div>
                </Card>

                {/* Security Settings */}
                <Card className="bg-white p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Security Settings
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          Two-Factor Authentication
                        </div>
                        <div className="text-sm text-gray-500">
                          Require 2FA for admin accounts
                        </div>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          Session Timeout
                        </div>
                        <div className="text-sm text-gray-500">
                          Auto-logout after inactivity
                        </div>
                      </div>
                      <select className="px-3 py-1 border border-gray-300 rounded text-sm">
                        <option>30 minutes</option>
                        <option>1 hour</option>
                        <option>2 hours</option>
                        <option>4 hours</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          Password Policy
                        </div>
                        <div className="text-sm text-gray-500">
                          Enforce strong passwords
                        </div>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
                      </button>
                    </div>
                  </div>
                </Card>

                {/* Notification Settings */}
                <Card className="bg-white p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          Email Notifications
                        </div>
                        <div className="text-sm text-gray-500">
                          Send system alerts via email
                        </div>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          SMS Notifications
                        </div>
                        <div className="text-sm text-gray-500">
                          Emergency alerts via SMS
                        </div>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-1"></span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          Push Notifications
                        </div>
                        <div className="text-sm text-gray-500">
                          Browser push notifications
                        </div>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6"></span>
                      </button>
                    </div>
                  </div>
                </Card>
              </div>

              {/* System Information */}
              <Card className="bg-white p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  System Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Version</span>
                      <span className="font-medium">v2.1.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Database Version</span>
                      <span className="font-medium">MySQL 8.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Backup</span>
                      <span className="font-medium">2024-09-06 02:00 AM</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Server Status</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Online
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Storage Used</span>
                      <span className="font-medium">245 GB / 500 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Users</span>
                      <span className="font-medium">142</span>
                    </div>
                  </div>
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
