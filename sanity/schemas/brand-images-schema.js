const brandImages = {
  name: "brandImages",
  title: "Logo firme",
  type: "document",
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
    select: {
      image: "image",
    },
    prepare(selection) {
      const { image } = selection;
      return {
        title: "Logo firme",
        subtitle: "Slider slika",
        media: image,
      };
    },
  },
};

export default brandImages;
