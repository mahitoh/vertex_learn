import { useState, useEffect } from 'react';
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
  Activity
} from 'lucide-react';

// API service
const API_BASE_URL = 'http://localhost:3000/api';

const api = {
  get: async (endpoint: string) => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  post: async (endpoint: string, data?: any) => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  put: async (endpoint: string, data?: any) => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  },

  delete: async (endpoint: string) => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
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
    orange: "bg-orange-500 text-white hover:bg-orange-600"
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

const Tabs = ({ children, defaultValue, onValueChange }: any) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (onValueChange) onValueChange(value);
  };

  return (
    <div className="w-full">
      {children.map((child: any) => 
        child.type.displayName === 'TabsList' 
          ? { ...child, props: { ...child.props, activeTab, onTabChange: handleTabChange } }
          : child.type.displayName === 'TabsContent' && child.props.value === activeTab
          ? child
          : null
      ).filter(Boolean)}
    </div>
  );
};

const TabsList = ({ children, activeTab, onTabChange }: any) => (
  <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 mb-6">
    {children.map((child: any) => ({
      ...child,
      props: {
        ...child.props,
        isActive: child.props.value === activeTab,
        onClick: () => onTabChange(child.props.value)
      }
    }))}
  </div>
);
TabsList.displayName = 'TabsList';

