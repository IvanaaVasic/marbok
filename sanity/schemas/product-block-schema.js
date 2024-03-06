import { ImagesIcon, BlockElementIcon } from "@sanity/icons";
// import pluralize from "pluralize-esm";
import { MdOutlineProductionQuantityLimits } from "react-icons/md";

const productBlock = {
  name: "productBlock",
  title: "Products",
  type: "document",
  icon: MdOutlineProductionQuantityLimits,
  fields: [
    {
      name: "image",
      title: "Slika Sekcije Proizvoda",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "title",
      title: "Ime sekcije proizvoda",
      type: "string",
    },
    // Groups

    {
      name: "contentArea",
      title: "Proizvodi",
      type: "array",
      initialValue: [],

      of: [
        {
          type: "reference",
          to: [
            {
              type: "productInfo",
            },
          ],
        },
      ],
    },
  ],
  // preview: {
  //   select: {
  //     product: 'productImages',
  //     url: 'url',
  //   },
  //   prepare(selection) {
  //     const {product} = selection
  //     return {
  //       subtitle: 'Product Images',
  //       title: product.length > 0 ? pluralize('group', product.length, true) : 'No groups',
  //     }
  //   },
  // },
};

export default productBlock;
