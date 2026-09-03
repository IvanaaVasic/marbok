import imageUrlBuilder from "@sanity/image-url";
import clientConfig from "../sanity/config/client-config";

function urlFromThumbnail(source) {
  if (!source) {
    return null;
  }
  return imageUrlBuilder(clientConfig)?.image(source)?.url();
}

function urlFromOriginalImage(source) {
  if (!source) {
    return null;
  }

  return imageUrlBuilder(clientConfig)
    ?.image(source)
    ?.ignoreImageParams()
    ?.auto("format")
    ?.url();
}

export { urlFromThumbnail, urlFromOriginalImage };
