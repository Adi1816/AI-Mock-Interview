"use client";

import { Button } from "@/components/ui/button";
import { FileText, LoaderCircle, Upload } from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";

function ResumeUpload({ value, fileName, onChange, className = "" }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/resume/parse", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Failed to parse resume");
      }

      onChange({
        text: payload.text,
        fileName: payload.fileName,
      });
      toast.success("Resume uploaded");
    } catch (error) {
      toast.error(error.message);
      event.target.value = "";
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 p-4 ${className}`}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt,.md"
        className="hidden"
        onChange={handleFile}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-300">
            <FileText size={22} />
          </div>
          <div>
            <p className="font-semibold text-gray-100">{fileName || "Upload resume"}</p>
            <p className="mt-1 text-sm text-gray-400">
              PDF, DOCX, TXT, or Markdown. Text is extracted for AI context.
            </p>
            {value && (
              <p className="mt-2 text-xs text-cyan-300">{value.length.toLocaleString()} characters parsed</p>
            )}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
        >
          {loading ? <LoaderCircle className="animate-spin" size={16} /> : <Upload size={16} />}
          {loading ? "Parsing..." : "Choose File"}
        </Button>
      </div>
    </div>
  );
}

export default ResumeUpload;
