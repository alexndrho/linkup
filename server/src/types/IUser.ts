enum Sex {
  MALE = "M",
  FEMALE = "F",
  UNSPECIFIED = "",
}

interface IUser {
  name: string;
  sex: Sex;
  age: number | null;
  location: string | null;
}

export default IUser;
export { Sex };
