export const fDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const year = date.getFullYear();
    const month = date.toLocaleString("en-AU", { month: "short" });

    return `${day} ${month} ${year}`;
};