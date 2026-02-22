export interface JwtLoginRequest {
  username: string;
  password: string;
}

export interface JwtLoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserDto {
  id: number;
  username: string;
  fullname?: string | null;
  role_id?: number | null;
}

