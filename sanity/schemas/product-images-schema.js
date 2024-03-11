import { ImagesIcon, BlockElementIcon } from "@sanity/icons";
import pluralize from "pluralize-esm";

export default {
  name: "productImagesBlock",
  title: "Slike proizvoda",
  type: "object",
  icon: ImagesIcon,
  fields: [
    // Groups
    {
      name: "productImages",
      title: "Slike proizvoda",
      type: "array",
      of: [
        {
          name: "group",
          title: "Group",
          type: "object",
          icon: BlockElementIcon,
          fields: [
            {
              name: "image",
              title: "Image",
              type: "image",
              options: {
                hotspot: true,
              },
            },
          ],
          preview: {
            prepare() {
              return {
                title: "Slike proizvoda",
                subtitle: "Images",
              };
            },
          },
        },
      ],
    },
  ],
  preview: {
    select: {
      product: "productImages",
      url: "url",
    },
    prepare(selection) {
      const { product } = selection;
      return {
        subtitle: "Slike proizvoda",
        title:
          product.length > 0
            ? pluralize("group", product.length, true)
            : "No groups",
      };
    },
  },
};
