import { Routes } from "@angular/router";
import { authGuard } from "./core/auth/auth.guard";

export const appRoutes: Routes = [
  {
    path: "login",
    loadComponent: () => import("./features/login/login.page").then((m) => m.LoginPage)
  },
  {
    path: "app",
    canActivate: [authGuard],
    loadComponent: () => import("./layout/shell.component").then((m) => m.ShellComponent),
    children: [
      {
        path: "main-table",
        loadComponent: () => import("./features/main-table/main-table.page").then((m) => m.MainTablePage)
      },
      {
        path: "home",
        loadComponent: () => import("./features/dashboard/dashboard-home.page").then((m) => m.DashboardHomePage)
      },
      {
        path: "users",
        loadComponent: () => import("./features/users/users.page").then((m) => m.UsersPage)
      },
      {
        path: "settings",
        loadComponent: () => import("./features/settings/settings.page").then((m) => m.SettingsPage)
      },
      {
        path: "",
        pathMatch: "full",
        redirectTo: "main-table"
      }
    ]
  },
  {
    path: "",
    pathMatch: "full",
    redirectTo: "login"
  },
  {
    path: "**",
    redirectTo: "login"
  }
];
