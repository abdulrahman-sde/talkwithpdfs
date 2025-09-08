"use server";

import { v2 as cloudinary } from "cloudinary";

import { db } from "@/db/db";
import { pdfs } from "@/db/schema";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

type CloudinaryResult = {
  secure_url: string;
  display_name: string;
  [key: string]: any;
};

export default async function storePdfToDb(file: File, userId: string) {
  const originalName = file.name.replace(/\.[^/.]+$/, "");

  // Convert File -> Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Claudinary Upload
  const result = await new Promise<CloudinaryResult>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "raw",
          public_id: originalName,
          folder: "pdfs",
          format: "pdf",
          use_filename: true,
          unique_filename: false,
        },
        (error, result) => {
          if (error) reject(error);
          else if (result) {
            resolve({
              display_name:
                (result as any).display_name || result.original_filename || "",
              ...result,
            } as CloudinaryResult);
          } else {
            reject(new Error("No result returned from Cloudinary"));
          }
        }
      )
      .end(buffer);
  });
  const fileUrl = result.secure_url;
  // Saving to Postgres DB
  const title = result.display_name.slice(0, -4);
  const [pdfRecord] = await db
    .insert(pdfs)
    .values({
      fileUrl,
      title,
      userId,
    })
    .returning({ id: pdfs.id });

  return {
    pdfId: pdfRecord.id,
    title,
    fileUrl,
  };
}
