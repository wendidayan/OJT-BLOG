import { useEffect, useState } from "react";

import Reveal from "./components/Reveal";
import SuccessModal from "./components/SuccessModal";
import ErrorModal from "./components/ErrorModal";

export default function AdminPage() {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const existing = window.localStorage.getItem("admin_token") || "";
    setToken(existing);
  }, []);

  const verifyPassword = async () => {
    if (!password.trim()) {
      setErrorMessage("Please enter your admin password.");
      setShowError(true);
      return;
    }

    try {
      const response = await fetch("/admin/check-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        },
        body: JSON.stringify({ password: password.trim() }),
      });

      if (!response.ok) {
        setErrorMessage("Invalid password.");
        setShowError(true);
        return;
      }

      setPasswordVerified(true);
    } catch (e) {
      setErrorMessage("Failed to verify password.");
      setShowError(true);
    }
  };

  const saveToken = async () => {
    if (!password.trim()) {
      setErrorMessage("Please enter your admin password.");
      setShowError(true);
      return;
    }
    if (!token.trim()) {
      setErrorMessage("Please enter your admin token.");
      setShowError(true);
      return;
    }

    try {
      const response = await fetch("/admin/unlock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
        },
        body: JSON.stringify({ password: password.trim(), token: token.trim() }),
      });

      if (!response.ok) {
        setErrorMessage("Invalid password or token.");
        setShowError(true);
        return;
      }

      window.localStorage.setItem("admin_token", token.trim());
      setShowSuccess(true);
    } catch (e) {
      setErrorMessage("Failed to unlock admin mode.");
      setShowError(true);
    }
  };

  const clearToken = () => {
    window.localStorage.removeItem("admin_token");
    setToken("");
    setShowSuccess(true);
  };

  return (
    <>
      <div className="max-w-xl mx-auto px-4 py-10" style={{ fontFamily: "'Nunito', sans-serif" }}>
        <Reveal>
          <h2 className="font-serif text-3xl text-stone-800 mb-2">Admin</h2>
          <p className="text-stone-400 text-sm mb-6">Enter your admin password to continue.</p>
        </Reveal>

        <Reveal>
          <div className="bg-white rounded-2xl border border-amber-100 shadow-sm p-5">
            <label className="block text-sm font-medium text-stone-700 mb-1">Admin Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 mb-4"
              placeholder="Enter password"
            />

            {!passwordVerified ? (
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={verifyPassword}
                  className="px-5 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={() => (window.location.href = "/blog")}
                  className="ml-auto px-5 py-2 bg-stone-800 text-white font-semibold rounded-lg hover:bg-stone-900"
                >
                  Back
                </button>
              </div>
            ) : (
              <>
                <label className="block text-sm font-medium text-stone-700 mb-1">Admin Token</label>
                <input
                  type="password"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Enter token"
                />
                <div className="flex gap-3 mt-4">
                  <button
                    type="button"
                    onClick={saveToken}
                    className="px-5 py-2 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={clearToken}
                    className="px-5 py-2 bg-stone-200 text-stone-700 font-semibold rounded-lg hover:bg-stone-300"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => (window.location.href = "/blog")}
                    className="ml-auto px-5 py-2 bg-stone-800 text-white font-semibold rounded-lg hover:bg-stone-900"
                  >
                    Back
                  </button>
                </div>
              </>
            )}
          </div>
        </Reveal>
      </div>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Admin token updated."
      />

      <ErrorModal
        isOpen={showError}
        onClose={() => setShowError(false)}
        message={errorMessage}
      />
    </>
  );
}
