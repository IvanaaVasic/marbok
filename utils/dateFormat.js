export const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("sr-RS", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};
