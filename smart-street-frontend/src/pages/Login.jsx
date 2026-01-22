import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { UserCircleIcon, LockClosedIcon, BuildingStorefrontIcon } from "@heroicons/react/24/outline";
import ThemeToggle from "../components/ThemeToggle.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const user = await login({ email, password });
      if (user.role === "VENDOR") navigate("/vendor");
      else if (user.role === "OWNER") navigate("/owner");
      else if (user.role === "ADMIN") navigate("/admin");
      else navigate("/public");
    } catch (err) {
      // error handled via context state
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-white to-blue-50 dark:from-slate-900 dark:via-slate-900 dark:to-cyan-950 opacity-90 z-0 transition-colors duration-500"/>
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-200 dark:bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 dark:opacity-20 animate-blob"/>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-200 dark:bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 dark:opacity-20 animate-blob animation-delay-2000"/>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-200 dark:bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-40 dark:opacity-20 animate-blob animation-delay-4000"/>
      
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="relative w-[90%] md:w-full max-w-md bg-white/60 dark:bg-white/5 backdrop-blur-xl shadow-2xl rounded-2xl p-6 md:p-8 border border-white/40 dark:border-white/10 z-10 transition-all hover:shadow-cyan-500/20">
        <div className="text-center space-y-3 mb-8">
          <Link to="/" className="inline-flex shrink-0 aspect-square group mx-auto w-16 h-16 bg-gradient-to-tr from-teal-500 to-cyan-600 rounded-full items-center justify-center shadow-lg shadow-cyan-500/30 mb-4 hover:scale-105 transition-transform">
             <BuildingStorefrontIcon className="w-9 h-9 text-white" />
          </Link>
          <Link to="/" className="block">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">Smart Street</h1>
          </Link>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-light">
            Enter your credentials to access the workspace
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="space-y-1 group">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">Email Address</label>
            <div className={`relative flex items-center bg-white dark:bg-slate-900/50 rounded-xl border transition-all duration-300 ${focusedField === 'email' ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' : 'border-slate-200 dark:border-slate-700'}`}>
              <UserCircleIcon className={`w-5 h-5 ml-3 transition-colors ${focusedField === 'email' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                required
                className="w-full bg-transparent px-3 py-3 text-base md:text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none"
                placeholder="name@example.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1 group">
             <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">Password</label>
            <div className={`relative flex items-center bg-white dark:bg-slate-900/50 rounded-xl border transition-all duration-300 ${focusedField === 'password' ? 'border-cyan-500 shadow-lg shadow-cyan-500/20' : 'border-slate-200 dark:border-slate-700'}`}>
              <LockClosedIcon className={`w-5 h-5 ml-3 transition-colors ${focusedField === 'password' ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`} />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                minLength={8}
                required
                className="w-full bg-transparent px-3 py-3 text-base md:text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-4 py-3 text-sm text-red-600 dark:text-red-200 flex items-center gap-2 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transform transition-all hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Authenticating...
              </span>
            ) : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-400">
            Don't have an account?{" "}
            <Link className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors" to="/register">
              Create Account
            </Link>
          </p>
        </div>
      </div>
      
      {/* Footer / Copyright */}
      <div className="absolute bottom-4 text-xs text-slate-500 font-light opacity-60">
        © 2026 Smart Street Systems. Secure Access.
      </div>
    </div>
  );
}
