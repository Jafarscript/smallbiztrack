import { Navigate, Route, Routes } from "react-router"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard";
import SignUp from "./pages/SignUp";


const App = () => {
  const PrivateRoute = ({ children }) => {
  return localStorage.getItem("token") ? children : <Navigate to="/" />;
};

  return (
    <Routes>
      {/* <Route path="/" element={<div>Home Page</div>} /> */}
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  )
}

export default App