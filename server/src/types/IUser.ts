enum Gender {
  MALE,
  FEMALE,
  UNSPECIFIED,
}

interface IUser {
  name: string;
  gender: Gender;
  age: number | null;
  location: string;
}

export default IUser;
export { Gender };
