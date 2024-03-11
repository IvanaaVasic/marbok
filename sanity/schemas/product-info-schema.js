import { MdOutlineInfo } from "react-icons/md";

const productInfo = {
  name: "productInfo",
  title: "Product Info",
  type: "document",
  icon: MdOutlineInfo,

  fields: [
    {
      name: "name",
      title: "Ime Proizvoda",
      type: "string",
    },
    {
      name: "productKey",
      title: "Šifra Proizvoda",
      type: "string",
    },
    {
      name: "image",
      title: "Slika Proizvoda",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "price",
      title: "Cena Proizvoda",
      type: "string",
    },
    {
      name: "package",
      title: "Pakovanje",
      type: "string",
    },
    {
      name: "blockProductImages",
      type: "productImagesBlock",
    },
  ],
};

export default productInfo;
