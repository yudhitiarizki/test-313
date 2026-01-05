import { useState } from "react";
import { Lock, User } from "lucide-react";
import { UserRole } from "../types";

interface LoginProps {
  onLogin: (role: UserRole) => void;
}

const USERS = {
  admin: "mandiri313admin",
  "user-verif": "verif313",
  "user-biasa": "user123",
};

export function Login({ onLogin }: LoginProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Check password against all roles
    const role = Object.entries(USERS).find(
      ([_, pwd]) => pwd === password
    )?.[0] as UserRole;

    if (role) {
      onLogin(role);
    } else {
      setError("Password salah!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 p-4 rounded-full">
            <User className="w-12 h-12 text-indigo-600" />
          </div>
        </div>

        <h1 className="text-center mb-8">Portal Pembelajaran</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Masukkan password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Login
          </button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Link donasi 🤣:</p>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>
              • Sociabuz:{" "}
              <code className="bg-white px-2 py-1 rounded">
                <a target="_blank" href="https://sociabuzz.com/admin313">
                  https://sociabuzz.com/admin313
                </a>
              </code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
