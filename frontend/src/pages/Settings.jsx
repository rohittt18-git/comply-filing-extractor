import {
  Bell,
  Lock,
  Settings as SettingsIcon,
  User,
} from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [secureMode, setSecureMode] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-4xl px-6 py-10 lg:px-10">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Workspace
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Settings
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage your Comply Extract workspace preferences.
            </p>
          </div>

          <div className="space-y-5">
            {/* Profile */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                  <User size={18} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-950">
                    Profile
                  </h2>

                  <p className="text-xs text-slate-400">
                    Workspace account information
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Name
                  </label>

                  <input
                    value="Rohit"
                    readOnly
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-500">
                    Role
                  </label>

                  <input
                    value="Administrator"
                    readOnly
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Preferences */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <SettingsIcon size={19} />

                <h2 className="font-semibold text-slate-950">
                  Preferences
                </h2>
              </div>

              <div className="mt-6 space-y-5">
                <SettingRow
                  icon={Bell}
                  title="Extraction notifications"
                  description="Show notifications after document extraction."
                  enabled={notifications}
                  onChange={() =>
                    setNotifications((value) => !value)
                  }
                />

                <SettingRow
                  icon={Lock}
                  title="Secure processing mode"
                  description="Keep document processing within the secure workspace."
                  enabled={secureMode}
                  onChange={() =>
                    setSecureMode((value) => !value)
                  }
                />
              </div>
            </section>

            {/* System */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="font-semibold text-slate-950">
                System
              </h2>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">
                  Comply Extract
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Document Intelligence Platform · Version 1.0
                </p>

                <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  System operational
                </div>
              </div>
            </section>
          </div>
        </div>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  enabled,
  onChange,
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
          <Icon size={17} />
        </div>

        <div>
          <p className="text-sm font-medium text-slate-800">
            {title}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {description}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition ${
          enabled ? "bg-slate-950" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
            enabled ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}