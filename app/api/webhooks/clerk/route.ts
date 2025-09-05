import { verifyWebhook } from "@clerk/nextjs/webhooks";

import { db } from "@/db/db";
import { users } from "@/db/schema";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const evt = await verifyWebhook(req);

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    if (!id || !email_addresses?.length) {
      return new Response("Error occurred -- missing user data", {
        status: 400,
      });
    }

    try {
      const userData = {
        email: email_addresses[0].email_address,
        name: [first_name, last_name].filter(Boolean).join(" "), // ✅ safe concat
        clerkId: id,
        imageUrl: image_url, // ✅ fixed typo
      };

      await db.insert(users).values(userData);

      return new Response("✅ User created successfully", { status: 200 });
    } catch (err) {
      console.error("❌ Error creating user in DB:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      return new Response(
        JSON.stringify({ error: errorMessage, message: "DB insert failed" }),
        { status: 500 }
      );
    }
  }

  // ✅ Handle other events gracefully
  return new Response("Event ignored", { status: 200 });
}
