import { atom } from "jotai";
import IUser, { Sex } from "../types/IUser";

// get user data from local storage parsed as IUser
const userData: IUser = JSON.parse(localStorage.getItem("user") || "{}") || {
  name: "",
  sex: Sex.UNSPECIFIED,
  age: null,
  location: "",
};

const userAtom = atom<IUser>(userData);

export { userAtom };
