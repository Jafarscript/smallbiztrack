import axios from "axios";
import { useState } from "react";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router";

const SignUp = () => {
    const [showpassword, setShowPassword] = useState(false);
    
  const handleSubmit = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, { name, email, password });
      console.log("Sign up successful:", response.data);
    } catch (error) {
      console.error("Sign up failed:", error);
    }
  };

  return (
    <main className="flex items-center h-screen justify-center bg-gray-200 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
         Register
        </h1>
        <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
          <label htmlFor="Email">
            <span className="text-sm font-medium text-gray-700"> Name </span>

            <input
              type="text"
              id="name"
              className="mt-0.5 w-full rounded border-black border shadow-sm p-2 outline-none"
            />
          </label>
          <label htmlFor="Email">
            <span className="text-sm font-medium text-gray-700"> Email </span>

            <input
              type="email"
              id="email"
              className="mt-0.5 w-full rounded border-black border shadow-sm p-2 outline-none"
            />
          </label>
           <label htmlFor="password" className="relative">
                      <span className="text-sm font-medium text-gray-700">
                        {" "}
                        Password{" "}
                      </span>
          
                      <input
                        type={showpassword ? "text" : "password"}
                        id="password"
                        className="mt-0.5 w-full relative rounded border-black border shadow-sm p-2 outline-none"
                      />
                      <span onClick={() => setShowPassword(!showpassword)} className="absolute right-3 top-12 transform -translate-y-1/2 cursor-pointer">
                        {showpassword ? <FaEye className="text-gray-500" /> : <FaEyeSlash className="text-gray-500" />}
                      </span>
                    </label>
          <button
            className="inline-block rounded-sm focus:bg-indigo-400 bg-indigo-600 px-8 py-3 text-sm font-medium text-white transition hover:scale-105 cursor-pointer hover:shadow-xl focus:ring-3 focus:outline-hidden"
            type="submit"
          >
            Register
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/" className="text-indigo-600 hover:underline">
            Log In
          </Link>
        </p>
      </div>
    </main>
  );
};

export default SignUp;
