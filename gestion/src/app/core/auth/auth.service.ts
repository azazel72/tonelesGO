import { Injectable, computed, signal } from "@angular/core";
import { Router } from "@angular/router";
import { AuthApiClient } from "../api/generated/services";
import { SessionUser } from "./auth.models";

const TOKEN_KEY = "gestion.auth.token";
const USER_KEY = "gestion.jwt.user";

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly authClient = new AuthApiClient();
  private readonly tokenSig = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  private readonly userSig = signal<SessionUser | null>(this.readUser());

  readonly token = this.tokenSig.asReadonly();
  readonly user = this.userSig.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSig());

  constructor(private readonly router: Router) {}

  async login(username: string, password: string): Promise<void> {
    const result = await this.authClient.login({ username, password });
    const token = result.access_token;
    this.tokenSig.set(token);
    localStorage.setItem(TOKEN_KEY, token);

    const user: SessionUser = { username };
    this.userSig.set(user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  logout(): void {
    this.tokenSig.set(null);
    this.userSig.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    void this.router.navigateByUrl("/login");
  }

  private readUser(): SessionUser | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SessionUser;
    } catch {
      return null;
    }
  }
}
