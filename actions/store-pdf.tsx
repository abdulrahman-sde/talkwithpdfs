"use server";

import { db } from "@/db/db";
import { pdfs } from "@/db/schema";
import cloudinary from "@/lib/cloudinary";
// type MinimalCloudinaryResult = {
//   secure_url: string;
//   display_name: string;
// };
export default async function storePdfToDb(formData: FormData) {
  const file = formData.get("file") as File;
  console.log(file);
  if (!file) {
    console.log("File not provided");
  }
  const originalName = file.name.replace(/\.[^/.]+$/, "");

  // Convert File -> Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const result = await new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "raw", // use raw for pdfs
          public_id: originalName,
          folder: "pdfs",
          format: "pdf", // 👈 force extension in the URL
          use_filename: true, // 👈 keep original filename
          unique_filename: false, // 👈 don’t append random chars
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      )
      .end(buffer);
  });

  await db.insert(pdfs).values({
    fileUrl: result.secure_url,
    title: result.display_name.slice(-4),
    userId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  });

  return result;
}
