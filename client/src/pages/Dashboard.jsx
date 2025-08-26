import { Link, Outlet, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white flex flex-col p-4">
        <div className="text-xl font-bold mb-8">
          My App
        </div>
        <nav className="flex-1 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center p-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            Dashboard
          </Link>
          <Link
            to="/dashboard/products"
            className="flex items-center p-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            Products
          </Link>
          <Link
            to="/dashboard/settings"
            className="flex items-center p-2 rounded-md hover:bg-gray-700 transition-colors duration-200"
          >
            Settings
          </Link>
        </nav>
        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full p-2 bg-red-500 rounded-md hover:bg-red-600 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;