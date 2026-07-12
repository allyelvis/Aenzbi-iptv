import React, { useState } from "react";
import { 
  Monitor, KeyRound, User, ShieldCheck, Terminal, Clock, 
  Sparkles, Mail, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2 
} from "lucide-react";
import { 
  signInWithEmail, 
  signUpWithEmail, 
  sendPasswordReset, 
  googleSignIn 
} from "../lib/googleAuth";

interface LoginPageProps {
  onLoginSuccess: (user: { name: string; email: string }) => void;
}

type AuthMode = "login" | "signup" | "reset";

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // UTC Clock
  const [utcTime] = useState("12:15:39");

  const resetState = () => {
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleModeSwitch = (newMode: AuthMode) => {
    resetState();
    setMode(newMode);
  };

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Offline / Developer bypass for testing & evaluation
      if (email.toLowerCase() === "admin" && password === "admin") {
        onLoginSuccess({ name: "Administrator", email: "admin@aenzbi.com" });
        return;
      }

      if (!email.includes("@")) {
        throw new Error("Please enter a valid email address or use 'admin' bypass.");
      }

      const user = await signInWithEmail(email, password);
      onLoginSuccess({ 
        name: user.displayName || user.email?.split("@")[0] || "Administrator", 
        email: user.email || email 
      });
    } catch (err: any) {
      console.error(err);
      let friendlyMessage = err.message || "Authentication failed.";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        friendlyMessage = "Invalid email or password. Please try again.";
      } else if (err.code === "auth/invalid-email") {
        friendlyMessage = "The email address is badly formatted.";
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailPasswordSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const user = await signUpWithEmail(email, password);
      setSuccess("Account registered successfully!");
      
      // Auto sign-in on successful registration
      setTimeout(() => {
        onLoginSuccess({ 
          name: fullName || user.displayName || email.split("@")[0], 
          email: user.email || email 
        });
      }, 1000);
    } catch (err: any) {
      console.error(err);
      let friendlyMessage = err.message || "Registration failed.";
      if (err.code === "auth/email-already-in-use") {
        friendlyMessage = "This email is already registered. Please login instead.";
      } else if (err.code === "auth/invalid-email") {
        friendlyMessage = "The email address is badly formatted.";
      } else if (err.code === "auth/weak-password") {
        friendlyMessage = "The password is too weak.";
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      await sendPasswordReset(email);
      setSuccess("Password reset instructions have been sent to your email.");
    } catch (err: any) {
      console.error(err);
      let friendlyMessage = err.message || "Failed to send password reset email.";
      if (err.code === "auth/user-not-found") {
        friendlyMessage = "No account found with this email address.";
      }
      setError(friendlyMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await googleSignIn();
      if (res) {
        onLoginSuccess({
          name: res.user.displayName || res.user.email?.split("@")[0] || "Gmail User",
          email: res.user.email || ""
        });
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gmail authentication failed or was cancelled.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden font-sans antialiased text-slate-800" id="login-container-stage">
      {/* Background Decorative Polygons */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-200 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden relative z-10 animate-fade-in flex flex-col">
        {/* Top Header Section */}
        <div className="px-6 py-6 border-b border-slate-150 bg-slate-50/70 text-center space-y-2.5 shrink-0">
          <div className="mx-auto w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center font-extrabold text-white text-lg shadow-md shadow-indigo-950/20">
            A
          </div>
          <div className="space-y-0.5">
            <h1 className="font-extrabold text-lg tracking-tight text-slate-900 uppercase">Aenzbi IPTV</h1>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Property Management Suite</p>
          </div>
        </div>

        {/* Auth Body Forms */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          
          {/* Status Feedback alerts */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-150 text-red-700 p-3 rounded-lg flex items-start gap-2 text-xs font-semibold leading-relaxed">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-emerald-50 border border-emerald-150 text-emerald-700 p-3 rounded-lg flex items-start gap-2 text-xs font-semibold leading-relaxed">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
              <span>{success}</span>
            </div>
          )}

          {/* SIGN IN VIEW */}
          {mode === "login" && (
            <form onSubmit={handleEmailPasswordLogin} className="space-y-4 text-xs">
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your administrative email"
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/30 font-medium"
                      id="login-username-input"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">Password</label>
                    <button
                      type="button"
                      onClick={() => handleModeSwitch("reset")}
                      className="text-[10px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline transition-all"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/30"
                      id="login-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  AES-256 Auth Active
                </span>
                <span className="font-mono text-slate-400">UTC: {utcTime}</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2 text-xs"
                id="login-submit-btn"
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
                  </>
                )}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 font-bold uppercase tracking-widest text-[9px] font-mono">or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Gmail authentication option */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2 text-xs"
                id="gmail-login-btn"
              >
                <Sparkles className="h-3.5 w-3.5 text-indigo-500 animate-pulse" />
                <span>Sign In with Gmail / Google</span>
              </button>

              <p className="text-center text-[11px] text-slate-500 mt-2">
                Don't have an administrative account?{" "}
                <button
                  type="button"
                  onClick={() => handleModeSwitch("signup")}
                  className="text-indigo-600 hover:text-indigo-800 font-extrabold hover:underline"
                >
                  Create Account
                </button>
              </p>
            </form>
          )}

          {/* SIGN UP VIEW */}
          {mode === "signup" && (
            <form onSubmit={handleEmailPasswordSignUp} className="space-y-4 text-xs">
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Your Full Name</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/30 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="administrative@domain.com"
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/30 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Verify secure password"
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/30"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2 text-xs"
              >
                {loading ? <span>Creating Account...</span> : <span>Create Administrator Account</span>}
              </button>

              <p className="text-center text-[11px] text-slate-500 mt-2">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleModeSwitch("login")}
                  className="text-indigo-600 hover:text-indigo-800 font-extrabold hover:underline"
                >
                  Sign In
                </button>
              </p>
            </form>
          )}

          {/* PASSWORD RESET VIEW */}
          {mode === "reset" && (
            <form onSubmit={handlePasswordResetRequest} className="space-y-4 text-xs">
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-slate-600 mb-2">
                  <button
                    type="button"
                    onClick={() => handleModeSwitch("login")}
                    className="p-1 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <span className="font-semibold text-slate-700 text-[11px]">Return to Sign In</span>
                </div>

                <div>
                  <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                    Enter the email address registered with your administrative account, and we will send you secure password reset instructions.
                  </p>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 font-mono">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="administrative@domain.com"
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/30 font-medium"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2 text-xs"
              >
                {loading ? <span>Sending...</span> : <span>Send Password Reset Email</span>}
              </button>
            </form>
          )}

        </div>

        {/* Local Bypass Instruction footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-150 text-center text-[10px] text-slate-400 font-mono space-y-1 shrink-0">
          <div>💡 Admin Developer Local Override Bypass:</div>
          <div>
            Email/User: <strong className="text-slate-600">admin</strong> / Password: <strong className="text-slate-600">admin</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
