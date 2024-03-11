import { createClient, groq } from "next-sanity";
import clientConfig from "./config/client-config";

export async function getPages() {
  return createClient(clientConfig).fetch(
    groq`*[_type == "page" && _id == 'be35d245-f2fa-4f0b-b0aa-27c099c40c55'][0]{
      content[]->{
        "image": image.asset->url,
        title,
        contentArea[]->{
          price,
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
