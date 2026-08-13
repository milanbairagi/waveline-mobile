// TODO: Add more fields to the User
interface User {
  id: number;
  username: string;
  password: string;
}

export type CreateUserDto = Omit<User, "id">;
export type UserResponse = Omit<User, "password">;

export type Tokens = {
  access: string;
  refresh: string;
};
