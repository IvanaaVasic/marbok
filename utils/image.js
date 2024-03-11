import imageUrlBuilder from "@sanity/image-url";
import clientConfig from "../sanity/config/client-config";

function urlFromThumbnail(source) {
  return imageUrlBuilder(clientConfig).image(source).url();
}

export { urlFromThumbnail };
