import { Injectable, computed, signal } from "@angular/core";
import { UserDto } from "../../core/api/generated/models";
import { UsersApi } from "../../core/api/users.api";
import { AuthService } from "../../core/auth/auth.service";

@Injectable({ providedIn: "root" })
export class UsersStore {
  private readonly usersSig = signal<UserDto[]>([]);
  private readonly loadingSig = signal(false);
  private readonly errorSig = signal<string | null>(null);

  readonly users = this.usersSig.asReadonly();
  readonly loading = this.loadingSig.asReadonly();
  readonly error = this.errorSig.asReadonly();
  readonly total = computed(() => this.usersSig().length);

  constructor(
    private readonly usersApi: UsersApi,
    private readonly auth: AuthService
  ) {}

  async load(): Promise<void> {
    const token = this.auth.token();
    if (!token) {
      this.errorSig.set("No session token.");
      return;
    }
    this.loadingSig.set(true);
    this.errorSig.set(null);
    try {
      const data = await this.usersApi.list(token);
      this.usersSig.set(data);
    } catch (e) {
      console.error(e);
      this.errorSig.set("Failed to load users.");
    } finally {
      this.loadingSig.set(false);
    }
  }

  async updateCell(userId: number, payload: Partial<UserDto>): Promise<void> {
    const token = this.auth.token();
    if (!token) return;
    try {
      const updated = await this.usersApi.update(token, userId, payload);
      this.usersSig.update((items) =>
        items.map((u) => (u.id === updated.id ? { ...u, ...updated } : u))
      );
    } catch (e) {
      console.error(e);
      this.errorSig.set("Failed to persist user changes.");
    }
  }
}

