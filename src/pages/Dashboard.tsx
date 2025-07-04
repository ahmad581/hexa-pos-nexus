
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts";
import { DollarSign, ShoppingBag, Users, TrendingUp } from "lucide-react";

const salesData = [
  { month: "Jan", sales: 4000, orders: 240 },
  { month: "Feb", sales: 3000, orders: 198 },
  { month: "Mar", sales: 5000, orders: 300 },
  { month: "Apr", sales: 4500, orders: 270 },
  { month: "May", sales: 6000, orders: 350 },
  { month: "Jun", sales: 5500, orders: 320 }
];

const recentTransactions = [
  { id: "TR-001-12345", product: "Burger Deluxe", amount: "$14", status: "Completed", date: "Dec 12, 2023" },
  { id: "TR-002-12346", product: "Pizza Margherita", amount: "$24", status: "Pending", date: "Dec 12, 2023" },
  { id: "TR-003-12347", product: "Pasta Carbonara", amount: "$18", status: "Completed", date: "Dec 11, 2023" },
  { id: "TR-004-12348", product: "Caesar Salad", amount: "$12", status: "Completed", date: "Dec 11, 2023" }
];

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">The database updates process runs in the background</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Earnings"
          value="$12,234.99"
          change="+2.5%"
          changeType="increase"
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Number of Sales"
          value="3,847"
          change="+1.8%"
          changeType="increase"
          icon={ShoppingBag}
          color="bg-blue-500"
        />
        <StatCard
          title="Product Views"
          value="128,756"
          change="+5.2%"
          changeType="increase"
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <StatCard
          title="Active Users"
          value="2,543"
          change="-0.5%"
          changeType="decrease"
          icon={Users}
          color="bg-orange-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Purchase Activity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Bar dataKey="sales" fill="#10B981" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="bg-gray-800 border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Sales Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Line type="monotone" dataKey="orders" stroke="#10B981" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Transactions */}
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
