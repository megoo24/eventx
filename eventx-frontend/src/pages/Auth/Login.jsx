import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.js";
import AuthLayout from "../../components/AuthLayout.js";
import Button from "../../components/ui/Button.js";
import { Label, Input } from "../../components/ui/Input.js";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate(result.user.role === "admin" ? "/admin/dashboard" : "/");
      } else setError(result.error);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle={
        <>
          Don’t have an account?{" "}
          <Link to="/register" className="font-medium text-yellow-400 hover:underline">
            Create one
          </Link>
        </>
      }
      accent="emerald"
      className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 min-h-screen flex items-center justify-center p-6"
    >
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md">
        {/* Social Login */}
        <div className="text-center">
          <p className="text-sm mb-4 text-gray-500">Login with social networks</p>
          <div className="flex items-center justify-center gap-4">
            <button className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transform transition duration-300">
              F
            </button>
            <button className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transform transition duration-300">
              G
            </button>
            <button className="w-12 h-12 rounded-full bg-blue-800 text-white flex items-center justify-center shadow-lg hover:scale-110 transform transition duration-300">
              in
            </button>
          </div>
          <div className="mt-6 flex items-center">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="mx-3 text-xs text-gray-400">OR</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm flex items-center">
            <svg
              className="h-5 w-5 text-red-600 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10A8 8 0 11-16 0a8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="rounded-lg px-4 py-3 border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 bg-gray-50 text-gray-900 transition"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className="rounded-lg px-4 py-3 border-2 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 bg-gray-50 text-gray-900 transition"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link
            to="/forgot-password"
            className="text-sm text-purple-600 hover:text-purple-800 hover:underline transition"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-white font-bold shadow-xl hover:scale-105 transform transition duration-300"
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </AuthLayout>
  );
}
