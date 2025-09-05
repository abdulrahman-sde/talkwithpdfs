"use server";

import { db } from "@/db/db";
import { pdfs, users } from "@/db/schema";
import cloudinary from "@/lib/cloudinary";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
type CloudinaryResult = {
  secure_url: string;
  display_name: string;
  [key: string]: any;
};
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

  const result = await new Promise<CloudinaryResult>((resolve, reject) => {
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
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }
  const userFromDb = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId));

  await db.insert(pdfs).values({
    fileUrl: result.secure_url,
    title: result.display_name.slice(-4),
    userId: userFromDb[0]?.id,
  });

  return "success";
}
