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
        {
            name: "pass",
            title: "Sifra kupca",
            type: "string",
        },
        {
            name: "firebaseUid",
            title: "Firebase UID",
            type: "string",
            hidden: true,
        },
        {
            name: "approvalStatus",
            title: "Status pristupa cenama",
            type: "string",
            options: {
                list: [
                    { title: "Čeka odobrenje", value: "pending" },
                    { title: "Odobren", value: "approved" },
                    { title: "Odbijen", value: "rejected" },
                ],
            },
        },
        {
            name: "registeredAt",
            title: "Vreme registracije",
            type: "datetime",
        },
    ],
};

export default store;
