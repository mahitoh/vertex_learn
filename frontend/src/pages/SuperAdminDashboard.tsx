import React, { useState, useEffect } from "react";
import { useUser } from "@/contexts/UserContext";

// Define organization interface
interface Organization {
  id: number;
  name: string;
  admin: string;
  email: string;
  created: string;
  status: string;
  userCount: number;
  address: string;
  phone: string;
}

import {
  Building2,
  Users,
  Settings,
  BarChart3,
  Shield,
  Database,
  UserCheck,
  Clock,
  TrendingUp,
  Server,
  Activity,
  CheckCircle,
  XCircle,
  Eye,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Bell,
  Zap,
  MonitorSpeaker,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from "@/hooks/use-mobile";

export default function SuperAdminDashboard() {
  const { user } = useUser();
  const isMobile = useIsMobile();
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Modal states
  const [showNewOrgModal, setShowNewOrgModal] = useState(false);
  const [showUserManagementModal, setShowUserManagementModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);

  // Pending organizations state
  const [pendingOrganizations, setPendingOrganizations] = useState([]);

  // All organizations state
  const [allOrganizations, setAllOrganizations] = useState([]);

  // New organization form
  const [newOrgForm, setNewOrgForm] = useState({
    name: "",
    type: "",
    plan: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
    address: "",
    phone: "",
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleCollapse = () => setSidebarCollapsed(!sidebarCollapsed);

  // Button handlers
  const handleNewOrg = () => setShowNewOrgModal(true);
  const handleManageUsers = () => setShowUserManagementModal(true);
  const handleSettings = () => setShowSettingsModal(true);
  const handleReports = () => setShowReportsModal(true);

  // Fetch pending organizations
  const fetchPendingOrganizations = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      console.log("Fetching pending organizations...");
      const response = await fetch(
        "http://localhost:3000/api/organizations/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched data:", data);

        const transformedOrgs = data.organizations.map(
          (org: {
            id: number;
            name: string;
            email: string;
            created_at: string;
            status: string;
            admin_name?: string;
            admin_email?: string;
          }) => ({
            id: org.id,
            name: org.name,
            admin: org.admin_name || "No Admin Assigned",
            email: org.admin_email || org.email || "No email",
            requested: new Date(org.created_at).toLocaleDateString(),
            type: "School", // Default type, could be added to organizations table
            plan: "Basic", // Default plan, could be added to organizations table
            status: org.status,
          })
        );

        console.log("Transformed organizations:", transformedOrgs);
        setPendingOrganizations(transformedOrgs);
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
      }
    } catch (error) {
      console.error("Error fetching pending organizations:", error);
    }
  };

  // Fetch all organizations
  const fetchAllOrganizations = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found");
        return;
      }

      console.log("Fetching all organizations...");
      const response = await fetch(
        "http://localhost:3000/api/organizations/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Fetched all organizations:", data);

        const transformedOrgs = data.organizations.map(
          (org: {
            id: number;
            name: string;
            email: string;
            created_at: string;
            status: string;
            admin_name?: string;
            admin_email?: string;
            user_count?: number;
            address?: string;
            phone?: string;
          }) => ({
            id: org.id,
            name: org.name,
            admin: org.admin_name || "No Admin Assigned",
            email: org.admin_email || org.email || "No email",
            created: new Date(org.created_at).toLocaleDateString(),
            status: org.status,
            userCount: org.user_count || 0,
            address: org.address || "Not specified",
            phone: org.phone || "Not specified",
          })
        );

        console.log("Transformed all organizations:", transformedOrgs);
        setAllOrganizations(transformedOrgs);
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
      }
    } catch (error) {
      console.error("Error fetching all organizations:", error);
    }
  };

  // Load organizations on component mount
  useEffect(() => {
    fetchPendingOrganizations();
    fetchAllOrganizations();
  }, []);

  // Organization approval handlers
  const handleApproveOrg = async (orgId: number) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Authentication required");
        return;
      }

      const response = await fetch(
        `http://localhost:3000/api/organizations/${orgId}/approve`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Organization approved successfully!");
        // Refresh both lists
        fetchPendingOrganizations();
        fetchAllOrganizations();
      } else {
        throw new Error(result.error || "Failed to approve organization");
      }
    } catch (error) {
      console.error("Error approving organization:", error);
      alert(
        "Failed to approve organization: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  const handleRejectOrg = async (orgId: number) => {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason === null) return; // User cancelled

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Authentication required");
        return;
      }

      const response = await fetch(
        `http://localhost:3000/api/organizations/${orgId}/reject`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Organization rejected successfully!");
        // Refresh both lists
        fetchPendingOrganizations();
        fetchAllOrganizations();
      } else {
        throw new Error(result.error || "Failed to reject organization");
      }
    } catch (error) {
      console.error("Error rejecting organization:", error);
      alert(
        "Failed to reject organization: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  // Suspend organization handler
  const handleSuspendOrg = async (orgId: number) => {
    const reason = prompt("Please provide a reason for suspension:");
    if (reason === null) return; // User cancelled

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Authentication required");
        return;
      }

      const response = await fetch(
        `http://localhost:3000/api/organizations/${orgId}/suspend`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Organization suspended successfully!");
        // Refresh both lists
        fetchPendingOrganizations();
        fetchAllOrganizations();
      } else {
        throw new Error(result.error || "Failed to suspend organization");
      }
    } catch (error) {
      console.error("Error suspending organization:", error);
      alert(
        "Failed to suspend organization: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  // Reactivate organization handler
  const handleReactivateOrg = async (orgId: number) => {
    if (!confirm("Are you sure you want to reactivate this organization?"))
      return;

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Authentication required");
        return;
      }

      const response = await fetch(
        `http://localhost:3000/api/organizations/${orgId}/reactivate`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("Organization reactivated successfully!");
        // Refresh both lists
        fetchPendingOrganizations();
        fetchAllOrganizations();
      } else {
        throw new Error(result.error || "Failed to reactivate organization");
      }
    } catch (error) {
      console.error("Error reactivating organization:", error);
      alert(
        "Failed to reactivate organization: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  // View organization details handler
  const handleViewOrgDetails = (org: Organization) => {
    alert(`Organization Details:
Name: ${org.name}
Admin: ${org.admin}
Email: ${org.email}
Status: ${org.status}
Created: ${org.created}
Users: ${org.userCount}
Address: ${org.address}
Phone: ${org.phone}`);
  };

  // Create organization handler
  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const orgData = {
      schoolName: formData.get("name") as string,
      address: formData.get("address") || "Not specified",
      phone: formData.get("phone") || "Not specified",
      email: formData.get("adminEmail") as string,
    };

    const adminData = {
      adminName: formData.get("adminName") as string,
      adminEmail: formData.get("adminEmail") as string,
      adminPassword: "defaultPassword123", // Default password - admin can change later
    };

    try {
      // Get auth token
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Authentication required");
        return;
      }

      // First create the school/organization
      const schoolResponse = await fetch(
        "http://localhost:3000/api/schools/create-school",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(orgData),
        }
      );

      const schoolResult = await schoolResponse.json();

      if (!schoolResult.success) {
        throw new Error(
          schoolResult.message || "Failed to create organization"
        );
      }

      // Then create the admin for the school
      const adminResponse = await fetch(
        "http://localhost:3000/api/schools/create-admin",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...adminData,
            schoolId: schoolResult.schoolId,
          }),
        }
      );

      const adminResult = await adminResponse.json();

      if (!adminResult.success) {
        console.warn(
          "School created but admin creation failed:",
          adminResult.message
        );
      }

      alert("Organization created successfully!");
      setShowNewOrgModal(false);

      // Reset form
      form.reset();

      // Refresh both organizations lists
      fetchPendingOrganizations();
      fetchAllOrganizations();
    } catch (error) {
      console.error("Error creating organization:", error);
      alert(
        "Failed to create organization: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
  };

  const getMainMargin = () => {
    if (isMobile) return "";
    return sidebarCollapsed ? "ml-16" : "ml-64";
  };

  const menuItems = [
    { icon: BarChart3, label: "Overview", value: "dashboard" },
    { icon: Building2, label: "Organizations", value: "organizations" },
    { icon: Users, label: "System Users", value: "users" },
    { icon: Database, label: "System Health", value: "system" },
    { icon: Shield, label: "Security", value: "security" },
    { icon: Settings, label: "Global Settings", value: "settings" },
  ];

  const systemStats = [
    {
      title: "Total Organizations",
      value: "24",
      change: "+3",
      changeType: "increase",
      icon: Building2,
      description: "Active organizations",
      color: "blue",
    },
    {
      title: "Total Users",
      value: "12,847",
      change: "+247",
      changeType: "increase",
      icon: Users,
      description: "This week",
      color: "green",
    },
    {
      title: "System Uptime",
      value: "99.9%",
      change: "+0.1%",
      changeType: "increase",
      icon: Activity,
      description: "Last 30 days",
      color: "purple",
    },
    {
      title: "Revenue",
      value: "$142.6K",
      change: "+12.5%",
      changeType: "increase",
      icon: TrendingUp,
      description: "This month",
      color: "orange",
    },
  ];

  const systemHealth = [
    { name: "Database", status: "healthy", uptime: 99.9, load: 45 },
    { name: "API Server", status: "healthy", uptime: 99.8, load: 62 },
    { name: "File Storage", status: "warning", uptime: 98.5, load: 78 },
    { name: "Email Service", status: "healthy", uptime: 99.7, load: 23 },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Organization Approved",
      details: "Harvard Business School has been approved and activated",
      user: "Super Admin",
      time: "2 hours ago",
      type: "approval",
      status: "success",
    },
    {
      id: 2,
      action: "System Maintenance",
      details: "Database optimization completed successfully",
      user: "System",
      time: "6 hours ago",
      type: "system",
      status: "info",
    },
    {
      id: 3,
      action: "Security Alert",
      details: "Suspicious login attempt blocked from IP 192.168.1.100",
      user: "Security System",
      time: "1 day ago",
      type: "security",
      status: "warning",
    },
    {
      id: 4,
      action: "Failed Login Attempt",
      details: "Multiple failed login attempts detected for admin@school.edu",
      user: "Security System",
      time: "3 hours ago",
      type: "security",
      status: "alert",
    },
    {
      id: 5,
      action: "Permission Escalation",
      details:
        "User role elevated from teacher to admin for john.doe@university.edu",
      user: "Super Admin",
      time: "5 hours ago",
      type: "security",
      status: "info",
    },
    {
      id: 6,
      action: "New Organization Request",
      details: "MIT Technology Institute submitted application",
      user: "Dr. Robert Kim",
      time: "2 days ago",
      type: "request",
      status: "pending",
    },
  ];

  const getStatCardColors = (color: string) => {
    const colors = {
      blue: {
        bg: "bg-gradient-to-br from-blue-50 to-blue-100",
        iconBg: "bg-blue-500",
      },
      green: {
        bg: "bg-gradient-to-br from-green-50 to-green-100",
        iconBg: "bg-green-500",
      },
      purple: {
        bg: "bg-gradient-to-br from-purple-50 to-purple-100",
        iconBg: "bg-purple-500",
      },
      orange: {
        bg: "bg-gradient-to-br from-orange-50 to-orange-100",
        iconBg: "bg-orange-500",
      },
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemStats.map((stat, index) => {
          const colors = getStatCardColors(stat.color);
          return (
            <Card
              key={index}
              className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          stat.changeType === "increase"
                            ? "text-green-600 bg-green-100"
                            : "text-red-600 bg-red-100"
                        }`}
                      >
                        {stat.change}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${colors.iconBg} shadow-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div
                  className={`absolute inset-0 ${colors.bg} opacity-20 -z-10`}
                />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Approvals - Takes 2/3 width */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <UserCheck className="h-5 w-5 text-white" />
                  </div>
                  Pending Organization Approvals
                  <Badge variant="destructive" className="ml-2">
                    {pendingOrganizations.length} pending
                  </Badge>
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchPendingOrganizations}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {pendingOrganizations.map((org) => (
                  <div
                    key={org.id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {org.name}
                          </h4>
                          <Badge variant="outline">{org.type}</Badge>
                          <Badge variant="secondary">{org.plan}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Admin:{" "}
                          <span className="font-medium">{org.admin}</span> •{" "}
                          {org.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          Requested {org.requested}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApproveOrg(org.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRejectOrg(org.id)}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health - Takes 1/3 width */}
        <div className="space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-green-500 rounded-lg">
                  <MonitorSpeaker className="h-5 w-5 text-white" />
                </div>
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {systemHealth.map((service, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {service.name}
                      </span>
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Uptime: {service.uptime}%</span>
                        <span>Load: {service.load}%</span>
                      </div>
                      <Progress value={service.uptime} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-violet-50">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-auto p-4 flex-col gap-2"
                  onClick={handleNewOrg}
                >
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">New Org</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex-col gap-2"
                  onClick={handleManageUsers}
                >
                  <Users className="h-5 w-5" />
                  <span className="text-xs">Manage Users</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex-col gap-2"
                  onClick={handleSettings}
                >
                  <Settings className="h-5 w-5" />
                  <span className="text-xs">Settings</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto p-4 flex-col gap-2"
                  onClick={handleReports}
                >
                  <BarChart3 className="h-5 w-5" />
                  <span className="text-xs">Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b bg-gradient-to-r from-orange-50 to-amber-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
              Recent System Activity
            </CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-2 rounded-full flex-shrink-0 ${
                      activity.status === "success"
                        ? "bg-green-100"
                        : activity.status === "warning"
                        ? "bg-yellow-100"
                        : activity.status === "info"
                        ? "bg-blue-100"
                        : "bg-gray-100"
                    }`}
                  >
                    {activity.type === "approval" && (
                      <UserCheck className="h-4 w-4 text-green-600" />
                    )}
                    {activity.type === "system" && (
                      <Server className="h-4 w-4 text-blue-600" />
                    )}
                    {activity.type === "security" && (
                      <Shield className="h-4 w-4 text-red-600" />
                    )}
                    {activity.type === "request" && (
                      <Bell className="h-4 w-4 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.details}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>By {activity.user}</span>
                      <span>•</span>
                      <span>{activity.time}</span>
                    </div>
                  </div>
                  <Badge
                    variant={
                      activity.status === "success" ? "default" : "secondary"
                    }
                    className={
                      activity.status === "success"
                        ? "bg-green-100 text-green-700"
                        : activity.status === "warning"
                        ? "bg-yellow-100 text-yellow-700"
                        : activity.status === "info"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }
                  >
                    {activity.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderOrganizations = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">
          Organizations Management
        </h2>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Organization
        </Button>
      </div>

      {/* Organizations Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">
                  Total Organizations
                </p>
                <p className="text-2xl font-bold text-text-primary">24</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">
                  Active Organizations
                </p>
                <p className="text-2xl font-bold text-text-primary">21</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">
                  Pending Approval
                </p>
                <p className="text-2xl font-bold text-text-primary">3</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations List */}
      <Card>
        <CardHeader className="border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              All Organizations
              <Badge variant="secondary" className="ml-2">
                {allOrganizations.length} total
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchAllOrganizations}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {allOrganizations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No organizations found</p>
            </div>
          ) : (
            <div className="divide-y">
              {allOrganizations.map((org: Organization) => (
                <div
                  key={org.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {org.name}
                        </h4>
                        <Badge
                          variant={
                            org.status === "approved"
                              ? "default"
                              : org.status === "pending"
                              ? "destructive"
                              : org.status === "suspended"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {org.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        Admin: <span className="font-medium">{org.admin}</span>{" "}
                        • {org.email}
                      </p>
                      <p className="text-sm text-gray-500 mb-2">
                        Created: {org.created} • Users: {org.userCount}
                      </p>
                      <div className="text-sm text-gray-500">
                        <p>Address: {org.address}</p>
                        <p>Phone: {org.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOrgDetails(org)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      {org.status === "approved" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-yellow-600 hover:text-yellow-700"
                          onClick={() => handleSuspendOrg(org.id)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          Suspend
                        </Button>
                      )}
                      {org.status === "suspended" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleReactivateOrg(org.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-text-primary">System Users</h2>
        <Button className="bg-primary hover:bg-primary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Users Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">
                  Total Users
                </p>
                <p className="text-2xl font-bold text-text-primary">12,847</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">
                  Super Admins
                </p>
                <p className="text-2xl font-bold text-text-primary">5</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">
                  Org Admins
                </p>
                <p className="text-2xl font-bold text-text-primary">24</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">
                  Active Today
                </p>
                <p className="text-2xl font-bold text-text-primary">1,456</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-text-primary">John Smith</p>
                <p className="text-sm text-text-secondary">
                  super_admin • Last login: 2 hours ago
                </p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-text-primary">Sarah Johnson</p>
                <p className="text-sm text-text-secondary">
                  org_admin • Cambridge University • Last login: 1 day ago
                </p>
              </div>
              <Badge variant="secondary">Offline</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium text-text-primary">Mike Wilson</p>
                <p className="text-sm text-text-secondary">
                  finance_manager • Roosevelt High • Last login: 3 hours ago
                </p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSystemHealth = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text-primary">System Health</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {systemHealth.map((service, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-text-primary">
                {service.name}
                <Badge className={getStatusColor(service.status)}>
                  {service.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-secondary">Uptime</span>
                    <span className="text-text-primary">{service.uptime}%</span>
                  </div>
                  <Progress value={service.uptime} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-secondary">Load</span>
                    <span className="text-text-primary">{service.load}%</span>
                  </div>
                  <Progress value={service.load} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text-primary">Security Center</h2>

      {/* Security Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">
                  Security Alerts
                </p>
                <p className="text-2xl font-bold text-text-primary">3</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">
                  Failed Logins
                </p>
                <p className="text-2xl font-bold text-text-primary">12</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Bell className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">
                  Active Sessions
                </p>
                <p className="text-2xl font-bold text-text-primary">1,234</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity
              .filter((activity) => activity.type === "security")
              .map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Shield className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <p className="font-medium text-text-primary">
                        {activity.action}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {activity.details}
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive">{activity.status}</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-text-primary">Global Settings</h2>

      {/* Settings Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Maintenance Mode</span>
              <Badge variant="secondary">Disabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Auto Backups</span>
              <Badge variant="default">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Email Notifications</span>
              <Badge variant="default">Enabled</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Connection Pool</span>
              <Badge variant="default">20/50</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Cache Status</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-secondary">Last Backup</span>
              <Badge variant="secondary">2 hours ago</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case "organizations":
        return renderOrganizations();
      case "users":
        return renderUsers();
      case "system":
        return renderSystemHealth();
      case "security":
        return renderSecurity();
      case "settings":
        return renderSettings();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-content-bg">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {isMobile && (
            <Button variant="ghost" size="sm" onClick={toggleSidebar}>
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-text-primary">
              Super Admin Portal
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-text-secondary">
            Welcome, {user?.first_name}
          </span>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Custom SuperAdmin Sidebar */}
        <aside
          className={`
          fixed left-0 top-16 bottom-0 z-30 bg-white border-r border-gray-200 transition-all duration-300
          ${
            isMobile
              ? sidebarOpen
                ? "translate-x-0"
                : "-translate-x-full"
              : "translate-x-0"
          }
          ${sidebarCollapsed ? "w-16" : "w-64"}
        `}
        >
          {/* Sidebar Content */}
          <div className="p-4">
            {!isMobile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleCollapse}
                className="w-full mb-4 justify-center"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            )}

            <nav className="space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setCurrentView(item.value)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                    currentView === item.value
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:bg-gray-50 hover:text-text-primary"
                  }`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-20"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main
          className={`flex-1 p-3 sm:p-4 lg:p-6 transition-all duration-300 ${getMainMargin()}`}
        >
          {/* Welcome Section */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
              Super Admin Dashboard
            </h1>
            <p className="text-sm sm:text-base text-text-secondary">
              Manage your entire system from the Super Admin dashboard.
            </p>
          </div>

          {/* Main Content */}
          {renderContent()}
        </main>
      </div>

      {/* New Organization Modal */}
      <Dialog open={showNewOrgModal} onOpenChange={setShowNewOrgModal}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Organization</DialogTitle>
            <DialogDescription>
              Add a new school or organization to the system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateOrg} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization Name</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter organization name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                name="type"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type</option>
                <option value="School">School</option>
                <option value="University">University</option>
                <option value="Institute">Institute</option>
                <option value="Academy">Academy</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan</label>
              <select
                name="plan"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select plan</option>
                <option value="Basic">Basic</option>
                <option value="Pro">Pro</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Email</label>
              <input
                type="email"
                name="adminEmail"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Name</label>
              <input
                type="text"
                name="adminName"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter admin name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <input
                type="text"
                name="address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter organization address"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <input
                type="tel"
                name="phone"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter phone number"
              />
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowNewOrgModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                Create Organization
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* User Management Modal */}
      <Dialog
        open={showUserManagementModal}
        onOpenChange={setShowUserManagementModal}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>User Management</DialogTitle>
            <DialogDescription>
              Manage system users and their roles.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">System Users</h4>
              <Button size="sm">Add User</Button>
            </div>
            <div className="border rounded-lg p-4">
              <p className="text-sm text-gray-600">
                User management functionality will be implemented here.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>System Settings</DialogTitle>
            <DialogDescription>
              Configure system-wide settings and preferences.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">System Name</label>
              <input
                type="text"
                defaultValue="Vertex ERP System"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Default Organization Type
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="School">School</option>
                <option value="University">University</option>
                <option value="Institute">Institute</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowSettingsModal(false)}
              >
                Cancel
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Save Settings
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reports Modal */}
      <Dialog open={showReportsModal} onOpenChange={setShowReportsModal}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>System Reports</DialogTitle>
            <DialogDescription>
              Generate and view system-wide reports and analytics.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="p-4 h-auto flex-col gap-2">
                <BarChart3 className="h-6 w-6" />
                <span>Usage Analytics</span>
              </Button>
              <Button variant="outline" className="p-4 h-auto flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>User Statistics</span>
              </Button>
              <Button variant="outline" className="p-4 h-auto flex-col gap-2">
                <Building2 className="h-6 w-6" />
                <span>Organization Report</span>
              </Button>
              <Button variant="outline" className="p-4 h-auto flex-col gap-2">
                <Database className="h-6 w-6" />
                <span>System Health</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
