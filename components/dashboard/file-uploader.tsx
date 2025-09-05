"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { MultiStepLoader as Loader } from "../ui/multistep-loader";
import { IconFileTextSpark, IconSquareRoundedX } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import storePdfToDb from "@/actions/store-pdf";

const loadingStates = [
  { text: "Uploading PDF to cloud" },
  { text: "Storing file securely" },
  { text: "Extracting text from PDF" },
  { text: "Splitting content into chunks" },
  { text: "Generating vector embeddings" },
  { text: "Saving vectors to database" },
  { text: "Preparing chat session" },
];

export function FileUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const handleFileUpload = async (files: File[]) => {
    setFiles(files); // ✅ only one file stored
    console.log(files);
  };

  const router = useRouter();

  const storePdf = async () => {
    if (files.length === 0) return;

    const formData = new FormData();
    formData.append("file", files[0]); // ✅ use "file" (singular)

    setLoading(true);
    setModalLoading(true);

    try {
      const result = await storePdfToDb(formData);
      console.log("Uploaded to Cloudinary:", result);

      // later replace with dynamic chat id
      router.push("/chat/123");
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setLoading(false);
      setModalLoading(false);
    }
  };

  return (
    <div className="w-full h-full border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg flex justify-center items-center flex-col">
      <FileUpload onChange={handleFileUpload} />

      {files.length > 0 && (
        <button
          disabled={loading}
          onClick={storePdf}
          className="relative flex items-center justify-center gap-3 rounded-lg bg-primary px-6 py-2.5 text-white shadow-md transition-all duration-300 hover:bg-[oklch(0.62_0.14_39.15_/_0.9)] cursor-pointer"
        >
          <IconFileTextSpark />
          Upload PDF
          {loading && <Loader2 className="animate-spin" />}
        </button>
      )}

      <div>
        <Loader
          loadingStates={loadingStates}
          loading={modalLoading}
          duration={2000}
        />
      </div>

      {loading && (
        <button
          className="fixed top-4 right-4 text-black dark:text-white z-[120]"
          onClick={() => setModalLoading(false)}
        >
          <IconSquareRoundedX className="h-10 w-10" />
        </button>
      )}
    </div>
  );
}
