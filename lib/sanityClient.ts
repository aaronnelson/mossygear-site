// src/lib/sanityClient.ts
import { createClient } from "@sanity/client";

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local");
}
if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_DATASET in .env.local");
}

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2025-01-01", // any recent date is fine; it just locks the API version
  useCdn: true,             // cached, fast reads for public content
});
