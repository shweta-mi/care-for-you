import { useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { ArrowRight, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../../components/ui";

const generateCareCode = () => {
  return (
    "CFS-" +
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase()
  );
};

function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!fullName || !email || !password || !confirmPassword || !role) {
      toast.error("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const userData = {
      id: Date.now(),
      fullName,
      email,
      password,
      role,
      careCode: generateCareCode(),
    };
    const users = JSON.parse(localStorage.getItem("users")) || [];
    users.push(userData);
    localStorage.setItem("users", JSON.stringify(users));

    toast.success("Account created successfully");
  };

  return (
    <main className="app-shell min-h-screen px-4 py-8 text-slate-950 sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="premium-card mx-auto w-full max-w-2xl rounded-[var(--care-radius-lg)] p-6 sm:p-8"
        >
          <div className="mb-8">
            <div className="care-gradient grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg shadow-pink-500/25">
              <Sparkles size={22} aria-hidden="true" />
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight text-slate-950">
              Create your care account
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Create your profile, then connect privately with a care code.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
              Full name
              <input
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-slate-900 shadow-sm shadow-pink-900/5 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-200/45"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700 sm:col-span-2">
              Email address
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-slate-900 shadow-sm shadow-pink-900/5 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-200/45"
                autoComplete="email"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Password
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-slate-900 shadow-sm shadow-pink-900/5 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-200/45"
                autoComplete="new-password"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Confirm password
              <input
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-pink-100 bg-white px-4 py-3 text-slate-900 shadow-sm shadow-pink-900/5 outline-none transition placeholder:text-slate-400 focus:border-pink-400 focus:ring-4 focus:ring-pink-200/45"
                autoComplete="new-password"
              />
            </label>

            <fieldset className="sm:col-span-2">
              <legend className="text-sm font-semibold text-slate-700">
                Select your role
              </legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {[
                  ["caregiver", "Caregiver", HeartHandshake],
                  ["receiver", "Care Receiver", ShieldCheck],
                ].map(([value, label, Icon]) => (
                  <label
                    key={value}
                    className={`flex items-center gap-3 rounded-[1.35rem] border p-4 transition ${
                      role === value
                        ? "border-pink-400 bg-pink-50 text-pink-800 shadow-sm shadow-pink-500/10"
                        : "border-pink-100 bg-white text-slate-700 hover:border-pink-200 hover:bg-pink-50/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={value}
                      checked={role === value}
                      onChange={(e) => setRole(e.target.value)}
                      className="sr-only"
                    />
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white shadow-sm shadow-pink-900/5">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <span className="font-semibold">{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Button type="submit" size="lg" className="mt-2 w-full sm:col-span-2">
              Create account
              <ArrowRight size={18} aria-hidden="true" />
            </Button>

            <p className="text-center text-sm text-slate-600 sm:col-span-2">
              Already have an account?{" "}
              <Link to="/" className="font-semibold text-pink-700 hover:text-pink-800">
                Login
              </Link>
            </p>
          </form>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut", delay: 0.05 }}
          className="hidden lg:block"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-700">
            Private care circle
          </p>
          <h2 className="mt-4 max-w-xl text-5xl font-semibold leading-[1.02] tracking-tight text-slate-950">
            Built for families who show up every day.
          </h2>
          <div className="mt-8 space-y-3">
            {[
              "Private local-first records with Firebase-ready services.",
              "Separate caregiver and receiver workflows.",
              "Care code pairing for a focused support circle.",
            ].map((item) => (
              <div key={item} className="premium-card flex items-start gap-3 rounded-[1.5rem] p-4">
                <span className="mt-1 h-2 w-2 rounded-full bg-pink-500" />
                <p className="text-sm leading-6 text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </motion.aside>
      </div>
    </main>
  );
}

export default Register;
