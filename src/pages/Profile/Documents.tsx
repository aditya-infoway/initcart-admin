// src/pages/Profile/Documents.tsx
import React, { useState, useEffect } from "react";
import apiClient from "../../api/apiClient";
import { FaFileAlt } from "react-icons/fa";
import Swal from "sweetalert2";

interface DocConfig {
  key: "contact_us_pdf" | "privacy_policy_pdf" | "terms_conditions_pdf" | "return_cancellation_pdf" | "refund_pdf";
  label: string;
}

const DOC_CONFIGS: DocConfig[] = [
  { key: "contact_us_pdf", label: "Contact Us" },
  { key: "privacy_policy_pdf", label: "Privacy Policy" },
  { key: "terms_conditions_pdf", label: "Terms & Conditions" },
  { key: "return_cancellation_pdf", label: "Return & Cancellation" },
  { key: "refund_pdf", label: "Refund " },
];

interface DocState {
  fileName: string;
  fileUrl: string;
  newFile?: File;
}

type DocsState = Record<string, DocState>;

const emptyDocs = (): DocsState =>
  DOC_CONFIGS.reduce((acc, cfg) => {
    acc[cfg.key] = { fileName: "", fileUrl: "" };
    return acc;
  }, {} as DocsState);

const Documents: React.FC = () => {
  const [docs, setDocs] = useState<DocsState>(emptyDocs());
  const [saving, setSaving] = useState(false);

  const loadDocuments = () => {
    apiClient.get("superadmin-documents/").then((res) => {
      if (!res.data) return;
      const updated = emptyDocs();
      DOC_CONFIGS.forEach((cfg) => {
        const fileValue = res.data[cfg.key];
        const urlValue = res.data[cfg.key + "_url"];
        if (fileValue) {
          updated[cfg.key] = {
            fileName: String(fileValue).split("/").pop() || cfg.label,
            fileUrl: urlValue || "",
          };
        }
      });
      setDocs(updated);
    });
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileSelect = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : undefined;
    if (!file) return;

    if (file.type !== "application/pdf") {
      Swal.fire({
        icon: "error",
        title: "Invalid File",
        text: "Please upload PDF file only",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      Swal.fire({
        icon: "error",
        title: "File Too Large",
        text: "PDF file size should be less than 10MB",
      });
      return;
    }

    setDocs((prev) => ({
      ...prev,
      [key]: {
        fileName: file.name,
        fileUrl: URL.createObjectURL(file),
        newFile: file,
      },
    }));
  };

  const handleRemove = (key: string, label: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will remove the " + label + " document",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, remove it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const updated = {
          ...docs,
          [key]: { fileName: "", fileUrl: "" },
        };
        setDocs(updated);
        saveDocuments(updated, key);
      }
    });
  };

  const saveDocuments = async (currentDocs: DocsState = docs, clearedKey?: string) => {
    setSaving(true);
    const fd = new FormData();

    DOC_CONFIGS.forEach((cfg) => {
      const entry = currentDocs[cfg.key];
      if (entry.newFile) {
        fd.append(cfg.key, entry.newFile);
      } else if (cfg.key === clearedKey) {
        fd.append(cfg.key, "");
      }
    });

    try {
      const response = await apiClient.put("superadmin-documents/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: (response.data && response.data.message) || "Documents updated successfully",
        confirmButtonColor: "#2563eb",
      });

      loadDocuments();
    } catch (error: any) {
      console.error("Document save error:", error);

      const errorData = error.response ? error.response.data : null;
      let errorMessage = "Failed to save documents. Please try again.";

      if (errorData && typeof errorData === "object") {
        errorMessage = Object.keys(errorData)
          .map((key) => {
            const val = errorData[key];
            return Array.isArray(val) ? key + ": " + val.join(", ") : String(val);
          })
          .join("\n");
      }

      Swal.fire({
        icon: "error",
        title: "Error!",
        text: errorMessage,
        confirmButtonColor: "#d33",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="bg-gradient-to-r from-blue-950 to-blue-700 text-white rounded-xl shadow-lg p-8 mb-8">
        <h2 className="text-3xl font-bold flex items-center gap-3">
          <FaFileAlt />
          Documents
        </h2>
        <p className="mt-2 text-blue-200 text-sm">
          Upload and manage the PDF documents shown on the website.
        </p>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        {DOC_CONFIGS.map((cfg) => {
          const entry = docs[cfg.key];
          return (
            <div key={cfg.key} className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-800">
                {cfg.label}
              </h3>

              <div className="flex flex-wrap items-center gap-4">
                <label className="px-6 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 cursor-pointer transition flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {entry.fileName ? "Replace PDF" : "Upload PDF"}
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileSelect(cfg.key, e)}
                    className="hidden"
                  />
                </label>

                {entry.fileName ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-green-600 flex items-center gap-1 bg-green-50 px-3 py-1.5 rounded-md">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {entry.fileName}
                    </span>
                    <button
                      onClick={() => handleRemove(cfg.key, cfg.label)}
                      className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </div>
                ) : null}
              </div>

              {entry.fileUrl ? (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <a
                    href={entry.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 underline text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Preview Uploaded PDF
                  </a>
                </div>
              ) : null}
            </div>
          );
        })}

        <div className="bg-white p-6 rounded-xl shadow-md">
          <button
            onClick={() => saveDocuments()}
            disabled={saving}
            className="px-8 py-3 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Documents
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Documents;