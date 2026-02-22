import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { MatCardModule } from "@angular/material/card";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: "app-settings-page",
  standalone: true,
  imports: [MatCardModule, MatSlideToggleModule, MatFormFieldModule, MatInputModule],
  templateUrl: "./settings.page.html",
  styleUrl: "./settings.page.scss",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPage {
  protected readonly compactGrid = signal(false);
  protected readonly apiUrl = signal("http://localhost:8000");
}

