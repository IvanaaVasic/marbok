import { DocumentIcon } from "@sanity/icons";

const page = {
  name: "page",
  title: "Page",
  type: "document",
  icon: DocumentIcon,
  fields: [
    {
      name: "name",
      title: "Name",
      type: "string",
    },
    {
      name: "content",
      title: "Sekcija Proizvoda",
      type: "array",
      initialValue: [],

      of: [
        {
          type: "reference",
          to: [
            {
              type: "productBlock",
            },
          ],
        },
      ],
    },
  ],
  //   preview: {
  //     select: {
  //       active: "active",
  //       seoImage: "seo.image",
  //       title: "title",
  //     },
  //     prepare(selection) {
  //       const { seoImage, title } = selection;

  //       return {
  //         media: seoImage,
  //         title,
  //       };
  //     },
  //   },
};

export default page;
