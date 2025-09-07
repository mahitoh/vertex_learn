import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  AlertCircle,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  Users,
  Activity,
  Home,
  Receipt,
  Megaphone,
  Building,
  Bell,
  Settings,
  Search,
  ChevronDown
} from 'lucide-react';

// Mock API service (since backend tables don't exist yet)
const mockApi = {
  get: async (endpoint: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (endpoint.includes('/invoices/stats/overview')) {
      return {
        data: {
          totalRevenue: 125000,
          pendingAmount: 25000,
          pendingCount: 15,
          overdueAmount: 5000,
          overdueCount: 3,
          monthlyRevenue: [
            { month: '2024-12', revenue: 45000 },
            { month: '2024-11', revenue: 42000 },
            { month: '2024-10', revenue: 38000 }
          ]
        }
      };
    }
    
    if (endpoint.includes('/expenses/stats/overview')) {
      return {
        data: {
          totalExpenses: 85000,
          monthlyExpenses: [
            { month: '2024-12', total_amount: 28000 },
            { month: '2024-11', total_amount: 32000 },
            { month: '2024-10', total_amount: 25000 }
          ],
          expensesByCategory: [
            { category: 'Salaries', total_amount: 45000, count: 12 },
            { category: 'Utilities', total_amount: 15000, count: 8 },
            { category: 'Marketing', total_amount: 12000, count: 5 },
            { category: 'Maintenance', total_amount: 8000, count: 6 },
            { category: 'Office Supplies', total_amount: 5000, count: 15 }
          ]
        }
      };
    }
    
    if (endpoint.includes('/campaigns/stats/overview')) {
      return {
        data: {
          totalCampaigns: 8,
          activeCampaigns: 3,
          completedCampaigns: 4,
          pausedCampaigns: 1,
          totalBudget: 25000,
          totalSpent: 18500,
          totalLeads: 450,
          totalConversions: 85,
          overallROI: 125.5,
          overallConversionRate: 18.9,
          campaignsByType: [
            { campaign_type: 'Social Media', campaign_count: 3, total_spent: 8500, total_leads: 180, total_conversions: 35 },
            { campaign_type: 'Google Ads', campaign_count: 2, total_spent: 6000, total_leads: 120, total_conversions: 25 },
            { campaign_type: 'Email Marketing', campaign_count: 2, total_spent: 2500, total_leads: 100, total_conversions: 15 },
            { campaign_type: 'Event Marketing', campaign_count: 1, total_spent: 1500, total_leads: 50, total_conversions: 10 }
          ]
        }
      };
    }
    
    if (endpoint.includes('/invoices')) {
      return {
        data: [
          { id: 1, student_name: 'John Smith', amount: 1500, due_date: '2025-01-15', status: 'pending', description: 'Tuition Fee - Spring 2025' },
          { id: 2, student_name: 'Sarah Johnson', amount: 1500, due_date: '2025-01-10', status: 'paid', description: 'Tuition Fee - Spring 2025' },
          { id: 3, student_name: 'Mike Chen', amount: 750, due_date: '2025-01-20', status: 'pending', description: 'Lab Fee - Chemistry' },
          { id: 4, student_name: 'Emily Davis', amount: 2000, due_date: '2025-01-05', status: 'overdue', description: 'Tuition Fee - Spring 2025' },
          { id: 5, student_name: 'Alex Wilson', amount: 500, due_date: '2025-01-25', status: 'pending', description: 'Library Fee' }
        ]
      };
    }
    
    if (endpoint.includes('/expenses')) {
      return {
        data: [
          { id: 1, category: 'Utilities', amount: 2500, expense_date: '2024-12-01', description: 'Monthly electricity bill' },
          { id: 2, category: 'Salaries', amount: 15000, expense_date: '2024-12-01', description: 'Teacher salaries - December' },
          { id: 3, category: 'Office Supplies', amount: 800, expense_date: '2024-12-05', description: 'Stationery and printing materials' },
          { id: 4, category: 'Maintenance', amount: 1200, expense_date: '2024-12-10', description: 'HVAC system maintenance' },
          { id: 5, category: 'Marketing', amount: 3000, expense_date: '2024-12-15', description: 'Social media advertising campaign' }
        ]
      };
    }
    
    if (endpoint.includes('/campaigns')) {
      return {
        data: [
          { id: 1, name: 'Spring 2025 Enrollment Drive', campaign_type: 'Social Media', budget: 5000, spent_amount: 3200, leads_generated: 150, conversions: 25, start_date: '2024-11-01', end_date: '2025-01-31', status: 'active', roi: 125.5 },
          { id: 2, name: 'Google Ads - Computer Science Program', campaign_type: 'Google Ads', budget: 3000, spent_amount: 2100, leads_generated: 80, conversions: 12, start_date: '2024-12-01', end_date: '2025-02-28', status: 'active', roi: 95.2 },
          { id: 3, name: 'Open House Event Promotion', campaign_type: 'Event Marketing', budget: 1500, spent_amount: 1450, leads_generated: 200, conversions: 35, start_date: '2024-10-01', end_date: '2024-11-30', status: 'completed', roi: 150.8 },
          { id: 4, name: 'Email Newsletter Campaign', campaign_type: 'Email Marketing', budget: 800, spent_amount: 400, leads_generated: 500, conversions: 45, start_date: '2024-12-01', end_date: '2025-03-31', status: 'active', roi: 180.5 }
        ]
      };
    }
    
    return { data: [] };
  },

  post: async (endpoint: string, data?: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: 'Created successfully', data: { id: Math.floor(Math.random() * 1000) } };
  },

  put: async (endpoint: string, data?: any) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: 'Updated successfully' };
  },

  delete: async (endpoint: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: 'Deleted successfully' };
  }
};

