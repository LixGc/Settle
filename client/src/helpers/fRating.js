import { AntDesign } from "@expo/vector-icons";
import { colors } from "../theme";

export const generateStars = (count) => {
    const stars = [];
    for (let i = 1; i <= count; i++) {
        stars.push(<AntDesign name="star" key={i} size={12} color={colors.accent} />);
    }
    return stars;
};