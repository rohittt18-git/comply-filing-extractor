import {
  BarChart3,
  FileText,
  Layers3,
  Files,
} from "lucide-react";
import { getExtractionHistory } from "../services/storage";

export default function Analytics() {
  const history = getExtractionHistory();

  const totalDocuments = history.length;

  const totalPages = history.reduce(
    (sum, item) => sum + Number(item.pages || 0),
    0
  );

  const totalSections = history.reduce(
    (sum, item) => sum + Number(item.sectionCount || 0),
    0
  );

  const averageSections =
    totalDocuments > 0
      ? Math.round(totalSections / totalDocuments)
      : 0;

  const stats = [
    {
      label: "Documents processed",
      value: totalDocuments,
      icon: Files,
    },
    {
      label: "Pages processed",
      value: totalPages,
      icon: FileText,
    },
    {
      label: "Sections extracted",
      value: totalSections,
      icon: Layers3,
    },
    {
      label: "Avg. sections/document",
      value: averageSections,
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Workspace
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Analytics
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Overview of document extraction activity.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Icon size={19} />
                  </div>

                  <p className="mt-5 text-xs font-medium text-slate-400">
                    {stat.label}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-950">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-950">
              Recent extraction activity
            </h2>

            <div className="mt-5 space-y-3">
              {history.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No extraction activity yet.
                </p>
              ) : (
                history.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {item.filename}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {item.sectionCount} sections extracted
                      </p>
                    </div>

                    <span className="text-xs text-slate-400">
                      {new Date(item.extractedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
    </div>
  );
}