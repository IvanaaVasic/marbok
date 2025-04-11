import { MdShoppingCart } from "react-icons/md";

const order = {
    name: "order",
    title: "Orders",
    type: "document",
    icon: MdShoppingCart,
    fields: [
        {
            name: "orderNumber",
            title: "Order Number",
            type: "string",
        },
        {
            name: "customerName",
            title: "Customer Name",
            type: "string",
        },
        {
            name: "email",
            title: "Email",
            type: "string",
        },
        {
            name: "phone",
            title: "Phone",
            type: "string",
        },
        {
            name: "message",
            title: "Message",
            type: "text",
        },
        {
            name: "items",
            title: "Order Items",
            type: "array",
            of: [
                {
                    type: "object",
                    title: "Order Item",
                    fields: [
                        { name: "name", type: "string", title: "Product Name" },
                        { name: "quantity", type: "string", title: "Quantity" },
                        {
                            name: "productKey",
                            type: "string",
                            title: "Product Key",
                        },
                        { name: "price", type: "string", title: "Price" },
                    ],
                },
            ],
        },
        {
            name: "createdAt",
            title: "Created At",
            type: "datetime",
            options: {
                dateFormat: "YYYY-MM-DD",
                timeFormat: "HH:mm",
            },
        },
    ],
};

export default order;
