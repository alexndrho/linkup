enum Sex {
  MALE = "M",
  FEMALE = "F",
  UNSPECIFIED = "",
}

interface IUser {
  name: string;
  sex: Sex;
  age: number | null;
  location: string;
}

interface IUserStranger extends IUser {
  isDisconnected: boolean;
}

export default IUser;
export { Sex };
export type { IUserStranger };
