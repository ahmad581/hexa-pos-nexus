import { useState } from "react";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { DollarSign, ShoppingBag, Users, TrendingUp, Download, Filter } from "lucide-react";
import { useBusinessType } from "@/contexts/BusinessTypeContext";
import { useBranch } from "@/contexts/BranchContext";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/contexts/TranslationContext";

// Data type definitions
type BaseDataItem = {
  period: string;
  sales: number;
  orders: number;
  deletedOrders: number;
  updatedOrders: number;
  burgers: number;
  pizza: number;
  drinks: number;
};

type ProcessedDataItem = BaseDataItem & {
  value: number;
};

// Comprehensive dummy data for different time periods and metrics
const allTimeData = [
  { period: "Jan", sales: 4000, orders: 240, deletedOrders: 8, updatedOrders: 45, burgers: 120, pizza: 80, drinks: 40 },
  { period: "Feb", sales: 3000, orders: 198, deletedOrders: 5, updatedOrders: 32, burgers: 90, pizza: 70, drinks: 38 },
  { period: "Mar", sales: 5000, orders: 300, deletedOrders: 12, updatedOrders: 58, burgers: 150, pizza: 90, drinks: 60 },
  { period: "Apr", sales: 4500, orders: 270, deletedOrders: 7, updatedOrders: 41, burgers: 135, pizza: 85, drinks: 50 },
  { period: "May", sales: 6000, orders: 350, deletedOrders: 15, updatedOrders: 67, burgers: 175, pizza: 105, drinks: 70 },
  { period: "Jun", sales: 5500, orders: 320, deletedOrders: 9, updatedOrders: 52, burgers: 160, pizza: 95, drinks: 65 }
];

const monthlyData = [
  { period: "Week 1", sales: 1200, orders: 80, deletedOrders: 3, updatedOrders: 12, burgers: 40, pizza: 25, drinks: 15 },
  { period: "Week 2", sales: 1800, orders: 120, deletedOrders: 2, updatedOrders: 18, burgers: 60, pizza: 35, drinks: 25 },
  { period: "Week 3", sales: 1500, orders: 100, deletedOrders: 4, updatedOrders: 15, burgers: 50, pizza: 30, drinks: 20 },
  { period: "Week 4", sales: 1700, orders: 110, deletedOrders: 1, updatedOrders: 16, burgers: 55, pizza: 32, drinks: 23 }
];

const weeklyData = [
  { period: "Mon", sales: 1200, orders: 45, deletedOrders: 2, updatedOrders: 8, burgers: 22, pizza: 13, drinks: 10 },
  { period: "Tue", sales: 1800, orders: 62, deletedOrders: 1, updatedOrders: 12, burgers: 31, pizza: 18, drinks: 13 },
  { period: "Wed", sales: 1500, orders: 58, deletedOrders: 3, updatedOrders: 9, burgers: 29, pizza: 16, drinks: 13 },
  { period: "Thu", sales: 2200, orders: 78, deletedOrders: 0, updatedOrders: 15, burgers: 39, pizza: 22, drinks: 17 },
  { period: "Fri", sales: 2800, orders: 95, deletedOrders: 4, updatedOrders: 18, burgers: 47, pizza: 28, drinks: 20 },
  { period: "Sat", sales: 3200, orders: 112, deletedOrders: 2, updatedOrders: 22, burgers: 56, pizza: 32, drinks: 24 },
  { period: "Sun", sales: 2900, orders: 105, deletedOrders: 1, updatedOrders: 16, burgers: 52, pizza: 30, drinks: 23 }
];

const getProductData = (businessType?: string) => {
  switch (businessType) {
    case 'restaurant':
      return [
        { name: "Burgers", value: 35, color: "#10B981" },
        { name: "Pizza", value: 25, color: "#3B82F6" },
        { name: "Drinks", value: 20, color: "#F59E0B" },
        { name: "Desserts", value: 15, color: "#EF4444" },
        { name: "Others", value: 5, color: "#8B5CF6" }
      ];
    case 'hair-salon':
      return [
        { name: "Haircuts", value: 40, color: "#10B981" },
        { name: "Coloring", value: 30, color: "#3B82F6" },
        { name: "Styling", value: 20, color: "#F59E0B" },
        { name: "Treatments", value: 10, color: "#EF4444" }
      ];
    case 'hotel':
      return [
        { name: "Standard Rooms", value: 45, color: "#10B981" },
        { name: "Deluxe Rooms", value: 30, color: "#3B82F6" },
        { name: "Suites", value: 15, color: "#F59E0B" },
        { name: "Services", value: 10, color: "#EF4444" }
      ];
    default:
      return [
        { name: "Product A", value: 40, color: "#10B981" },
        { name: "Product B", value: 30, color: "#3B82F6" },
        { name: "Product C", value: 20, color: "#F59E0B" },
        { name: "Product D", value: 10, color: "#EF4444" }
      ];
  }
};

