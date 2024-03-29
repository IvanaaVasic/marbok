const aboutUs = {
  name: "aboutUs",
  title: "O nama",
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

export default aboutUs;
