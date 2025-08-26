import { Link, useNavigate } from "react-router-dom"; // Use react-router-dom for Link
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import api from "../lib/axios"; // Assuming your axios instance is in ../lib/axios

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // For managing loading state

  // Basic email validation regex
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (e.target.value === "") {
      setEmailError("Email is required.");
    } else if (!validateEmail(e.target.value)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (e.target.value === "") {
      setPasswordError("Password is required.");
    } else if (e.target.value.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
    } else {
      setPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError(""); // Clear previous submission errors
    setIsLoading(true);

    // Re-validate fields on submission attempt
    if (!email) setEmailError("Email is required.");
    if (!password) setPasswordError("Password is required.");
    if (password && password.length < 6) setPasswordError("Password must be at least 6 characters.");

    // If there are any validation errors, stop submission
    if (emailError || passwordError || !email || !password || password.length < 6) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post(`/auth/login`, { email, password });
      console.log("Login successful:", response.data);
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setSubmissionError(error.response.data.message);
      } else {
        setSubmissionError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email && password && !emailError && !passwordError;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4 font-inter">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-fade-in">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
          Welcome Back!
        </h1>
        <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Email Input */}
          <label htmlFor="email-input" className="block text-sm font-semibold text-gray-700">
            Email
            <input
              type="email"
              id="email-input"
              value={email}
              onChange={handleEmailChange}
              className={`mt-1 w-full rounded-lg border px-4 py-2.5 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                emailError ? "border-red-500" : "border-gray-300 focus:border-indigo-400"
              }`}
              placeholder="your@example.com"
            />
            {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
          </label>

          {/* Password Input */}
          <label htmlFor="password-input" className="block text-sm font-semibold text-gray-700 relative">
            Password
            <input
              type={showPassword ? "text" : "password"}
              id="password-input"
              value={password}
              onChange={handlePasswordChange}
              className={`mt-1 w-full rounded-lg border px-4 py-2.5 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                passwordError ? "border-red-500" : "border-gray-300 focus:border-indigo-400"
              }`}
              placeholder="••••••••"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[45px] transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showPassword ? <FaEye className="h-5 w-5" /> : <FaEyeSlash className="h-5 w-5" />}
            </span>
            {passwordError && <p className="mt-1 text-xs text-red-500">{passwordError}</p>}
          </label>

          {/* Submission Error */}
          {submissionError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm" role="alert">
              {submissionError}
            </div>
          )}

          {/* Submit Button */}
          <button
            className={`inline-block w-full rounded-lg bg-indigo-600 px-8 py-3 text-lg font-bold text-white shadow-md transition-all ${
              !isFormValid || isLoading
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-indigo-700 hover:scale-[1.01] focus:ring-3 focus:ring-indigo-300 focus:outline-none"
            }`}
            type="submit"
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Log In"
            )}
          </button>
        </form>

        {/* Link to Sign Up */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Login;