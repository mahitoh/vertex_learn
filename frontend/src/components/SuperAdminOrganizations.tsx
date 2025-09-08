import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Building,
  Users,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Crown,
  Calendar,
  Globe,
  DollarSign,
} from "lucide-react";

const API_BASE_URL = "http://localhost:3000/api";

const api = {
  get: async (endpoint: string) => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("API request failed");
    return response.json();
  },

  post: async (endpoint: string, data: NewOrganizationForm | NewAdminForm) => {
    const token = localStorage.getItem("accessToken");
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

  put: async (endpoint: string, data: Partial<Organization>) => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("API request failed");
    return response.json();
  },

  delete: async (endpoint: string) => {
    const token = localStorage.getItem("accessToken");
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) throw new Error("API request failed");
    return response.json();
  },
};

interface Organization {
  id: number;
  name: string;
  code: string;
  description?: string;
  address?: string;
  phone?: string;
  email: string;
  website?: string;
  status: "pending" | "approved" | "suspended" | "cancelled";
  subscription_plan: "basic" | "premium" | "enterprise";
  admin_name?: string;
  admin_email?: string;
  admin_active?: boolean;
  teacher_count: number;
  student_count: number;
  staff_count: number;
  total_users: number;
  created_at: string;
  updated_at: string;
}

interface NewOrganizationForm {
  name: string;
  code: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  subscription_plan: "basic" | "premium" | "enterprise";
}

interface NewAdminForm {
  name: string;
  email: string;
  password: string;
  phone: string;
  department: string;
}

const SuperAdminOrganizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [showCreateOrg, setShowCreateOrg] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState<number | null>(null);
  const [showEditOrg, setShowEditOrg] = useState<Organization | null>(null);
  const [showOrgDetails, setShowOrgDetails] = useState<Organization | null>(
    null
  );

  // Form states
  const [newOrganization, setNewOrganization] = useState<NewOrganizationForm>({
    name: "",
    code: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    subscription_plan: "basic",
  });

  const [newAdmin, setNewAdmin] = useState<NewAdminForm>({
    name: "",
    email: "",
    password: "",
    phone: "",
    department: "",
  });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    suspended: 0,
  });

  const fetchOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
      });

      if (statusFilter) params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);

      const response = await api.get(`/organizations?${params.toString()}`);
      setOrganizations(response.organizations);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchTerm]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await api.get("/organizations/stats/overview");
      setStats({
        total: response.organization_stats.total_organizations,
        approved: response.organization_stats.approved_count,
        pending: response.organization_stats.pending_count,
        suspended: response.organization_stats.suspended_count,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  }, []);

  useEffect(() => {
    fetchOrganizations();
    fetchStats();
  }, [fetchOrganizations, fetchStats]);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/organizations", newOrganization);
      setNewOrganization({
        name: "",
        code: "",
        description: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        subscription_plan: "basic",
      });
      setShowCreateOrg(false);
      fetchOrganizations();
      fetchStats();
    } catch (error) {
      console.error("Error creating organization:", error);
      alert("Failed to create organization");
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCreateAdmin) return;

    try {
      await api.post(`/organizations/${showCreateAdmin}/admin`, newAdmin);
      setNewAdmin({
        name: "",
        email: "",
        password: "",
        phone: "",
        department: "",
      });
      setShowCreateAdmin(null);
      fetchOrganizations();
    } catch (error) {
      console.error("Error creating admin:", error);
      alert("Failed to create admin");
    }
  };

  const handleUpdateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditOrg) return;

    try {
      await api.put(`/organizations/${showEditOrg.id}`, showEditOrg);
      setShowEditOrg(null);
      fetchOrganizations();
      fetchStats();
    } catch (error) {
      console.error("Error updating organization:", error);
      alert("Failed to update organization");
    }
  };

  const handleDeleteOrganization = async (orgId: number) => {
    if (!confirm("Are you sure you want to delete this organization?")) return;

    try {
      await api.delete(`/organizations/${orgId}`);
      fetchOrganizations();
      fetchStats();
    } catch (error) {
      console.error("Error deleting organization:", error);
      alert("Failed to delete organization");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      suspended: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const getPlanBadge = (plan: string) => {
    const styles = {
      basic: "bg-blue-100 text-blue-800",
      premium: "bg-purple-100 text-purple-800",
      enterprise: "bg-orange-100 text-orange-800",
    };
    return styles[plan as keyof typeof styles] || styles.basic;
  };

  if (loading && organizations.length === 0) {
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
            Organization Management
          </h2>
          <p className="text-gray-600">
            Manage organizations and their administrators
          </p>
        </div>
        <button
          onClick={() => setShowCreateOrg(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Create Organization</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">
                Total Organizations
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Building className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Approved</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.approved}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Suspended</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.suspended}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Plans</option>
            <option value="basic">Basic</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Users
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {org.name}
                        </div>
                        <div className="text-sm text-gray-500">{org.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                        org.status
                      )}`}
                    >
                      {org.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanBadge(
                        org.subscription_plan
                      )}`}
                    >
                      {org.subscription_plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {org.admin_name ? (
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {org.admin_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {org.admin_email}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowCreateAdmin(org.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Create Admin
                      </button>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {org.total_users} total
                    </div>
                    <div className="text-xs text-gray-500">
                      {org.teacher_count}T, {org.student_count}S,{" "}
                      {org.staff_count}St
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(org.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setShowOrgDetails(org)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowEditOrg(org)}
                        className="text-yellow-600 hover:text-yellow-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteOrganization(org.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
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
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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

      {/* Create Organization Modal */}
      {showCreateOrg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Create New Organization
            </h3>
            <form onSubmit={handleCreateOrganization} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name *
                </label>
                <input
                  type="text"
                  required
                  value={newOrganization.name}
                  onChange={(e) =>
                    setNewOrganization((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Code *
                </label>
                <input
                  type="text"
                  required
                  value={newOrganization.code}
                  onChange={(e) =>
                    setNewOrganization((prev) => ({
                      ...prev,
                      code: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ORG001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={newOrganization.email}
                  onChange={(e) =>
                    setNewOrganization((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newOrganization.phone}
                  onChange={(e) =>
                    setNewOrganization((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  value={newOrganization.address}
                  onChange={(e) =>
                    setNewOrganization((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription Plan
                </label>
                <select
                  value={newOrganization.subscription_plan}
                  onChange={(e) =>
                    setNewOrganization((prev) => ({
                      ...prev,
                      subscription_plan: e.target.value as
                        | "basic"
                        | "premium"
                        | "enterprise",
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Create Organization
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateOrg(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Create Organization Admin
            </h3>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newAdmin.name}
                  onChange={(e) =>
                    setNewAdmin((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={newAdmin.email}
                  onChange={(e) =>
                    setNewAdmin((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={newAdmin.password}
                  onChange={(e) =>
                    setNewAdmin((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newAdmin.phone}
                  onChange={(e) =>
                    setNewAdmin((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={newAdmin.department}
                  onChange={(e) =>
                    setNewAdmin((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Administration"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Create Admin
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateAdmin(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Organization Modal */}
      {showEditOrg && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Organization</h3>
            <form onSubmit={handleUpdateOrganization} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  value={showEditOrg.name}
                  onChange={(e) =>
                    setShowEditOrg((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={showEditOrg.status}
                  onChange={(e) =>
                    setShowEditOrg((prev) =>
                      prev
                        ? {
                            ...prev,
                            status: e.target.value as
                              | "pending"
                              | "approved"
                              | "suspended"
                              | "cancelled",
                          }
                        : null
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="suspended">Suspended</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subscription Plan
                </label>
                <select
                  value={showEditOrg.subscription_plan}
                  onChange={(e) =>
                    setShowEditOrg((prev) =>
                      prev
                        ? {
                            ...prev,
                            subscription_plan: e.target.value as
                              | "basic"
                              | "premium"
                              | "enterprise",
                          }
                        : null
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="basic">Basic</option>
                  <option value="premium">Premium</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={showEditOrg.phone || ""}
                  onChange={(e) =>
                    setShowEditOrg((prev) =>
                      prev ? { ...prev, phone: e.target.value } : null
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Update Organization
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditOrg(null)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Organization Details Modal */}
      {showOrgDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Organization Details</h3>
              <button
                onClick={() => setShowOrgDetails(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <p className="text-sm text-gray-900">{showOrgDetails.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Code
                </label>
                <p className="text-sm text-gray-900">{showOrgDetails.code}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="text-sm text-gray-900">{showOrgDetails.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <p className="text-sm text-gray-900">
                  {showOrgDetails.phone || "N/A"}
                </p>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <p className="text-sm text-gray-900">
                  {showOrgDetails.address || "N/A"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                    showOrgDetails.status
                  )}`}
                >
                  {showOrgDetails.status}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Plan
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanBadge(
                    showOrgDetails.subscription_plan
                  )}`}
                >
                  {showOrgDetails.subscription_plan}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Total Users
                </label>
                <p className="text-sm text-gray-900">
                  {showOrgDetails.total_users}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Created
                </label>
                <p className="text-sm text-gray-900">
                  {new Date(showOrgDetails.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminOrganizations;
