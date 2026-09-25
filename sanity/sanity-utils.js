import { createClient, groq } from "next-sanity";
import clientConfig from "./config/client-config";
import { auth } from "@/config/firebase";

export async function getPages() {
    if (typeof window !== "undefined") return browserCatalog("pages");
    return serverClient().fetch(
        groq`*[_type == "page" && _id == 'be35d245-f2fa-4f0b-b0aa-27c099c40c55'][0]{
      content[]->{
        "image": image.asset->url,
        title,
        contentArea[]->{
          productKey,
          image,
          package,
          name,
          _id,
          blockProductImages,
        }
      }
    }`
    );
}

export async function getImages() {
    if (typeof window !== "undefined") return browserCatalog("images");
    return serverClient().fetch(groq`*[_type == "heroImages"]`);
}

export async function getHeading() {
    if (typeof window !== "undefined") return browserCatalog("heading");
    return serverClient().fetch(groq`*[_type == "mainHeading"]`);
}

export async function getBrandImages() {
    if (typeof window !== "undefined") return browserCatalog("brands");
    return serverClient().fetch(groq`*[_type == "brandImages"]`);
}

export async function getAboutUs() {
    if (typeof window !== "undefined") return browserCatalog("about");
    return serverClient().fetch(groq`*[_type == "aboutUs"]`);
}

export async function getCategories() {
    if (typeof window !== "undefined") return browserCatalog("categories");
    return serverClient().fetch(
        groq`*[_type == "categoryPage"]{
                title,
                slug,
              categoryProducts[]->{
                "image": image.asset->url,
                title,
                contentArea[]->{
                  productKey,
                  image,
                  package,
                  name,
                  _id,
                  blockProductImages,
                }
              }
            }`
    );
}

// Public catalog reads only. Mutations and private records live in authenticated API routes.
export async function getStores() { return []; }

function serverClient() {
    if (!process.env.SANITY_API_TOKEN) throw new Error("SANITY_API_TOKEN missing");
    return createClient({ ...clientConfig, token: process.env.SANITY_API_TOKEN, useCdn: false });
}

async function browserCatalog(kind) {
    const token = await auth.currentUser?.getIdToken();
    if (!token) throw new Error("Prijava je potrebna.");
    const response = await fetch(`/api/catalog-data?kind=${encodeURIComponent(kind)}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) throw new Error("Katalog nije dostupan.");
    return (await response.json()).data;
}
