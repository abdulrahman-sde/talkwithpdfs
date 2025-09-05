import { verifyWebhook, WebhookEvent } from "@clerk/nextjs/webhooks";
import { db } from "@/db/db";
import { users } from "@/db/schema";
import { NextRequest } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const evt: WebhookEvent = await verifyWebhook(req);

  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data;

    if (!id || !email_addresses?.length) {
      return new Response("Error occurred -- missing user data", {
        status: 400,
      });
    }

    try {
      const userData = {
        email: email_addresses[0].email_address,
        name: [first_name, last_name].filter(Boolean).join(" "),
        clerkId: id,
        imageUrl: image_url,
      };

      // Insert user into DB
      const [insertedUser] = await db
        .insert(users)
        .values(userData)
        .returning();

      // ✅ Get clerk client instance and update user with DB user ID
      const clerk = await clerkClient();
      await clerk.users.updateUser(id, {
        publicMetadata: {
          dbUserId: insertedUser.id,
        },
      });

      return new Response("✅ User created successfully", { status: 200 });
    } catch (err) {
      console.error("Error creating user in DB:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      return new Response(
        JSON.stringify({ error: errorMessage, message: "DB insert failed" }),
        { status: 500 }
      );
    }
  }

  return new Response("Event ignored", { status: 200 });
}