const recentTransactions = [
  { id: "TR-001-12345", product: "Burger Deluxe", amount: "$14", status: "Completed", date: "Dec 12, 2023" },
  { id: "TR-002-12346", product: "Pizza Margherita", amount: "$24", status: "Pending", date: "Dec 12, 2023" },
  { id: "TR-003-12347", product: "Pasta Carbonara", amount: "$18", status: "Completed", date: "Dec 11, 2023" },
  { id: "TR-004-12348", product: "Caesar Salad", amount: "$12", status: "Completed", date: "Dec 11, 2023" }
];

export const Dashboard = () => {
  const { selectedBusinessType } = useBusinessType();
  const { branches } = useBranch();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [selectedMetric, setSelectedMetric] = useState("sales");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [dateRange, setDateRange] = useState("week");

  const businessTerms = selectedBusinessType?.terminology || {
    service: 'Product',
    services: 'Products'
  };

  const productData = getProductData(selectedBusinessType?.id);

  const getData = (): BaseDataItem[] => {
    switch (dateRange) {
      case "year": return allTimeData;
      case "month": return monthlyData;
      case "week": return weeklyData;
      default: return weeklyData;
    }
  };

  const getFilteredData = (): ProcessedDataItem[] => {
    let data = getData();
    
    // Filter by selected product and add value property
    if (selectedProduct !== "all") {
      const productKey = selectedProduct.toLowerCase() as keyof BaseDataItem;
      return data.map(item => ({
        ...item,
        value: typeof item[productKey] === 'number' ? item[productKey] as number : 0
      }));
    } else {
      // Use the selected metric and add value property
      const metricKey = selectedMetric as keyof BaseDataItem;
      return data.map(item => ({
        ...item,
        value: typeof item[metricKey] === 'number' ? item[metricKey] as number : 0
      }));
    }
  };

  const exportReport = () => {
    const reportData = getFilteredData();
    const csvContent = [
      ["Period", "Value", "Sales", "Orders", "Deleted Orders", "Updated Orders"],
      ...reportData.map(item => [
        item.period,
        item.value,
        item.sales,
        item.orders,
        item.deletedOrders,
        item.updatedOrders
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-report-${selectedMetric}-${selectedProduct}-${dateRange}-${Date.now()}.csv`;
    a.click();
    toast({ title: "Dashboard report exported successfully!" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('dashboard.title')}</h1>
          <p className="text-gray-400">{t('dashboard.overview')}</p>
        </div>
        <Button onClick={exportReport} className="bg-green-600 hover:bg-green-700">
          <Download size={16} className="mr-2" />
          Export Report
        </Button>
      </div>

      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-white font-medium">Analytics Filters:</span>
          </div>
          
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-48 bg-gray-700 border-gray-600">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="sales">Sales Revenue</SelectItem>
              <SelectItem value="orders">Total Orders</SelectItem>
              <SelectItem value="deletedOrders">Deleted Orders</SelectItem>
              <SelectItem value="updatedOrders">Updated Orders</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedProduct} onValueChange={setSelectedProduct}>
            <SelectTrigger className="w-48 bg-gray-700 border-gray-600">
              <SelectValue placeholder={`Select ${businessTerms.service.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All {businessTerms.services}</SelectItem>
              {productData.map(product => (
                <SelectItem key={product.name} value={product.name.toLowerCase()}>
                  {product.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-48 bg-gray-700 border-gray-600">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map(branch => (
                <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48 bg-gray-700 border-gray-600">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('dashboard.totalRevenue')}
          value="$12,234.99"
          change="+2.5%"
          changeType="increase"
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title={t('dashboard.totalOrders')}
          value="3,847"
          change="+1.8%"
          changeType="increase"
          icon={ShoppingBag}
          color="bg-blue-500"
        />
        <StatCard
          title="Deleted Orders"
          value="89"
          change="-0.5%"
          changeType="decrease"
          icon={TrendingUp}
          color="bg-red-500"
        />
        <StatCard
          title="Updated Orders"
          value="234"
          change="+5.2%"
          changeType="increase"
          icon={Users}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">
              {selectedProduct !== "all" ? selectedProduct.charAt(0).toUpperCase() + selectedProduct.slice(1) : selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Overview
            </h3>
            <div className="flex gap-2">
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="orders">Orders</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getFilteredData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="period" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Bar dataKey="value" fill="#10B981" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">{businessTerms.services} Distribution</h3>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-xs">
                <SelectValue placeholder="Branch" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all">All</SelectItem>
                {branches.slice(0, 3).map(branch => (
                  <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {productData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Sales Trend</h3>
          <div className="flex gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-32 bg-gray-700 border-gray-600 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="year">Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={getData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="period" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Latest Transactions</h3>
          <button className="text-green-400 hover:text-green-300 text-sm">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 text-gray-400 font-medium">Product</th>
                <th className="text-left py-3 text-gray-400 font-medium">Transaction ID</th>
                <th className="text-left py-3 text-gray-400 font-medium">Date</th>
                <th className="text-left py-3 text-gray-400 font-medium">Amount</th>
                <th className="text-left py-3 text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-gray-700">
                  <td className="py-3 text-white">{transaction.product}</td>
                  <td className="py-3 text-gray-300">{transaction.id}</td>
                  <td className="py-3 text-gray-300">{transaction.date}</td>
                  <td className="py-3 text-white font-semibold">{transaction.amount}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transaction.status === 'Completed' 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
