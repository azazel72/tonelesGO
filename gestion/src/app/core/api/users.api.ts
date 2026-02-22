import { Injectable } from "@angular/core";
import { UserDto } from "./generated/models";
import { UsersApiClient } from "./generated/services";

interface LegacyMaestrosResponse {
  usuarios?: Record<string, LegacyUsuarioDto>;
}

interface LegacyUsuarioDto {
  id?: number | null;
  alias?: string | null;
  nombre?: string | null;
  rol_id?: number | null;
}

@Injectable({ providedIn: "root" })
export class UsersApi {
  private readonly client = new UsersApiClient();

  async list(token: string): Promise<UserDto[]> {
    try {
      return await this.client.list(token);
    } catch {
      return this.listFromLegacyMaestros(token);
    }
  }

  update(token: string, id: number, payload: Partial<UserDto>): Promise<UserDto> {
    return this.client.update(token, id, payload);
  }

  private async listFromLegacyMaestros(token: string): Promise<UserDto[]> {
    const res = await fetch("/maestros", {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });

    if (!res.ok) {
      throw new Error(`Users list failed (${res.status})`);
    }

    const data = (await res.json()) as LegacyMaestrosResponse;
    const usuarios = data.usuarios ?? {};

    return Object.entries(usuarios).map(([idKey, u]) => ({
      id: u.id ?? Number.parseInt(idKey, 10),
      username: u.alias ?? "",
      fullname: u.nombre ?? null,
      role_id: u.rol_id ?? null
    }));
  }
}
