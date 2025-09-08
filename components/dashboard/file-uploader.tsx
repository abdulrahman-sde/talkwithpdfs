"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { MultiStepLoader as Loader } from "../ui/multistep-loader";
import { IconFileTextSpark, IconSquareRoundedX } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import handlePdfEmbeddings from "@/actions/handlePdfEmbeddings";
import { loadingStates } from "@/constants/constant";
import { validatePdf } from "@/lib/utils";

export function FileUploader() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const router = useRouter();
  const handleFileUpload = async (files: File[]) => {
    setFiles(files); // ✅ only one file stored
  };

  const storePdf = async () => {
    if (files.length === 0) return;

    setLoading(true);
    setModalLoading(true);

    try {
      const validation = validatePdf(files[0]);
      if (!validation.valid) {
        return console.log(validation.error);
      }
      const res = await handlePdfEmbeddings(files[0]);
      if (!res.success) {
        return console.log(res.message);
      }
      if (res.redirectUrl) {
        router.push(res.redirectUrl);
      }
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
