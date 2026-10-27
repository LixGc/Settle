export const fPrice = (price) => {
    return Number(price).toLocaleString("en-AU", {
        style: "currency",
        currency: "AUD",
    });
};