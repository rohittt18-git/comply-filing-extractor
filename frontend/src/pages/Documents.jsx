import {
  FileText,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getExtractionHistory } from "../services/storage";

export default function Documents() {
  const navigate = useNavigate();
  const documents = getExtractionHistory();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              Workspace
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Documents
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Browse documents processed in this workspace.
            </p>
          </div>

          {documents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
              <FolderOpen
                size={32}
                className="mx-auto text-slate-300"
              />

              <h2 className="mt-4 font-semibold text-slate-900">
                No documents yet
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Upload a PDF from the Dashboard to see it here.
              </p>

              <button
                onClick={() => navigate("/dashboard")}
                className="mt-6 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {documents.map((document) => (
                  <div
                    key={document.id}
                    className="flex flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                        <FileText size={20} />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate font-semibold text-slate-900">
                          {document.filename}
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                          {document.pages} pages ·{" "}
                          {document.sectionCount} sections
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        navigate("/dashboard", {
                          state: {
                            extractionResult: {
                              filename: document.filename,
                              pages: document.pages,
                              sections: document.sections,
                            },
                          },
                        })
                      }
                      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Open
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}