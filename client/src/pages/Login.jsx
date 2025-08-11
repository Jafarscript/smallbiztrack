import React from "react";

const Login = () => {
  return (
    <main className="flex items-center h-screen justify-center bg-gray-200">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
          Login Page
        </h1>
        <form className="mt-4 flex flex-col gap-4">
          {/* <label htmlFor="Email">
            <span className="text-sm font-medium text-gray-700"> Name </span>

            <input
              type="text"
              id="name"
              className="mt-0.5 w-full rounded border-gray-300 shadow-sm p-2"
            />
          </label> */}
          <label htmlFor="Email">
            <span className="text-sm font-medium text-gray-700"> Email </span>

            <input
              type="email"
              id="email"
              className="mt-0.5 w-full rounded border-black border shadow-sm p-2 outline-none"
            />
          </label>
          <label htmlFor="password">
            <span className="text-sm font-medium text-gray-700">
              {" "}
              Password{" "}
            </span>

            <input
              type="password"
              id="password"
              className="mt-0.5 w-full rounded border-black border shadow-sm p-2 outline-none"
            />
          </label>
          <button
            className="inline-block rounded-sm bg-indigo-600 px-8 py-3 text-sm font-medium text-white transition hover:scale-105 cursor-pointer hover:shadow-xl focus:ring-3 focus:outline-hidden"
            type="submit"
          >
            Log In
          </button>
        </form>
      </div>
    </main>
  );
};

export default Login;
