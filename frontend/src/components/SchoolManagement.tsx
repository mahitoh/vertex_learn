import React, { useState, useEffect } from "react";
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
    data: NewSchoolForm | (NewAdminForm & { schoolId: number })
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

interface School {
  school_id: number;
  school_name: string;
  address: string;
  phone: string;
  email: string;
  admin_id?: number;
  admin_name?: string;
  admin_email?: string;
  admin_active?: boolean;
  teacher_count: number;
  student_count: number;
}

interface NewSchoolForm {
  schoolName: string;
  address: string;
  phone: string;
  email: string;
}

interface NewAdminForm {
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

const SchoolManagement: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateSchool, setShowCreateSchool] = useState(false);
  const [showCreateAdmin, setShowCreateAdmin] = useState<number | null>(null);

  const [newSchool, setNewSchool] = useState<NewSchoolForm>({
    schoolName: "",
    address: "",
    phone: "",
    email: "",
  });

  const [newAdmin, setNewAdmin] = useState<NewAdminForm>({
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await api.get("/schools/manage-schools");
      setSchools(response.data);
    } catch (error) {
      console.error("Error fetching schools:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post("/schools/create-school", newSchool);
      alert("School created successfully!");
      setNewSchool({ schoolName: "", address: "", phone: "", email: "" });
      setShowCreateSchool(false);
      fetchSchools(); // Refresh the list
    } catch (error) {
      console.error("Error creating school:", error);
      alert(
        `Failed to create school: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCreateAdmin) return;

    try {
      const response = await api.post("/schools/create-admin", {
        schoolId: showCreateAdmin,
        ...newAdmin,
      });
      alert("Admin created successfully!");
      setNewAdmin({ adminName: "", adminEmail: "", adminPassword: "" });
      setShowCreateAdmin(null);
      fetchSchools(); // Refresh the list
    } catch (error) {
      console.error("Error creating admin:", error);
      alert(
        `Failed to create admin: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">
            School Management
          </h2>
          <p className="text-gray-600">
            Manage schools and their administrators
          </p>
        </div>
        <button
          onClick={() => setShowCreateSchool(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Add New School</span>
        </button>
      </div>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {schools.map((school) => (
          <div
            key={school.school_id}
            className="bg-white border border-gray-200 rounded-lg p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {school.school_name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{school.teacher_count} Teachers</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="h-3 w-3" />
                      <span>{school.student_count} Students</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* School Details */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{school.address}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>{school.phone}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="h-4 w-4" />
                <span>{school.email}</span>
              </div>
            </div>

            {/* Admin Status */}
            <div className="border-t pt-4">
              {school.admin_id ? (
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-gray-900">
                        Admin: {school.admin_name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 ml-6">
                      {school.admin_email}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      school.admin_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {school.admin_active ? "Active" : "Inactive"}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-orange-600">
                    <UserCheck className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      No Admin Assigned
                    </span>
                  </div>
                  <button
                    onClick={() => setShowCreateAdmin(school.school_id)}
                    className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full hover:bg-orange-200"
                  >
                    Create Admin
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create School Modal */}
      {showCreateSchool && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New School</h3>
            <form onSubmit={handleCreateSchool} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  School Name
                </label>
                <input
                  type="text"
                  required
                  value={newSchool.schoolName}
                  onChange={(e) =>
                    setNewSchool({ ...newSchool, schoolName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  required
                  value={newSchool.address}
                  onChange={(e) =>
                    setNewSchool({ ...newSchool, address: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={newSchool.phone}
                  onChange={(e) =>
                    setNewSchool({ ...newSchool, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={newSchool.email}
                  onChange={(e) =>
                    setNewSchool({ ...newSchool, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Create School
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateSchool(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
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
            <h3 className="text-lg font-semibold mb-4">Create School Admin</h3>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Name
                </label>
                <input
                  type="text"
                  required
                  value={newAdmin.adminName}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, adminName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Email
                </label>
                <input
                  type="email"
                  required
                  value={newAdmin.adminEmail}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, adminEmail: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Temporary Password
                </label>
                <input
                  type="password"
                  required
                  value={newAdmin.adminPassword}
                  onChange={(e) =>
                    setNewAdmin({ ...newAdmin, adminPassword: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Admin should change this on first login"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                >
                  Create Admin
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateAdmin(null)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolManagement;
