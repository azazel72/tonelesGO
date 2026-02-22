import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { MatCardModule } from "@angular/material/card";

@Component({
  selector: "app-stat-card",
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card>
      <mat-card-content>
        <div class="title">{{ title() }}</div>
        <div class="value">{{ value() }}</div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .title { font-size: .8rem; color: #475569; text-transform: uppercase; }
      .value { font-size: 1.8rem; font-weight: 700; margin-top: .4rem; }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatCardComponent {
  readonly title = input.required<string>();
  readonly value = input.required<string>();
}

