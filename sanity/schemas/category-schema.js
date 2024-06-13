import { TbCategoryPlus } from "react-icons/tb";

const categoryPage = {
    name: "categoryPage",
    title: "Kategorije proizvoda",
    type: "document",
    icon: TbCategoryPlus,
    fields: [
        {
            name: "title",
            title: "Ime kategorije proizvoda",
            type: "string",
        },
        {
            name: "slug",
            title: "Slug",
            type: "slug",
            options: {
                source: "title",
                maxLength: 96,
            },
        },
        // Groups

        {
            name: "categoryProducts",
            title: "Proizvodi kategorije",
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
};

export default categoryPage;
