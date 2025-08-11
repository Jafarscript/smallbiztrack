import { Route, Routes } from "react-router"
import Login from "./pages/Login"


const App = () => {
  return (
    <Routes>
      <Route path="/" element={<div>Home Page</div>} />
      <Route path="/login" element={<Login />} />
    </Routes>
  )
}

export default App