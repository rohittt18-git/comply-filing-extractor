import {
  BarChart3,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: "/documents",
      label: "Documents",
      icon: FileText,
    },
    {
      to: "/history",
      label: "History",
      icon: History,
    },
    {
      to: "/analytics",
      label: "Analytics",
      icon: BarChart3,
    },
  ];

  const handleSignOut = () => {
    navigate("/login");
  };

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
          <FileText size={19} />
        </div>

        <div>
          <p className="font-bold tracking-tight text-slate-950">
            Comply Extract
          </p>

          <p className="text-[11px] text-slate-400">
            Document Intelligence
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Workspace
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-950 text-white"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-100 p-4">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-slate-950 text-white"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>

        <button
          type="button"
          onClick={handleSignOut}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
        >
          <LogOut size={18} />
          Sign out
        </button>

        <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-white">
          <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <ShieldCheck size={16} />
          </div>

          <p className="text-sm font-semibold">
            Secure workspace
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            Your filing documents are processed securely.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;