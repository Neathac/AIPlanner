export interface User {
    id: string;
    name: string;
    email: string;
    pic?: string;
    docNum: number;
  }

export const NOBODY: User = {
  id: "",
  name: "",
  email: "",
  docNum: 0,
};
