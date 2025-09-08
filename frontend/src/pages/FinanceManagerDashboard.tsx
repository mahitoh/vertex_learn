import React, { useState } from "react";
import { useUser } from "@/contexts/UserContext";
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  PieChart,
  Users,
  Target,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/dashboard/Header";
import SlidingSidebar from "@/components/dashboard/SlidingSidebar";
import { useSidebar } from "@/contexts/SidebarContext";
import { useIsMobile } from "@/hooks/use-mobile";

export default function FinanceManagerDashboard() {
  const { user } = useUser();
  const isMobile = useIsMobile();
  const { sidebarOpen, sidebarCollapsed } = useSidebar();
  const [currentView, setCurrentView] = useState("dashboard");

  const menuItems = [
    { icon: PieChart, label: "Financial Overview", value: "dashboard" },
    { icon: DollarSign, label: "Revenue Management", value: "revenue" },
    { icon: CreditCard, label: "Fee Collection", value: "fees" },
    { icon: Target, label: "Marketing Campaigns", value: "marketing" },
    { icon: TrendingUp, label: "Analytics & Reports", value: "analytics" },
    { icon: FileText, label: "Financial Reports", value: "reports" },
  ];

  const financialStats = [
    {
      title: "Total Revenue",
      value: "$2,847,320",
      icon: DollarSign,
      trend: "+12.5% from last month",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Outstanding Fees",
      value: "$184,560",
      icon: AlertCircle,
      trend: "-8.2% from last month",
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Marketing ROI",
      value: "324%",
      icon: TrendingUp,
      trend: "+45% campaign efficiency",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "New Enrollments",
      value: "156",
      icon: Users,
      trend: "This month",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const recentTransactions = [
    {
      student: "John Smith",
      amount: "$2,500",
      type: "Tuition Fee",
      status: "completed",
      date: "2024-03-15",
    },
    {
      student: "Sarah Johnson",
      amount: "$500",
      type: "Lab Fee",
      status: "pending",
      date: "2024-03-14",
    },
    {
      student: "Mike Wilson",
      amount: "$3,200",
      type: "Annual Fee",
      status: "completed",
      date: "2024-03-14",
    },
    {
      student: "Emily Brown",
      amount: "$750",
      type: "Materials Fee",
      status: "overdue",
      date: "2024-03-10",
    },
  ];

  const marketingCampaigns = [
    {
      name: "Summer Enrollment Drive",
      budget: "$15,000",
      spent: "$12,300",
      leads: 324,
      conversions: 67,
      roi: "445%",
      status: "active",
    },
    {
      name: "Digital Marketing Push",
      budget: "$8,500",
      spent: "$8,500",
      leads: 156,
      conversions: 23,
      roi: "156%",
      status: "completed",
    },
    {
      name: "Open House Campaign",
      budget: "$5,000",
      spent: "$3,200",
      leads: 89,
      conversions: 34,
      roi: "267%",
      status: "active",
    },
  ];

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{stat.trend}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{transaction.student}</h4>
                    <p className="text-sm text-gray-600">{transaction.type}</p>
                    <p className="text-xs text-gray-500">{transaction.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{transaction.amount}</p>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        transaction.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : transaction.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Marketing Campaigns */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Marketing Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketingCampaigns.map((campaign, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{campaign.name}</h4>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        campaign.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">
                        Budget:{" "}
                        <span className="font-medium">{campaign.budget}</span>
                      </p>
                      <p className="text-gray-600">
                        Spent:{" "}
                        <span className="font-medium">{campaign.spent}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">
                        Leads:{" "}
                        <span className="font-medium">{campaign.leads}</span>
                      </p>
                      <p className="text-gray-600">
                        ROI:{" "}
                        <span className="font-medium text-green-600">
                          {campaign.roi}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderRevenue = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Revenue Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Revenue management interface will be implemented here.
          </p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900">
              Features to implement:
            </h3>
            <ul className="mt-2 text-sm text-blue-700 space-y-1">
              <li>• Monthly revenue tracking</li>
              <li>• Fee structure management</li>
              <li>• Revenue forecasting</li>
              <li>• Payment method analytics</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return renderDashboard();
      case "revenue":
        return renderRevenue();
      case "fees":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Fee Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Fee collection management coming soon...
              </p>
            </CardContent>
          </Card>
        );
      case "marketing":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Marketing Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Marketing campaign management coming soon...
              </p>
            </CardContent>
          </Card>
        );
      case "analytics":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Analytics dashboard coming soon...
              </p>
            </CardContent>
          </Card>
        );
      case "reports":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Financial reports coming soon...</p>
            </CardContent>
          </Card>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <SlidingSidebar
          menuItems={menuItems}
          activeItem={currentView}
          onItemClick={setCurrentView}
        />
        <main
          className={`flex-1 transition-all duration-300 ${
            isMobile
              ? "ml-0"
              : sidebarCollapsed
              ? "ml-16"
              : sidebarOpen
              ? "ml-64"
              : "ml-16"
          }`}
        >
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Finance & Marketing Dashboard
              </h1>
              <p className="text-gray-600">
                Financial management and marketing analytics for{" "}
                {user?.organizationName || "your organization"}
              </p>
            </div>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
