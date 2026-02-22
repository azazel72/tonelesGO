import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from "@angular/router";
import { BreakpointObserver } from "@angular/cdk/layout";
import { toSignal } from "@angular/core/rxjs-interop";
import { map } from "rxjs";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { AuthService } from "../core/auth/auth.service";

@Component({
  selector: "app-shell",
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule
  ],
  templateUrl: "./shell.component.html",
  styleUrl: "./shell.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShellComponent {
  private readonly breakpoint = inject(BreakpointObserver);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.auth.user;
  protected readonly isHandset = toSignal(
    this.breakpoint.observe("(max-width: 900px)").pipe(map((s) => s.matches)),
    { initialValue: false }
  );
  protected readonly mode = computed(() => (this.isHandset() ? "over" : "side"));

  protected logout(): void {
    this.auth.logout();
    void this.router.navigateByUrl("/login");
  }
}

