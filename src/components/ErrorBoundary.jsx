import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, details) {
    console.error("Application error", error, details);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="app-shell grid min-h-screen place-items-center p-6">
          <div className="premium-card max-w-md rounded-[var(--care-radius-lg)] p-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
              Something needs a moment
            </h1>
            <p className="mt-3 text-slate-500">
              Your saved care data is still safe on this device.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-2xl bg-pink-600 px-5 py-3 font-semibold text-white shadow-lg shadow-pink-500/20 transition hover:bg-pink-700"
            >
              Reload application
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}
