import React, { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios, { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

type AuthMode = "login" | "signup";

type FormField = "name" | "email" | "password" | "confirm";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

interface EyeIconProps {
  open: boolean;
}

interface InputFieldProps {
  label: string;
  type: string;
  id: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  showToggle?: boolean;
  onToggle?: () => void;
  showPassword?: boolean;
}

const EyeIcon = ({ open }: EyeIconProps): React.ReactElement =>
  open ? (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ) : (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
      />
    </svg>
  );

const InputField = ({
  label,
  type,
  id,
  value,
  onChange,
  placeholder,
  showToggle = false,
  onToggle,
  showPassword = false,
}: InputFieldProps): React.ReactElement => (
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor={id}
      className="text-xs font-medium tracking-widest uppercase text-zinc-400"
    >
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        type={showToggle ? (showPassword ? "text" : "password") : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/40 transition-all duration-200"
      />
      {showToggle && onToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <EyeIcon open={showPassword} />
        </button>
      )}
    </div>
  </div>
);

export default function AuthComponent(): React.ReactElement {
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });

  const handleChange =
    (field: FormField) =>
    (e: ChangeEvent<HTMLInputElement>): void => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint =
        mode === "login"
          ? "http://localhost:8080/login"
          : "http://localhost:8080/signup";

      const body =
        mode === "login"
          ? {
              email: form.email,
              password: form.password,
            }
          : {
              name: form.name,
              email: form.email,
              password: form.password,
            };

      const res = await axios.post(endpoint, body, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      setSuccess(true);

      console.log("Response:", res.data);
      navigate("/");
    } catch (err: unknown) {
      console.error(err as AxiosError);
      alert("Error while auth");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m: AuthMode): void => {
    setMode(m);
    setSuccess(false);
    setForm({ name: "", email: "", password: "", confirm: "" });
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 font-sans">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[600px] h-[600px] rounded-full bg-violet-900/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <span className="text-white font-semibold text-lg tracking-tight">
            DeployX
          </span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl shadow-black/50">
          <div className="flex bg-zinc-800/60 rounded-lg p-1 mb-8">
            {(["login", "signup"] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all duration-200 capitalize ${
                  mode === m
                    ? "bg-zinc-700 text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <div className="mb-7">
            <h1 className="text-xl font-semibold text-white mb-1">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-zinc-500">
              {mode === "login"
                ? "Sign in to continue to your workspace."
                : "Join thousands of users building with DeploX."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "signup" && (
              <InputField
                label="Full Name"
                type="text"
                id="name"
                value={form.name}
                onChange={handleChange("name")}
                placeholder="Jane Smith"
              />
            )}

            <InputField
              label="Email Address"
              type="email"
              id="email"
              value={form.email}
              onChange={handleChange("email")}
              placeholder="you@example.com"
            />

            <InputField
              label="Password"
              type="password"
              id="password"
              value={form.password}
              onChange={handleChange("password")}
              placeholder={mode === "signup" ? "Min. 8 characters" : "••••••••"}
              showToggle
              showPassword={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
            />

            {mode === "login" && (
              <div className="flex justify-end -mt-1">
                <button
                  type="button"
                  className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`mt-2 w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2
                ${
                  success
                    ? "bg-emerald-600 text-white"
                    : "bg-violet-600 hover:bg-violet-500 active:scale-[0.98] text-white disabled:opacity-60 disabled:cursor-not-allowed"
                }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3V4a10 10 0 100 16v-2a8 8 0 01-8-8z"
                    />
                  </svg>
                  Processing…
                </>
              ) : success ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {mode === "login" ? "Signed in!" : "Account created!"}
                </>
              ) : mode === "login" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-600">or continue with</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-zinc-600 mt-6">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "signup" : "login")}
              className="text-violet-400 hover:text-violet-300 transition-colors font-medium"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-zinc-700 mt-5">
          By continuing, you agree to our{" "}
          <span className="text-zinc-500 cursor-pointer hover:text-zinc-400">
            Terms
          </span>{" "}
          &amp;{" "}
          <span className="text-zinc-500 cursor-pointer hover:text-zinc-400">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
}
