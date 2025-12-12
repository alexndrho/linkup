export enum Sex {
  MALE = "M",
  FEMALE = "F",
  UNSPECIFIED = "",
}

export interface IUser {
  name: string;
  sex: Sex;
  age: number | null;
  location: string;
}

// export interface IUserStranger extends IUser {
//   isDisconnected: boolean;
// }
