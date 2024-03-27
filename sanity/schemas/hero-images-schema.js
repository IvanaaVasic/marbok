const heroImages = {
  name: "heroImages",
  title: "Glavne slike",
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
        title: "Hero slika",
        subtitle: "Slider slika",
        media: image,
      };
    },
  },
};

export default heroImages;
