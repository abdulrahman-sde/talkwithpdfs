import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/db/db";
import { users } from "@/db/schema";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // ✅ headers() is not async
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- missing svix headers", {
      status: 400,
    });
  }

  // Get the body as string for verification
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Verify with Svix
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: any;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("❌ Error verifying webhook:", err);
    return new Response("Invalid signature", { status: 400 });
  }

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
