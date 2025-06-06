const mainHeading = {
  name: "mainHeading",
  title: "Glavni naslov",
  type: "document",
  fields: [
    {
      name: "header",
      title: "Naslov",
      type: "text",
    },
    {
      name: "description",
      title: "Opis",
      type: "text",
    },
  ],
  preview: {
    prepare(selection) {
      return {
        title: "Naslov",
        subtitle: "Opis",
      };
    },
  },
};

export default mainHeading;
