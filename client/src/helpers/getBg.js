import { colors } from "../theme";

// Colour of the booking status badge
export const getStatusBackgroundColor = (status) => {
    if (status === "completed") return "green";
    else if (status === "ongoing") return colors.primary;
    else return colors.accent;
};