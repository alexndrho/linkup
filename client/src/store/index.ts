import { atom } from "jotai";
import IUser, { Sex } from "../types/IUser";

const userAtom = atom<IUser>({
  name: "",
  sex: Sex.UNSPECIFIED,
  age: null,
  location: "",
});

export { userAtom };
