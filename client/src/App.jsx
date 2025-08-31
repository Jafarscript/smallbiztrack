import { Navigate, Route, Routes } from "react-router"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard";
import SignUp from "./pages/SignUp";
import Products from "./pages/Products";
import DashboardHome from "./components/DashboardHome";
import Sales from "./pages/Sales";


const App = () => {
  const PrivateRoute = ({ children }) => {
  return localStorage.getItem("token") ? children : <Navigate to="/" />;
};




  return (
    <Routes>
      {/* <Route path="/" element={<div>Home Page</div>} /> */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>}>
          <Route index element={<DashboardHome />} />
          <Route path="products" element={<Products />} />
          <Route path="sales" element={<Sales />} />
          {/* <Route path="settings" element={<Settings />} /> */}
      </Route>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  )
}

export default App