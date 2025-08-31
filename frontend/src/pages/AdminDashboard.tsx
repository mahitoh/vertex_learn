import { useState } from "react";
import {
  Users,
  UserCheck,
  Calendar,
  DollarSign,
  Home,
  Shield,
  UserCog,
  Briefcase,
  BarChart3,
  Building,
  Bell,
  Settings,
  Search,
  Eye,
  Check,
  X,
  ChevronDown
} from "lucide-react";

// Self-contained Button component
const Button = ({ children, onClick, variant = "default", size = "default", className = "", disabled = false, ...props }: any) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";
  
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
    ghost: "hover:bg-gray-100 text-gray-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    blue: "bg-blue-500 text-white hover:bg-blue-600"
  };
  
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-8 px-3 text-xs rounded-md",
    lg: "h-11 px-8 rounded-md"
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

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState('dashboard');

  const menuItems = [
    { name: "Dashboard Home", view: "dashboard", icon: Home },
    { name: "User Verification", view: "verification", icon: UserCheck },
    { name: "System Access", view: "system", icon: Shield },
    { name: "Employee Management", view: "employees", icon: UserCog },
    { name: "Payroll", view: "payroll", icon: DollarSign },
    { name: "Leave Management", view: "leave", icon: Calendar },
    { name: "Performance Tracking", view: "performance", icon: BarChart3 },
    { name: "Asset Management", view: "assets", icon: Building },
    { name: "Notifications", view: "notifications", icon: Bell },
    { name: "Settings", view: "settings", icon: Settings },
  ];

  const stats = [
    {
      title: "Total Users",
      value: "1,247",
      subtitle: "856 verified • 391 pending",
      icon: Users,
      bgColor: "bg-blue-500",
      iconBg: "bg-blue-600"
    },
    {
      title: "Pending Verifications",
      value: "23",
      subtitle: "12 staff • 8 teachers • 3 students",
      icon: UserCheck,
      bgColor: "bg-orange-500",
      iconBg: "bg-orange-600"
    },
    {
      title: "Pending Leave Requests",
      value: "15",
      subtitle: "5 urgent approvals needed",
      icon: Calendar,
      bgColor: "bg-green-500",
      iconBg: "bg-green-600"
    },
    {
      title: "Payroll Due",
      value: "5 days",
      subtitle: "Next cycle: Sep 1, 2025",
      icon: DollarSign,
      bgColor: "bg-purple-500",
      iconBg: "bg-purple-600"
    }
  ];

  const verificationQueue = [
    {
      name: "Sarah Johnson",
      id: "EMP001",
      role: "Teacher",
      submitted: "2025-08-28",
      roleColor: "text-blue-600"
    },
    {
      name: "Mike Chen",
      id: "STF002",
      role: "Staff",
      submitted: "2025-08-27",
      roleColor: "text-green-600"
    },
    {
      name: "Emily Rodriguez",
      id: "TCH003",
      role: "Teacher",
      submitted: "2025-08-26",
      roleColor: "text-blue-600"
    },
    {
      name: "David Kim",
      id: "STU004",
      role: "Student",
      submitted: "2025-08-25",
      roleColor: "text-purple-600"
    }
  ];

  const quickActions = [
    {
      title: "Verify User",
      subtitle: "Process pending verifications",
      icon: UserCheck,
      iconColor: "text-blue-500"
    },
    {
      title: "Manage Roles",
      subtitle: "Update user permissions",
      icon: Shield,
      iconColor: "text-green-500"
    },
    {
      title: "Generate Payroll",
      subtitle: "Process monthly payments",
      icon: DollarSign,
      iconColor: "text-purple-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white flex flex-col">
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
        <nav className="flex-1 py-6">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setCurrentView(item.view)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                currentView === item.view 
                  ? 'bg-slate-700 text-white border-r-2 border-orange-500' 
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="text-sm">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Administration & Human Resource Dashboard</h1>
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
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">3</span>
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">HR / Claude</div>
                  <div className="text-xs text-gray-500">Admin</div>
                </div>
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">C</span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6">
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                  <Card key={index} className={`${stat.bgColor} text-white p-6 relative overflow-hidden`}>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-white/80 text-sm font-medium">{stat.title}</p>
                          <p className="text-2xl font-bold text-white">{stat.value}</p>
                        </div>
                        <div className={`${stat.iconBg} p-3 rounded-lg`}>
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <p className="text-white/70 text-xs">{stat.subtitle}</p>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Verification Queue */}
                <div className="lg:col-span-2">
                  <Card className="bg-white p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="h-5 w-5 text-orange-500" />
                        <h2 className="text-lg font-semibold text-gray-900">Verification Queue</h2>
                      </div>
                      <Button variant="blue" size="sm">
                        View All
                      </Button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">NAME</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ID</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ROLE</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">SUBMITTED</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {verificationQueue.map((user, index) => (
                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-4 px-4">
                                <div className="font-medium text-gray-900">{user.name}</div>
                              </td>
                              <td className="py-4 px-4 text-gray-600">{user.id}</td>
                              <td className="py-4 px-4">
                                <span className={`${user.roleColor} font-medium`}>{user.role}</span>
                              </td>
                              <td className="py-4 px-4 text-gray-600">{user.submitted}</td>
                              <td className="py-4 px-4">
                                <div className="flex items-center space-x-2">
                                  <button className="p-1 text-gray-400 hover:text-blue-600">
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <button className="p-1 text-gray-400 hover:text-green-600">
                                    <Check className="h-4 w-4" />
                                  </button>
                                  <button className="p-1 text-gray-400 hover:text-red-600">
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div>
                  <Card className="bg-white p-6">
                    <div className="flex items-center space-x-2 mb-6">
                      <Settings className="h-5 w-5 text-gray-600" />
                      <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                    </div>

                    <div className="space-y-4">
                      {quickActions.map((action, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                          <div className={`p-2 rounded-lg bg-gray-100`}>
                            <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{action.title}</div>
                            <div className="text-sm text-gray-500">{action.subtitle}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* System Alerts */}
                    <div className="mt-8">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <h3 className="font-medium text-gray-900">System Alerts</h3>
                        </div>
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {currentView !== 'dashboard' && (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-600">This section is under development.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;