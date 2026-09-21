import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileText,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useLocation } from "react-router-dom";

import FileUploader from "../components/FileUploader";
import { saveExtractionHistory } from "../services/storage";

/* =========================================================
   TIME-BASED GREETING
========================================================= */

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "Good evening";
  }

  return "Good night";
}

/* =========================================================
   GET LOGGED-IN USER
========================================================= */

function getLoggedInUser() {
  try {
    const storedUser = localStorage.getItem("comply_user");

    if (!storedUser) {
      return {
        name: "User",
        email: "",
      };
    }

    const parsedUser = JSON.parse(storedUser);

    return {
      name: parsedUser.name || "User",
      email: parsedUser.email || "",
    };
  } catch (error) {
    console.error("Failed to read user information:", error);

    return {
      name: "User",
      email: "",
    };
  }
}

/* =========================================================
   DASHBOARD
========================================================= */

export default function Dashboard() {
  const location = useLocation();

  const [extractionResult, setExtractionResult] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [jsonCopied, setJsonCopied] = useState(false);

  /*
   * Keep user information in state so the UI can display
   * the currently logged-in user.
   */
  const [user, setUser] = useState(getLoggedInUser());

  /*
   * Greeting is stored in state so the text can update
   * automatically if the user keeps the dashboard open
   * while the time changes.
   */
  const [greeting, setGreeting] = useState(getGreeting());

  const sections = extractionResult?.sections || [];

  /* =======================================================
     UPDATE GREETING
  ======================================================= */

  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getGreeting());
    };

    updateGreeting();

    /*
     * Check every minute so the greeting changes without
     * requiring the user to refresh the page.
     */
    const interval = setInterval(updateGreeting, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  /* =======================================================
     UPDATE USER
  ======================================================= */

  useEffect(() => {
    setUser(getLoggedInUser());
  }, []);

  /* =======================================================
     OPEN EXTRACTION FROM DOCUMENTS / HISTORY
  ======================================================= */

  useEffect(() => {
    if (location.state?.extractionResult) {
      setExtractionResult(location.state.extractionResult);
      setExpandedSections({});
      setSearchQuery("");
      setShowJsonPreview(false);
      setJsonCopied(false);

      /*
       * Clear browser navigation state so refreshing the
       * Dashboard does not repeatedly restore the same item.
       */
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  /* =======================================================
     SEARCH
  ======================================================= */

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) {
      return sections;
    }

    const query = searchQuery.toLowerCase();

    return sections.filter((section) => {
      return (
        section.heading?.toLowerCase().includes(query) ||
        section.text?.toLowerCase().includes(query)
      );
    });
  }, [sections, searchQuery]);

  /* =======================================================
     EXTRACTION COMPLETE
  ======================================================= */

  const handleExtractionComplete = (result) => {
    setExtractionResult(result);
    setExpandedSections({});
    setSearchQuery("");
    setShowJsonPreview(false);
    setJsonCopied(false);

    /*
     * Save the extraction for:
     * Documents
     * History
     * Analytics
     */
    saveExtractionHistory(result);
  };

  /* =======================================================
     COPY SECTION
  ======================================================= */

  const handleCopy = async (section) => {
    const content = `${section.heading}\n\n${
      section.text || "No body text detected."
    }`;

    try {
      await navigator.clipboard.writeText(content);

      setCopiedId(section.id);

      setTimeout(() => {
        setCopiedId(null);
      }, 1800);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  /* =======================================================
     DOWNLOAD JSON
  ======================================================= */

  const handleDownloadJson = () => {
    if (!extractionResult) {
      return;
    }

    const blob = new Blob(
      [JSON.stringify(extractionResult, null, 2)],
      {
        type: "application/json",
      }
    );

    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");

    anchor.href = url;

    anchor.download = `${extractionResult.filename.replace(
      /\.pdf$/i,
      ""
    )}-extracted.json`;

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(url);
  };

  /* =======================================================
     COPY JSON
  ======================================================= */

  const handleCopyJson = async () => {
    if (!extractionResult) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(extractionResult, null, 2)
      );

      setJsonCopied(true);

      setTimeout(() => {
        setJsonCopied(false);
      }, 1800);
    } catch (error) {
      console.error("JSON copy failed:", error);
    }
  };

  /* =======================================================
     TOGGLE SECTION
  ======================================================= */

  const toggleSection = (id) => {
    setExpandedSections((previous) => ({
      ...previous,
      [id]: !previous[id],
    }));
  };

  const totalPages = extractionResult?.pages || 0;

  const userName = user.name || "User";

  const userInitial =
    userName.charAt(0).toUpperCase() || "U";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ===================================================
          TOP BAR
      ==================================================== */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="flex h-20 items-center justify-between px-6 lg:px-10">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              Secure workspace
            </p>

            <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <ShieldCheck
                size={15}
                className="text-emerald-600"
              />

              Your filing documents are processed securely.
            </div>
          </div>

          {/* USER PROFILE */}

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-900">
                {userName}
              </p>

              <p className="text-xs text-slate-400">
                Administrator
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
              {userInitial}
            </div>
          </div>
        </div>
      </header>

      {/* ===================================================
          MAIN CONTENT
      ==================================================== */}

      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-10">
        {/* =================================================
            PAGE HEADING
        ================================================== */}

        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Document Workspace
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            {greeting}, {userName}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Upload a filing to extract headings, sections,
            and structured document content.
          </p>
        </div>

        {/* =================================================
            UPLOAD
        ================================================== */}

        <section className="mb-8">
          <FileUploader
            onExtractionComplete={
              handleExtractionComplete
            }
          />
        </section>

        {/* =================================================
            STATS
        ================================================== */}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Documents processed"
            value={extractionResult ? "1" : "0"}
            caption="Latest workspace activity"
          />

          <StatCard
            label="Sections extracted"
            value={sections.length}
            caption="From latest document"
          />

          <StatCard
            label="Successful extraction"
            value={extractionResult ? "100%" : "—"}
            caption="Current document"
          />

          <StatCard
            label="Pages processed"
            value={totalPages || "—"}
            caption="Latest document"
          />
        </section>

        {/* =================================================
            DOCUMENT RESULT
        ================================================== */}

        {extractionResult ? (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* DOCUMENT HEADER */}

            <div className="border-b border-slate-200 px-6 py-6 lg:px-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <FileText
                        size={21}
                        className="text-slate-700"
                      />
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-bold text-slate-950">
                        {extractionResult.filename}
                      </h2>

                      <p className="mt-1 text-xs text-slate-400">
                        {extractionResult.pages} pages ·{" "}
                        {sections.length} sections extracted
                      </p>
                    </div>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="flex flex-wrap items-center gap-2">
                  {/* SEARCH */}

                  <div className="relative">
                    <Search
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(event) =>
                        setSearchQuery(event.target.value)
                      }
                      placeholder="Search filing..."
                      className="h-10 w-52 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white"
                    />
                  </div>

                  {/* JSON */}

                  <button
                    type="button"
                    onClick={() =>
                      setShowJsonPreview(true)
                    }
                    className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    <FileText size={16} />
                    View JSON
                  </button>
                </div>
              </div>
            </div>

            {/* SEARCH COUNT */}

            {searchQuery && (
              <div className="border-b border-slate-100 bg-slate-50 px-6 py-3 text-xs text-slate-500 lg:px-8">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {filteredSections.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {sections.length}
                </span>{" "}
                sections
              </div>
            )}

            {/* =================================================
                SECTIONS
            ================================================== */}

            <div className="divide-y divide-slate-100">
              {filteredSections.length > 0 ? (
                filteredSections.map(
                  (section, index) => {
                    const isExpanded =
                      expandedSections[section.id] !== false;

                    const hasBody = Boolean(
                      section.text?.trim()
                    );

                    return (
                      <article
                        key={section.id}
                        className="group px-6 py-7 transition hover:bg-slate-50/60 lg:px-10"
                      >
                        <div className="flex gap-5">
                          {/* NUMBER */}

                          <div className="hidden shrink-0 pt-1 sm:block">
                            <span className="text-xs font-bold tabular-nums text-slate-300">
                              {String(index + 1).padStart(
                                2,
                                "0"
                              )}
                            </span>
                          </div>

                          {/* CONTENT */}

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                                    Page {section.page}
                                  </span>

                                  {!hasBody && (
                                    <span className="rounded-md bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-600">
                                      No body text
                                    </span>
                                  )}
                                </div>

                                <h3 className="text-lg font-bold tracking-tight text-slate-950">
                                  {section.heading}
                                </h3>
                              </div>

                              {/* SECTION ACTIONS */}

                              <div className="flex shrink-0 items-center gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                                {hasBody && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      toggleSection(
                                        section.id
                                      )
                                    }
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700"
                                    title={
                                      isExpanded
                                        ? "Collapse section"
                                        : "Expand section"
                                    }
                                  >
                                    {isExpanded ? (
                                      <ChevronUp
                                        size={17}
                                      />
                                    ) : (
                                      <ChevronDown
                                        size={17}
                                      />
                                    )}
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCopy(section)
                                  }
                                  className="rounded-lg p-2 text-slate-400 transition hover:bg-white hover:text-slate-700"
                                  title="Copy section"
                                >
                                  {copiedId === section.id ? (
                                    <CheckCircle2
                                      size={17}
                                      className="text-emerald-600"
                                    />
                                  ) : (
                                    <Copy size={17} />
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* BODY */}

                            {isExpanded && (
                              <div className="mt-4 max-w-5xl">
                                {hasBody ? (
                                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
                                    {section.text}
                                  </p>
                                ) : (
                                  <p className="text-sm italic text-slate-400">
                                    This section contains
                                    a heading but no
                                    extractable body text.
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  }
                )
              ) : (
                <div className="px-6 py-16 text-center lg:px-10">
                  <Search
                    size={28}
                    className="mx-auto text-slate-300"
                  />

                  <h3 className="mt-4 text-sm font-semibold text-slate-800">
                    No matching sections
                  </h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Try a different heading or keyword.
                  </p>
                </div>
              )}
            </div>

            {/* DOCUMENT FOOTER */}

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 lg:px-10">
              <div className="flex flex-col gap-2 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                <span>
                  {filteredSections.length} sections
                  displayed
                </span>

                <span>
                  Extraction completed successfully
                </span>
              </div>
            </div>
          </section>
        ) : (
          /* =================================================
             EMPTY STATE
          ================================================== */

          <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <FileText
                size={25}
                className="text-slate-500"
              />
            </div>

            <h2 className="mt-5 text-base font-bold text-slate-900">
              Waiting for your first filing
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-400">
              Upload a PDF above to extract its structure
              and view the document in an organized
              reading workspace.
            </p>
          </section>
        )}
      </div>

      {/* =====================================================
          JSON PREVIEW MODAL
      ====================================================== */}

      {showJsonPreview && extractionResult && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={() => setShowJsonPreview(false)}
        >
          <div
            className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <FileText size={18} />
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-950">
                    JSON Preview
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Structured extraction result
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowJsonPreview(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close JSON preview"
              >
                ×
              </button>
            </div>

            {/* MODAL METADATA */}

            <div className="grid grid-cols-1 gap-3 border-b border-slate-100 bg-slate-50 px-6 py-4 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Document
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                  {extractionResult.filename}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Pages
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {extractionResult.pages}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Sections
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {extractionResult.sections?.length || 0}
                </p>
              </div>
            </div>

            {/* JSON VIEWER */}

            <div className="min-h-0 flex-1 overflow-auto bg-slate-950 p-5">
              <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-slate-200">
                {JSON.stringify(
                  extractionResult,
                  null,
                  2
                )}
              </pre>
            </div>

            {/* MODAL FOOTER */}

            <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400">
                Review the structured extraction before
                downloading.
              </p>

              <div className="flex items-center gap-2">
                {/* COPY */}

                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  {jsonCopied ? (
                    <>
                      <CheckCircle2
                        size={16}
                        className="text-emerald-600"
                      />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy JSON
                    </>
                  )}
                </button>

                {/* DOWNLOAD */}

                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="flex h-10 items-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  <Download size={16} />
                  Download JSON
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   STAT CARD
========================================================= */

function StatCard({
  label,
  value,
  caption,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400">
            {label}
          </p>

          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {caption}
          </p>
        </div>

        <div className="h-2 w-2 rounded-full bg-emerald-500" />
      </div>
    </div>
  );
}