import { useQuery } from "react-query";
import { getCurrentUser } from "../methods/getCurrentUser";
import { GET_CURRENT_USER_KEY } from "../constants/getCurrentUser";

export const useGetCurrentUser = ({ uid }, options) => {
    return useQuery(
        [GET_CURRENT_USER_KEY, uid],
        () => getCurrentUser({ uid }),
        {
            enabled: !!uid && uid !== "",
            ...options,
        }
    );
};
