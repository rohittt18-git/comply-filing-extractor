import {
  History as HistoryIcon,
  FileText,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  clearExtractionHistory,
  getExtractionHistory,
} from "../services/storage";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState(
    getExtractionHistory()
  );

  const handleClear = () => {
    clearExtractionHistory();
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Workspace
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                Extraction History
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                Review previously processed filings.
              </p>
            </div>

            {history.length > 0 && (
              <button
                onClick={handleClear}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} />
                Clear history
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
              <HistoryIcon
                size={32}
                className="mx-auto text-slate-300"
              />

              <h2 className="mt-4 font-semibold text-slate-900">
                No extraction history
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Your completed PDF extractions will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                      <FileText size={20} />
                    </div>

                    <div>
                      <p className="font-semibold text-slate-900">
                        {item.filename}
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        {item.pages} pages ·{" "}
                        {item.sectionCount} sections ·{" "}
                        {new Date(item.extractedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      navigate("/dashboard", {
                        state: {
                          extractionResult: {
                            filename: item.filename,
                            pages: item.pages,
                            sections: item.sections,
                          },
                        },
                      })
                    }
                    className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    View extraction
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
    </div>
  );
}