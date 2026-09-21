import { useRef, useState } from "react";
import {
  CheckCircle2,
  FileText,
  Loader2,
  UploadCloud,
  X,
} from "lucide-react";
import axios from "axios";

function FileUploader({ onExtractionComplete }) {
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState("");

  const validateFile = (file) => {
    if (!file) {
      return false;
    }

    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return false;
    }

    setError("");
    return true;
  };

  const handleFile = (file) => {
    if (!validateFile(file)) {
      return;
    }

    setSelectedFile(file);
    setError("");
  };

  const handleFileInput = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const extractDocument = async () => {
    if (!selectedFile) {
      setError("Please select a PDF file first.");
      return;
    }

    setIsExtracting(true);
    setError("");

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);

     const apiUrl =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

      const response = await axios.post(
        `${apiUrl}/api/extract`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (onExtractionComplete) {
        onExtractionComplete(response.data);
      }
    } catch (err) {
      console.error("Extraction error:", err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError(
          "Unable to connect to the extraction server. Make sure the FastAPI backend is running."
        );
      }
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <div className="space-y-5">

      {/* Upload area */}
      {!selectedFile && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${
            isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileInput}
          />

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <UploadCloud
              size={27}
              className="text-blue-600"
            />
          </div>

          <h3 className="mt-5 text-base font-semibold text-slate-900">
            Drop your filing here
          </h3>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Upload a PDF filing and Comply Extract will identify
            its structure, headings, and document sections.
          </p>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              fileInputRef.current?.click();
            }}
            className="mt-6 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Browse files
          </button>

          <p className="mt-3 text-xs text-slate-400">
            PDF files only
          </p>
        </div>
      )}

      {/* Selected file */}
      {selectedFile && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

          <div className="flex items-center gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
              <FileText
                size={23}
                className="text-blue-600"
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {selectedFile.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            <button
              type="button"
              onClick={removeFile}
              disabled={isExtracting}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              title="Remove file"
            >
              <X size={18} />
            </button>

          </div>

          {/* Extract button */}
          <button
            type="button"
            onClick={extractDocument}
            disabled={isExtracting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isExtracting ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Extracting document...
              </>
            ) : (
              <>
                <CheckCircle2 size={18} />
                Extract document
              </>
            )}
          </button>

        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

    </div>
  );
}

export default FileUploader;