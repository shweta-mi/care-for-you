import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, HeartHandshake, Lock, Mail, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import useApp from "../../hooks/useApp";
import { Button } from "../../components/ui";

function Login() {
  const navigate = useNavigate();
  const { setUser } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem("users")) || [];

    const foundUser = users.find(
      (user) => user.email === email && user.password === password,
    );

    if (!foundUser) {
      toast.error("Invalid email or password");
      return;
    }

    localStorage.setItem("user", JSON.stringify(foundUser));
    setUser(foundUser);

    toast.success(`Welcome ${foundUser.fullName}`);

    navigate("/dashboard");
  };

  return (
    <main className="app-shell min-h-screen px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="hidden lg:block"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/85 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm shadow-pink-900/5">
            <HeartHandshake size={16} className="text-pink-500" aria-hidden="true" />
            Care For Shweta
          </div>
          <h1 className="mt-8 max-w-xl text-5xl font-semibold leading-[1.02] tracking-tight text-slate-950">
            A softer way to care for someone you love.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
            Share medicines, meals, water, appointments, notes, and reassuring
            check-ins in one calm family space.
          </p>
          <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
            {["Gentle reminders", "Shared progress", "Family trust"].map((item, index) => (
              <div key={item} className="premium-card rounded-[1.5rem] p-4">
                <p className="text-sm font-semibold text-slate-900">{item}</p>
                <p className="mt-3 h-1.5 rounded-full bg-pink-50">
                  <span
                    className="block h-full rounded-full bg-pink-500"
                    style={{ width: `${72 - index * 10}%` }}
                  />
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="premium-card mx-auto w-full max-w-md rounded-[var(--care-radius-lg)] p-6 sm:p-8"
        >
          <div className="mb-8">
            <div className="care-gradient grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg shadow-pink-500/25">
              <Sparkles size={22} aria-hidden="true" />
            </div>
            <h2 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
              Welcome back
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to return to your care circle.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Email address
              <span className="mt-2 flex items-center gap-3 rounded-2xl border border-pink-100 bg-white px-4 py-3 shadow-sm shadow-pink-900/5 focus-within:border-pink-400 focus-within:ring-4 focus-within:ring-pink-200/45">
                <Mail size={18} className="text-slate-400" aria-hidden="true" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  autoComplete="email"
                />
              </span>
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Password
              <span className="mt-2 flex items-center gap-3 rounded-2xl border border-pink-100 bg-white px-4 py-3 shadow-sm shadow-pink-900/5 focus-within:border-pink-400 focus-within:ring-4 focus-within:ring-pink-200/45">
                <Lock size={18} className="text-slate-400" aria-hidden="true" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-slate-900 outline-none placeholder:text-slate-400"
                  autoComplete="current-password"
                />
              </span>
            </label>

            <Button type="submit" size="lg" className="w-full">
              Login
              <ArrowRight size={18} aria-hidden="true" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            New to Care For Shweta?{" "}
            <Link to="/register" className="font-semibold text-pink-700 hover:text-pink-800">
              Create account
            </Link>
          </p>
        </motion.section>
      </div>
    </main>
  );
}

export default Login;
