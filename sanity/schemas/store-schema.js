import { MdStorefront } from "react-icons/md";

const store = {
    name: "store",
    title: "Stores",
    type: "document",
    icon: MdStorefront,
    fields: [
        {
            name: "name",
            title: "Ime Prodavnice",
            type: "string",
        },
        {
            name: "pib",
            title: "PIB Broj",
            type: "string",
        },
        {
            name: "address",
            title: "Adresa",
            type: "string",
        },
        {
            name: "phone",
            title: "Telefon",
            type: "string",
        },
        {
            name: "email",
            title: "Email",
            type: "string",
        },
        {
            name: "contactPerson",
            title: "Ime i prezime",
            type: "string",
        },
    ],
};

export default store;
