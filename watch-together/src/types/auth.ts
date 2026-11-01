export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  status: "success";
  message: string;
  data: {
    accessToken: string;
    user: User;
  };
}

export interface RegisterResponse {
  status: "success";
  message: string;
  data: {
    user: User;
  };
}

export interface CurrentUserResponse {
  status: "success";
  data: {
    user: User;
  };
}