// Components
const Button = ({ children, onClick, variant = "default", size = "default", className = "", disabled = false, ...props }: any) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
    ghost: "hover:bg-gray-100 text-gray-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    blue: "bg-blue-500 text-white hover:bg-blue-600",
    green: "bg-green-500 text-white hover:bg-green-600",
    red: "bg-red-500 text-white hover:bg-red-600",
    orange: "bg-orange-500 text-white hover:bg-orange-600",
    purple: "bg-purple-500 text-white hover:bg-purple-600"
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

const Card = ({ children, className = "", ...props }: any) => (
  <div className={`rounded-lg shadow-sm bg-white border border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

const MarketingFinanceDashboard = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for different data
  const [invoiceStats, setInvoiceStats] = useState<any>({});
  const [expenseStats, setExpenseStats] = useState<any>({});
  const [campaignStats, setCampaignStats] = useState<any>({});
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  const menuItems = [
    { name: "Overview", view: "overview", icon: Home },
    { name: "Invoices & Billing", view: "invoices", icon: Receipt },
    { name: "Expenses", view: "expenses", icon: CreditCard },
    { name: "Marketing Campaigns", view: "campaigns", icon: Megaphone },
    { name: "Financial Reports", view: "reports", icon: BarChart3 },
    { name: "Settings", view: "settings", icon: Settings },
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all statistics and data
      const [invoiceStatsRes, expenseStatsRes, campaignStatsRes, invoicesRes, expensesRes, campaignsRes] = await Promise.all([
        mockApi.get('/invoices/stats/overview'),
        mockApi.get('/expenses/stats/overview'),
        mockApi.get('/campaigns/stats/overview'),
        mockApi.get('/invoices?limit=10'),
        mockApi.get('/expenses?limit=10'),
        mockApi.get('/campaigns?limit=10')
      ]);

      setInvoiceStats(invoiceStatsRes.data);
      setExpenseStats(expenseStatsRes.data);
      setCampaignStats(campaignStatsRes.data);
      setInvoices(invoicesRes.data);
      setExpenses(expensesRes.data);
      setCampaigns(campaignsRes.data);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading Marketing & Finance dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-gradient-to-b from-purple-800 to-purple-900 text-white flex flex-col z-30">
        {/* Logo */}
        <div className="p-6 border-b border-purple-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">M&F</span>
            </div>
            <span className="font-semibold text-lg">Marketing & Finance</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => setCurrentView(item.view)}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${currentView === item.view
                ? 'bg-purple-700 text-white border-r-2 border-pink-400'
                : 'text-purple-200 hover:bg-purple-700 hover:text-white'
                }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              <span className="text-sm">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* Back to Main Dashboard */}
        <div className="p-6 border-t border-purple-700">
          <Button 
            variant="outline" 
            className="w-full border-purple-400 text-purple-200 hover:bg-purple-700"
            onClick={() => navigate('/admin')}
          >
            ← Back to Admin
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Marketing & Finance Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage finances, track expenses, and analyze marketing campaigns
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-80"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">2</span>
                </button>
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-3 bg-gray-50 rounded-lg px-3 py-2 hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">F</span>
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-gray-900">Finance Manager</div>
                  <div className="text-xs text-gray-500">Marketing & Finance</div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6">
          {currentView === 'overview' && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(invoiceStats.totalRevenue || 0)}
                      </p>
                    </div>
                    <div className="bg-green-600 p-3 rounded-lg">
                      <DollarSign className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-200 mr-1" />
                    <span className="text-green-100">+12.5% from last month</span>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100 text-sm font-medium">Pending Payments</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(invoiceStats.pendingAmount || 0)}
                      </p>
                    </div>
                    <div className="bg-orange-600 p-3 rounded-lg">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-orange-100">{invoiceStats.pendingCount || 0} invoices pending</span>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-r from-red-500 to-red-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm font-medium">Total Expenses</p>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(expenseStats.totalExpenses || 0)}
                      </p>
                    </div>
                    <div className="bg-red-600 p-3 rounded-lg">
                      <TrendingDown className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingDown className="h-4 w-4 text-red-200 mr-1" />
                    <span className="text-red-100">+8.2% from last month</span>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm font-medium">Marketing ROI</p>
                      <p className="text-2xl font-bold text-white">
                        {campaignStats.overallROI || 0}%
                      </p>
                    </div>
                    <div className="bg-purple-600 p-3 rounded-lg">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-purple-100">{campaignStats.totalLeads || 0} leads generated</span>
                  </div>
                </Card>
              </div>

              {/* Charts and Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue vs Expenses Chart */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Revenue vs Expenses</h3>
                    <BarChart3 className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="h-64 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-purple-400 mx-auto mb-2" />
                      <p className="text-gray-600">Revenue: {formatCurrency(invoiceStats.totalRevenue || 0)}</p>
                      <p className="text-gray-600">Expenses: {formatCurrency(expenseStats.totalExpenses || 0)}</p>
                      <p className="text-sm text-gray-500 mt-2">Net Profit: {formatCurrency((invoiceStats.totalRevenue || 0) - (expenseStats.totalExpenses || 0))}</p>
                    </div>
                  </div>
                </Card>

                {/* Marketing Campaign Performance */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
                    <Activity className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="space-y-4">
                    {campaigns.slice(0, 4).map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{campaign.name}</p>
                          <p className="text-sm text-gray-500">{campaign.campaign_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-purple-600">{campaign.roi}% ROI</p>
                          <p className="text-sm text-gray-500">{campaign.conversions} conversions</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Recent Transactions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Invoices */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
                    <Button variant="outline" size="sm" onClick={() => setCurrentView('invoices')}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {invoices.slice(0, 5).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div>
                          <p className="font-medium text-gray-900">{invoice.student_name}</p>
                          <p className="text-sm text-gray-500">{invoice.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(invoice.amount)}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Recent Expenses */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
                    <Button variant="outline" size="sm" onClick={() => setCurrentView('expenses')}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {expenses.slice(0, 5).map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div>
                          <p className="font-medium text-gray-900">{expense.category}</p>
                          <p className="text-sm text-gray-500">{expense.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(expense.amount)}</p>
                          <p className="text-sm text-gray-500">{formatDate(expense.expense_date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Other views would be implemented here */}
          {currentView !== 'overview' && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{currentView.charAt(0).toUpperCase() + currentView.slice(1)} Module</h3>
                <p className="text-gray-500">This section is under development.</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setCurrentView('overview')}
                >
                  Back to Overview
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MarketingFinanceDashboard;