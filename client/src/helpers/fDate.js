// Shows dates like 5 Nov 2026
export const fDate = (dateString) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const year = date.getFullYear();
    const month = date.toLocaleString("en-AU", { month: "short" });

    return `${day} ${month} ${year}`;
};

// "2026-11-05", the format the server expects for booking dates
export const toDateString = (date) => {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
};

// The day after, so check-out is always at least 1 night later
export const nextDay = (date) => {
    return new Date(date.getTime() + 24 * 60 * 60 * 1000);
};

// Nights between two dates, counting days only (not hours)
export const countNights = (startDate, endDate) => {
    const oneDay = 24 * 60 * 60 * 1000;
    return Math.round((new Date(toDateString(endDate)) - new Date(toDateString(startDate))) / oneDay);
};