import { colors } from "../theme";

export const getStatusBackgroundColor = (status) => {
    if (status === "completed") return "green";
    else if (status === "ongoing") return colors.primary;
    else return colors.accent;
};