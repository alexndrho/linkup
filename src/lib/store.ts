import { atom } from "jotai";
import { type IUser, isIUser } from "@/types/user";
import { Sex } from "@/types/user";

const userDefault: IUser = {
  name: "",
  sex: Sex.UNSPECIFIED,
  age: null,
  location: "",
};

// Initialize with default to avoid hydration mismatch
export const userAtom = atom<IUser>(userDefault);
export const onlineCountAtom = atom<number>(0);

export const storeUser = (user: IUser) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const loadUser = (): IUser => {
  const stored = localStorage.getItem("user");
  if (!stored) return userDefault;

  try {
    const parsed = JSON.parse(stored);
    return isIUser(parsed) ? parsed : userDefault;
  } catch {
    return userDefault;
  }
};
