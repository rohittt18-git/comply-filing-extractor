import { FileText, ShieldCheck, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  // Convert email into a readable display name
  const getNameFromEmail = (email) => {
    const localPart = email.split("@")[0] || "User";

    return localPart
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();
  };

  // Save logged-in user and open dashboard
  const loginUser = (email) => {
    const cleanEmail = email.trim();

    const displayName = getNameFromEmail(cleanEmail);

    localStorage.setItem(
      "comply_user",
      JSON.stringify({
        name: displayName,
        email: cleanEmail,
      })
    );

    navigate("/dashboard");
  };

  // Handle login
  const handleLogin = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const email = formData.get("email")?.toString().trim() || "";

    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    loginUser(email);
  };

  // Demo account
  const handleDemoLogin = () => {
    loginUser("rohit.kamati@gmail.com");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =========================
            LEFT SIDE
        ========================== */}
        <div className="relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">

          {/* Background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.15),transparent_35%)]" />

          {/* Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-950">
                <FileText size={21} />
              </div>

              <span className="text-xl font-bold tracking-tight">
                Comply Extract
              </span>

            </div>
          </div>

          {/* Main content */}
          <div className="relative z-10 max-w-xl">

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 backdrop-blur">
              <Sparkles size={16} />
              Intelligent document extraction
            </div>

            <h1 className="text-5xl font-bold leading-tight tracking-tight xl:text-6xl">
              Turn complex filings into
              <span className="text-blue-400">
                {" "}structured intelligence.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-400">
              Upload a filing, extract its structure, and navigate important
              sections in seconds.
            </p>

            <div className="mt-10 flex items-center gap-3 text-sm text-slate-400">
              <ShieldCheck
                size={18}
                className="text-emerald-400"
              />

              Built for structured document workflows
            </div>

          </div>

          {/* Footer */}
          <div className="relative z-10 text-sm text-slate-500">
            © 2026 Comply Extract
          </div>

        </div>

        {/* =========================
            RIGHT SIDE
        ========================== */}
        <div className="flex items-center justify-center bg-white px-6 py-12 text-slate-900">

          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="mb-12 flex items-center justify-center gap-3 lg:hidden">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white">
                <FileText size={21} />
              </div>

              <span className="text-xl font-bold">
                Comply Extract
              </span>

            </div>

            {/* Heading */}
            <div className="mb-8">

              <h2 className="text-3xl font-bold tracking-tight">
                Welcome back
              </h2>

              <p className="mt-2 text-slate-500">
                Sign in to continue to your workspace.
              </p>

            </div>

            {/* =========================
                LOGIN FORM
            ========================== */}
            <form
              className="space-y-5"
              onSubmit={handleLogin}
            >

              {/* Email */}
              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

              {/* Password */}
              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    onClick={() => {
                      alert("Password reset is not available in demo mode.");
                    }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </button>

                </div>

                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />

              </div>

              {/* Remember me */}
              <label className="flex items-center gap-3 text-sm text-slate-600">

                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300"
                />

                Remember me

              </label>

              {/* Sign in */}
              <button
                type="submit"
                className="w-full rounded-xl bg-slate-950 py-3.5 font-semibold text-white shadow-lg shadow-slate-950/10 transition hover:bg-slate-800 active:scale-[0.99]"
              >
                Sign in
              </button>

            </form>

            {/* Divider */}
            <div className="my-8 flex items-center gap-4">

              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs uppercase tracking-wider text-slate-400">
                Demo
              </span>

              <div className="h-px flex-1 bg-slate-200" />

            </div>

            {/* Demo account */}
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full rounded-xl border border-slate-200 py-3.5 font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Continue with Demo Account
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}

export default Login;