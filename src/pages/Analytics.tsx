
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const dailySalesData = [
  { day: "Mon", sales: 1200, orders: 45 },
  { day: "Tue", sales: 1800, orders: 62 },
  { day: "Wed", sales: 1500, orders: 58 },
  { day: "Thu", sales: 2200, orders: 78 },
  { day: "Fri", sales: 2800, orders: 95 },
  { day: "Sat", sales: 3200, orders: 112 },
  { day: "Sun", sales: 2900, orders: 105 }
];

const productData = [
  { name: "Burgers", value: 35, color: "#10B981" },
  { name: "Pizza", value: 25, color: "#3B82F6" },
  { name: "Drinks", value: 20, color: "#F59E0B" },
  { name: "Desserts", value: 15, color: "#EF4444" },
  { name: "Others", value: 5, color: "#8B5CF6" }
];

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
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Daily Sales Analytics</h1>
        <p className="text-gray-400">Comprehensive sales data and insights</p>
      </div>

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
            <div className="text-3xl font-bold text-purple-400 mb-2">$55.20</div>
            <div className="text-gray-400">Avg Order Value</div>
            <div className="text-purple-400 text-sm mt-1">+3.1%</div>
          </div>
        </Card>
        <Card className="bg-gray-800 border-gray-700 p-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">94.2%</div>
            <div className="text-gray-400">Customer Satisfaction</div>
            <div className="text-orange-400 text-sm mt-1">+2.1%</div>
          </div>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Sales Overview</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Bar dataKey="sales" fill="#10B981" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Product Categories</h3>
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

      {/* Charts Row 2 */}
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
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Orders vs Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Bar dataKey="orders" fill="#3B82F6" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};
