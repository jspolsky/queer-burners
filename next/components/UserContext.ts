import { createContext, Dispatch, SetStateAction } from "react";

type UserContextProps = {
  userData?: any;
  setUserData: Dispatch<SetStateAction<any | undefined>>;
};

const UserContext = createContext<UserContextProps>({
  userData: undefined,
  setUserData: () => undefined,
});

export default UserContext;
