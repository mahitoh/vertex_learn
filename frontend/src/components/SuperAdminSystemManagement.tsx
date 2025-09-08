import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Shield,
  AlertTriangle,
  Database,
  Activity,
  Settings,
  UserCheck,
  Clock,
  Zap,
  BarChart3,
  Download,
  RefreshCw,
  Bell,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
} from "lucide-react";

const API_BASE_URL = "http://localhost:3000/api";

const api = {
  get: async (endpoint: string) => {
    const token = localStorage.getItem("token"); // Use 'token' not 'accessToken'
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("API request failed");
    return response.json();
  },

  post: async (
    endpoint: string,
    data: { task?: string; [key: string]: string | number | boolean }
  ) => {
    const token = localStorage.getItem("token"); // Use 'token' not 'accessToken'
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("API request failed");
    return response.json();
  },
};

interface SystemUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  department?: string;
  employee_id?: string;
  is_active: boolean;
  validation_status: string;
  created_at: string;
  last_login?: string;
  role_name: string;
  organization_name?: string;
  organization_code?: string;
  validated_by_name?: string;
}

interface SystemStats {
  total_organizations: number;
  active_organizations: number;
  pending_organizations: number;
  total_users: number;
  active_users: number;
  pending_users: number;
  super_admin_count: number;
  org_admin_count: number;
  teacher_count: number;
  student_count: number;
  staff_count: number;
  total_courses: number;
  total_enrollments: number;
}

interface HealthStatus {
  overall_status: string;
  database: {
    status: string;
    tables: Array<{
      table_name: string;
      table_rows: number;
      size_mb: number;
    }>;
  };
  system_uptime: string;
  critical_issues: Array<{
    type: string;
    message: string;
    severity: string;
  }>;
  last_checked: string;
}

const SuperAdminSystemManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [systemHealth, setSystemHealth] = useState<HealthStatus | null>(null);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSystemOverview = useCallback(async () => {
    try {
      const response = await api.get("/system/overview");
      setSystemStats(response.system_stats);
    } catch (error) {
      console.error("Error fetching system overview:", error);
    }
  }, []);

  const fetchSystemHealth = useCallback(async () => {
    try {
      const response = await api.get("/system/health");
      setSystemHealth(response);
    } catch (error) {
      console.error("Error fetching system health:", error);
    }
  }, []);

  const fetchSystemUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (roleFilter) params.append("role", roleFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await api.get(`/system/users?${params.toString()}`);
      setSystemUsers(response.users);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error fetching system users:", error);
    }
  }, [currentPage, roleFilter, statusFilter, searchTerm]);

  const performMaintenance = async (task: string) => {
    try {
      setLoading(true);
      await api.post("/system/maintenance", { task });
      alert(`Maintenance task "${task}" completed successfully`);
      // Refresh relevant data
      if (task === "cleanup_inactive_users") {
        fetchSystemUsers();
        fetchSystemOverview();
      }
    } catch (error) {
      console.error("Error performing maintenance:", error);
      alert("Maintenance task failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "overview") {
          await fetchSystemOverview();
          await fetchSystemHealth();
        } else if (activeTab === "users") {
          await fetchSystemUsers();
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, fetchSystemOverview, fetchSystemHealth, fetchSystemUsers]);

  const getStatusBadge = (status: string) => {
    const styles = {
      healthy: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      critical: "bg-red-100 text-red-800",
      unhealthy: "bg-red-100 text-red-800",
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
    };
    return styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      super_admin: "bg-purple-100 text-purple-800",
      org_admin: "bg-blue-100 text-blue-800",
      teacher: "bg-green-100 text-green-800",
      student: "bg-orange-100 text-orange-800",
      staff: "bg-gray-100 text-gray-800",
    };
    return styles[role as keyof typeof styles] || "bg-gray-100 text-gray-800";
  };

  if (loading && !systemStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            System Administration
          </h2>
          <p className="text-gray-600">Monitor and manage the entire system</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => fetchSystemHealth()}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: "overview", label: "System Overview", icon: BarChart3 },
            { id: "users", label: "User Management", icon: Users },
            { id: "health", label: "System Health", icon: Activity },
            { id: "maintenance", label: "Maintenance", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* System Overview Tab */}
      {activeTab === "overview" && systemStats && (
        <div className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemStats.total_users}
                  </p>
                  <p className="text-sm text-green-600">
                    {systemStats.active_users} active
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Organizations
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemStats.total_organizations}
                  </p>
                  <p className="text-sm text-green-600">
                    {systemStats.active_organizations} active
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    Pending Approvals
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemStats.pending_users +
                      systemStats.pending_organizations}
                  </p>
                  <p className="text-sm text-yellow-600">
                    {systemStats.pending_users} users,{" "}
                    {systemStats.pending_organizations} orgs
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    System Health
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {systemHealth?.overall_status || "Unknown"}
                  </p>
                  <p className="text-sm text-gray-600">
                    Last checked:{" "}
                    {systemHealth
                      ? new Date(systemHealth.last_checked).toLocaleTimeString()
                      : "Never"}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Role Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              User Role Distribution
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  {systemStats.super_admin_count}
                </p>
                <p className="text-sm text-gray-600">Super Admins</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {systemStats.org_admin_count}
                </p>
                <p className="text-sm text-gray-600">Org Admins</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {systemStats.teacher_count}
                </p>
                <p className="text-sm text-gray-600">Teachers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {systemStats.student_count}
                </p>
                <p className="text-sm text-gray-600">Students</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-600">
                  {systemStats.staff_count}
                </p>
                <p className="text-sm text-gray-600">Staff</p>
              </div>
            </div>
          </div>

          {/* Critical Issues */}
          {systemHealth?.critical_issues &&
            systemHealth.critical_issues.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                  Critical Issues
                </h3>
                <div className="space-y-3">
                  {systemHealth.critical_issues.map((issue, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-md border-l-4 ${
                        issue.severity === "critical"
                          ? "border-red-500 bg-red-50"
                          : "border-yellow-500 bg-yellow-50"
                      }`}
                    >
                      <p className="font-medium text-gray-900">{issue.type}</p>
                      <p className="text-sm text-gray-600">{issue.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="org_admin">Org Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="staff">Staff</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {systemUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(
                            user.role_name
                          )}`}
                        >
                          {user.role_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900">
                            {user.organization_name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.organization_code || ""}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                            user.validation_status
                          )}`}
                        >
                          {user.validation_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.last_login
                          ? new Date(user.last_login).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-800">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-800">
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* System Health Tab */}
      {activeTab === "health" && systemHealth && (
        <div className="space-y-6">
          {/* Health Status */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                System Health Status
              </h3>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(
                  systemHealth.overall_status
                )}`}
              >
                {systemHealth.overall_status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Database Status
                </h4>
                <p
                  className={`text-sm ${
                    systemHealth.database.status === "healthy"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {systemHealth.database.status.toUpperCase()}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">
                  System Uptime
                </h4>
                <p className="text-sm text-gray-600">
                  Since:{" "}
                  {new Date(systemHealth.system_uptime).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Database Tables */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Database Tables
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Table Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Rows
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Size (MB)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {systemHealth.database.tables
                    .slice(0, 10)
                    .map((table, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {table.table_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {table.table_rows?.toLocaleString() || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {table.size_mb || 0}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === "maintenance" && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              System Maintenance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Clean Up Inactive Users
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Mark users as inactive who haven't logged in for 90+ days
                </p>
                <button
                  onClick={() => performMaintenance("cleanup_inactive_users")}
                  className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700"
                  disabled={loading}
                >
                  Run Cleanup
                </button>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Update Statistics
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Refresh cached system statistics and counters
                </p>
                <button
                  onClick={() => performMaintenance("update_statistics")}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  disabled={loading}
                >
                  Update Stats
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminSystemManagement;