const TabsTrigger = ({ children, value, isActive, onClick }: any) => (
  <button
    className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
      isActive 
        ? 'bg-white text-gray-900 shadow-sm' 
        : 'text-gray-600 hover:text-gray-900'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const TabsContent = ({ children, value }: any) => (
  <div className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
    {children}
  </div>
);
TabsContent.displayName = 'TabsContent';

const FinanceDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for different data
  const [invoiceStats, setInvoiceStats] = useState<any>({});
  const [expenseStats, setExpenseStats] = useState<any>({});
  const [campaignStats, setCampaignStats] = useState<any>({});
  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);

  // Modal states
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states
  const [invoiceForm, setInvoiceForm] = useState({
    student_id: '',
    amount: '',
    due_date: '',
    description: ''
  });

  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: '',
    description: '',
    expense_date: ''
  });

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    campaign_type: '',
    budget: '',
    start_date: '',
    end_date: '',
    description: '',
    leads_generated: '',
    conversions: '',
    spent_amount: ''
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all statistics and data
      const [invoiceStatsRes, expenseStatsRes, campaignStatsRes, invoicesRes, expensesRes, campaignsRes] = await Promise.all([
        api.get('/invoices/stats/overview'),
        api.get('/expenses/stats/overview'),
        api.get('/campaigns/stats/overview'),
        api.get('/invoices?limit=10'),
        api.get('/expenses?limit=10'),
        api.get('/campaigns?limit=10')
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

  const handleCreateInvoice = async () => {
    try {
      await api.post('/invoices', invoiceForm);
      setShowInvoiceModal(false);
      setInvoiceForm({ student_id: '', amount: '', due_date: '', description: '' });
      fetchAllData();
    } catch (err) {
      console.error('Error creating invoice:', err);
      alert('Failed to create invoice');
    }
  };

  const handleCreateExpense = async () => {
    try {
      await api.post('/expenses', expenseForm);
      setShowExpenseModal(false);
      setExpenseForm({ amount: '', category: '', description: '', expense_date: '' });
      fetchAllData();
    } catch (err) {
      console.error('Error creating expense:', err);
      alert('Failed to create expense');
    }
  };

  const handleCreateCampaign = async () => {
    try {
      await api.post('/campaigns', campaignForm);
      setShowCampaignModal(false);
      setCampaignForm({
        name: '', campaign_type: '', budget: '', start_date: '', end_date: '',
        description: '', leads_generated: '', conversions: '', spent_amount: ''
      });
      fetchAllData();
    } catch (err) {
      console.error('Error creating campaign:', err);
      alert('Failed to create campaign');
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
        <div className="text-lg text-gray-600">Loading finance dashboard...</div>
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Finance & Marketing Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Manage finances, track expenses, and analyze marketing campaigns
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="blue" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Quick Actions
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <Tabs defaultValue="overview" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="invoices">Invoices</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="campaigns">Marketing</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(invoiceStats.totalRevenue || 0)}
                      </p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-green-600">+12.5%</span>
                    <span className="text-gray-500 ml-1">from last month</span>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(invoiceStats.pendingAmount || 0)}
                      </p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-lg">
                      <CreditCard className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-gray-600">{invoiceStats.pendingCount || 0} invoices pending</span>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(expenseStats.totalExpenses || 0)}
                      </p>
                    </div>
                    <div className="bg-red-100 p-3 rounded-lg">
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-red-600">+8.2%</span>
                    <span className="text-gray-500 ml-1">from last month</span>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Marketing ROI</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {campaignStats.overallROI || 0}%
                      </p>
                    </div>
                    <div className="bg-purple-100 p-3 rounded-lg">
                      <Target className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-gray-600">{campaignStats.totalLeads || 0} leads generated</span>
                  </div>
                </Card>
              </div>

              {/* Charts and Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue vs Expenses Chart */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Revenue vs Expenses</h3>
                    <BarChart3 className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">Chart visualization would go here</p>
                      <p className="text-sm text-gray-400">Integration with Chart.js recommended</p>
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
                    {campaigns.slice(0, 5).map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{campaign.name}</p>
                          <p className="text-sm text-gray-500">{campaign.campaign_type}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{campaign.roi}% ROI</p>
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
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('invoices')}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {invoices.slice(0, 5).map((invoice) => (
                      <div key={invoice.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
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
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('expenses')}>
                      View All
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {expenses.slice(0, 5).map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
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
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Invoice Management</h2>
                <Button onClick={() => setShowInvoiceModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              </div>

              <Card className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">STUDENT</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">AMOUNT</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">DUE DATE</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">STATUS</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{invoice.student_name}</p>
                              <p className="text-sm text-gray-500">{invoice.description}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-900">
                            {formatCurrency(invoice.amount)}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {formatDate(invoice.due_date)}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                              invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {invoice.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
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
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Expense Management</h2>
                <Button onClick={() => setShowExpenseModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </div>

              <Card className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">CATEGORY</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">AMOUNT</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">DATE</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">DESCRIPTION</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {expense.category}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-900">
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {formatDate(expense.expense_date)}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {expense.description}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
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
          </TabsContent>

          {/* Marketing Campaigns Tab */}
          <TabsContent value="campaigns">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Marketing Campaigns</h2>
                <Button onClick={() => setShowCampaignModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Campaign
                </Button>
              </div>

              <Card className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">CAMPAIGN</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">TYPE</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">BUDGET</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">LEADS</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">CONVERSIONS</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ROI</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">STATUS</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 text-sm">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => (
                        <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-medium text-gray-900">{campaign.name}</p>
                              <p className="text-sm text-gray-500">{formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              {campaign.campaign_type}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-900">
                            {formatCurrency(campaign.budget)}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {campaign.leads_generated}
                          </td>
                          <td className="py-4 px-4 text-gray-600">
                            {campaign.conversions}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`font-medium ${campaign.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {campaign.roi}%
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                              campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                              campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <BarChart3 className="h-4 w-4" />
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals would go here - simplified for brevity */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create Invoice</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Student ID"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={invoiceForm.student_id}
                onChange={(e) => setInvoiceForm({...invoiceForm, student_id: e.target.value})}
              />
              <input
                type="number"
                placeholder="Amount"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={invoiceForm.amount}
                onChange={(e) => setInvoiceForm({...invoiceForm, amount: e.target.value})}
              />
              <input
                type="date"
                placeholder="Due Date"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={invoiceForm.due_date}
                onChange={(e) => setInvoiceForm({...invoiceForm, due_date: e.target.value})}
              />
              <input
                type="text"
                placeholder="Description"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={invoiceForm.description}
                onChange={(e) => setInvoiceForm({...invoiceForm, description: e.target.value})}
              />
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowInvoiceModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateInvoice}>
                Create Invoice
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Similar modals for expenses and campaigns would go here */}
    </div>
  );
};

export default FinanceDashboard;