
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, Filter } from "lucide-react";
import { useBusinessType } from "@/contexts/BusinessTypeContext";
import { useBranch } from "@/contexts/BranchContext";
import { useToast } from "@/hooks/use-toast";

const dailySalesData = [
  { day: "Mon", sales: 1200, orders: 45, deletedOrders: 2, updatedOrders: 8 },
  { day: "Tue", sales: 1800, orders: 62, deletedOrders: 1, updatedOrders: 12 },
  { day: "Wed", sales: 1500, orders: 58, deletedOrders: 3, updatedOrders: 9 },
  { day: "Thu", sales: 2200, orders: 78, deletedOrders: 0, updatedOrders: 15 },
  { day: "Fri", sales: 2800, orders: 95, deletedOrders: 4, updatedOrders: 18 },
  { day: "Sat", sales: 3200, orders: 112, deletedOrders: 2, updatedOrders: 22 },
  { day: "Sun", sales: 2900, orders: 105, deletedOrders: 1, updatedOrders: 16 }
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

const hourlyData = [
  { hour: "6AM", orders: 5 },
  { hour: "8AM", orders: 15 },
  { hour: "10AM", orders: 25 },
  { hour: "12PM", orders: 45 },
  { hour: "2PM", orders: 35 },
  { hour: "4PM", orders: 20 },
  { hour: "6PM", orders: 55 },
  { hour: "8PM", orders: 65 },
  { hour: "10PM", orders: 40 }
];

export const Analytics = () => {
  const { selectedBusinessType } = useBusinessType();
  const { branches } = useBranch();
  const { toast } = useToast();
  const [selectedMetric, setSelectedMetric] = useState("sales");
  const [selectedProduct, setSelectedProduct] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [dateRange, setDateRange] = useState("week");

  const businessTerms = selectedBusinessType?.terminology || {
    service: 'Product',
    services: 'Products'
  };

  const productData = getProductData(selectedBusinessType?.id);

  const exportReport = () => {
    const reportData = {
      metric: selectedMetric,
      product: selectedProduct,
      branch: selectedBranch,
      dateRange: dateRange,
      data: dailySalesData
    };

    const csvContent = [
      ["Date", "Sales", "Orders", "Deleted Orders", "Updated Orders"],
      ...dailySalesData.map(item => [
        item.day,
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
    a.download = `analytics-report-${selectedMetric}-${Date.now()}.csv`;
    a.click();
    toast({ title: "Report exported successfully!" });
  };

  const getMetricData = () => {
    switch (selectedMetric) {
      case "sales":
        return dailySalesData.map(d => ({ ...d, value: d.sales }));
      case "orders":
        return dailySalesData.map(d => ({ ...d, value: d.orders }));
      case "deletedOrders":
        return dailySalesData.map(d => ({ ...d, value: d.deletedOrders }));
      case "updatedOrders":
        return dailySalesData.map(d => ({ ...d, value: d.updatedOrders }));
      default:
        return dailySalesData.map(d => ({ ...d, value: d.sales }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-gray-400">Comprehensive business analytics and insights</p>
        </div>
        <Button onClick={exportReport} className="bg-green-600 hover:bg-green-700">
          <Download size={16} className="mr-2" />
          Export Report
        </Button>
      </div>

      {/* Dynamic Filters */}
      <Card className="bg-gray-800 border-gray-700 p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Filter size={16} className="text-gray-400" />
            <span className="text-white font-medium">Filters:</span>
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
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">$15,847</div>
            <div className="text-gray-400">Today's Revenue</div>
            <div className="text-green-400 text-sm mt-1">+12.5%</div>
          </div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">287</div>
            <div className="text-gray-400">Orders Today</div>
            <div className="text-blue-400 text-sm mt-1">+8.2%</div>
          </div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">12</div>
            <div className="text-gray-400">Deleted Orders</div>
            <div className="text-red-400 text-sm mt-1">-2.1%</div>
          </div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">89</div>
            <div className="text-gray-400">Updated Orders</div>
            <div className="text-orange-400 text-sm mt-1">+5.3%</div>
          </div>
        </Card>
      </div>

      {/* Dynamic Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getMetricData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Bar dataKey="value" fill="#10B981" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{businessTerms.services} Distribution</h3>
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

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Hourly Order Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="hour" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Order Management Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Bar dataKey="deletedOrders" fill="#EF4444" radius={4} />
              <Bar dataKey="updatedOrders" fill="#3B82F6" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};
