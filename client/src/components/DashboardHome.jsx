import { useState, useEffect } from "react";
import api from "../lib/axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import DateFilter from "./DateFilter";

const DashboardHome = () => {
  const [filter, setFilter] = useState("daily");
  const [summary, setSummary] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);

// In your DashboardHome component, add this:
useEffect(() => {
  const fetchData = async () => {
    try {
      const [summaryRes, bestRes, statsRes, lowStockRes] = await Promise.all([
        api.get(`/sales/summary?filter=${filter}`),
        api.get(`/sales/best-sellers?filter=${filter}`),
        api.get(`/sales/stats?filter=${filter}`),
        api.get(`/sales/low-stock`),
      ]);

      console.log("Summary:", summaryRes.data);
      console.log("Best Sellers:", bestRes.data);
      console.log("Stats:", statsRes.data);
      console.log("Low Stock:", lowStockRes.data);

      setSummary(summaryRes.data);
      setBestSellers(bestRes.data);
      setStats(statsRes.data);
      setLowStock(lowStockRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchData();
}, [filter]);

  return (
    <div className="p-6 space-y-8">
      {/* Filter */}
      <div className="flex justify-end">
        <DateFilter value={filter} onChange={setFilter} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow rounded">
          <h3 className="text-lg font-semibold">Today</h3>
          <p className="text-2xl font-bold">₦{stats?.today || 0}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h3 className="text-lg font-semibold">This Week</h3>
          <p className="text-2xl font-bold">₦{stats?.week || 0}</p>
        </div>
        <div className="p-4 bg-white shadow rounded">
          <h3 className="text-lg font-semibold">Total Revenue</h3>
          <p className="text-2xl font-bold">₦{stats?.totalRevenue || 0}</p>
        </div>
      </div>

      {/* Sales Trend (Line Chart) */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="text-xl font-semibold mb-4">Sales Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={summary}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="_id" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="totalSales" stroke="#2563eb" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Best Sellers (Bar Chart) */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="text-xl font-semibold mb-4">Best Sellers</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={bestSellers}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="totalQty" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Low Stock Table */}
      <div className="bg-white p-4 shadow rounded">
        <h2 className="text-xl font-semibold mb-4 text-red-600">⚠️ Low Stock Products</h2>
        {lowStock.length === 0 ? (
          <p className="text-gray-500">No products are below reorder level 🎉</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2">Product</th>
                <th className="py-2">Category</th>
                <th className="py-2">Quantity</th>
                <th className="py-2">Reorder Level</th>
              </tr>
            </thead>
            <tbody>
              {lowStock.map((item) => (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{item.name}</td>
                  <td className="py-2">{item.category}</td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2 text-red-600 font-semibold">{item.reorderLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
