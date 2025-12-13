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

export function isIUser(obj: unknown): obj is IUser {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  const candidate = obj as Record<string, unknown>;

  return (
    typeof candidate.name === "string" &&
    Object.values(Sex).includes(candidate.sex as Sex) &&
    (typeof candidate.age === "number" || candidate.age === null) &&
    typeof candidate.location === "string"
  );
}
