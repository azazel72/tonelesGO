import { ChangeDetectionStrategy, Component } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { StatCardComponent } from "../../shared/components/stat-card.component";

@Component({
  selector: "app-dashboard-home-page",
  standalone: true,
  imports: [MatCardModule, StatCardComponent],
  templateUrl: "./dashboard-home.page.html",
  styleUrl: "./dashboard-home.page.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardHomePage {}

