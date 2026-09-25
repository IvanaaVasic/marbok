import { createClient } from "next-sanity";
import clientConfig from "@/sanity/config/client-config";

export function serverSanityClient() {
    if (!process.env.SANITY_API_TOKEN) {
        throw new Error("SANITY_API_TOKEN is not configured");
    }
    return createClient({ ...clientConfig, useCdn: false, token: process.env.SANITY_API_TOKEN });
}
