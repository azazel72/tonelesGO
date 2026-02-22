import { Injectable } from "@angular/core";
import { UserDto } from "./generated/models";
import { UsersApiClient } from "./generated/services";

@Injectable({ providedIn: "root" })
export class UsersApi {
  private readonly client = new UsersApiClient();

  list(token: string): Promise<UserDto[]> {
    return this.client.list(token);
  }

  update(token: string, id: number, payload: Partial<UserDto>): Promise<UserDto> {
    return this.client.update(token, id, payload);
  }
}

