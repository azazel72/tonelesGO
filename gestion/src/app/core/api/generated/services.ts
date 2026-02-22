import { apiConfig } from "../api.config";
import { JwtLoginRequest, JwtLoginResponse, UserDto } from "./models";

const jsonHeaders = {
  "Content-Type": "application/json"
};

export class AuthApiClient {
  async login(payload: JwtLoginRequest): Promise<JwtLoginResponse> {
    const res = await fetch(`${apiConfig.authBasePath}/login`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error(`Login failed (${res.status})`);
    }
    return (await res.json()) as JwtLoginResponse;
  }
}

export class UsersApiClient {
  async list(token: string): Promise<UserDto[]> {
    const res = await fetch(`${apiConfig.apiBasePath}/users`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) {
      throw new Error(`Users list failed (${res.status})`);
    }
    return (await res.json()) as UserDto[];
  }

  async update(token: string, id: number, payload: Partial<UserDto>): Promise<UserDto> {
    const res = await fetch(`${apiConfig.apiBasePath}/users/${id}`, {
      method: "PATCH",
      headers: {
        ...jsonHeaders,
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      throw new Error(`User update failed (${res.status})`);
    }
    return (await res.json()) as UserDto;
  }
}
