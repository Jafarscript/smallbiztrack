import { Link, useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useState } from "react";
import api from "../lib/axios";

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [submissionError, setSubmissionError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Email validation
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleNameChange = (e) => {
    setName(e.target.value);
    setNameError(e.target.value ? "" : "Name is required.");
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (!e.target.value) {
      setEmailError("Email is required.");
    } else if (!validateEmail(e.target.value)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (!e.target.value) {
      setPasswordError("Password is required.");
    } else if (e.target.value.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
    } else {
      setPasswordError("");
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (!e.target.value) {
      setConfirmPasswordError("Please confirm your password.");
    } else if (e.target.value !== password) {
      setConfirmPasswordError("Passwords do not match.");
    } else {
      setConfirmPasswordError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError("");
    setIsLoading(true);

    // Final validation
    if (!name) setNameError("Name is required.");
    if (!email) setEmailError("Email is required.");
    if (!password) setPasswordError("Password is required.");
    if (!confirmPassword) setConfirmPasswordError("Please confirm your password.");
    if (password !== confirmPassword) setConfirmPasswordError("Passwords do not match.");

    if (nameError || emailError || passwordError || confirmPasswordError || !name || !email || !password || !confirmPassword) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post(`/auth/register`, { name, email, password });
      console.log("Signup successful:", response.data);
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup failed:", error);
      if (error.response?.data?.message) {
        setSubmissionError(error.response.data.message);
      } else {
        setSubmissionError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid =
    name && email && password && confirmPassword &&
    !nameError && !emailError && !passwordError && !confirmPasswordError;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4 font-inter">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl animate-fade-in">
        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-6">
          Create an Account
        </h1>

        <form className="mt-6 flex flex-col gap-5" onSubmit={handleSubmit}>
          {/* Name */}
          <label className="block text-sm font-semibold text-gray-700">
            Full Name
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className={`mt-1 w-full rounded-lg border px-4 py-2.5 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                nameError ? "border-red-500" : "border-gray-300 focus:border-indigo-400"
              }`}
              placeholder="John Doe"
            />
            {nameError && <p className="mt-1 text-xs text-red-500">{nameError}</p>}
          </label>

          {/* Email */}
          <label className="block text-sm font-semibold text-gray-700">
            Email
            <input
              type="email"
              value={email}
              onChange={handleEmailChange}
              className={`mt-1 w-full rounded-lg border px-4 py-2.5 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                emailError ? "border-red-500" : "border-gray-300 focus:border-indigo-400"
              }`}
              placeholder="your@example.com"
            />
            {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}
          </label>

          {/* Password */}
          <label className="block text-sm font-semibold text-gray-700 relative">
            Password
            <input
              type={showPassword ? "text" : "password"}
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

          {/* Confirm Password */}
          <label className="block text-sm font-semibold text-gray-700 relative">
            Confirm Password
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              className={`mt-1 w-full rounded-lg border px-4 py-2.5 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                confirmPasswordError ? "border-red-500" : "border-gray-300 focus:border-indigo-400"
              }`}
              placeholder="••••••••"
            />
            <span
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[45px] transform -translate-y-1/2 cursor-pointer text-gray-500 hover:text-gray-700 transition-colors"
            >
              {showConfirmPassword ? <FaEye className="h-5 w-5" /> : <FaEyeSlash className="h-5 w-5" />}
            </span>
            {confirmPasswordError && <p className="mt-1 text-xs text-red-500">{confirmPasswordError}</p>}
          </label>

          {/* Error */}
          {submissionError && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {submissionError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`inline-block w-full rounded-lg bg-indigo-600 px-8 py-3 text-lg font-bold text-white shadow-md transition-all ${
              !isFormValid || isLoading
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-indigo-700 hover:scale-[1.01] focus:ring-3 focus:ring-indigo-300 focus:outline-none"
            }`}
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Link to Login */}
        <p className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/" className="font-semibold text-indigo-600 hover:text-indigo-800 transition-colors">
            Log In
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Signup;
