import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RulesCardComponent } from '../rules-card/rules-card.component';

@Component({
  selector: 'app-rules-tooltip',
  templateUrl: './rules-tooltip.component.html',
  styleUrls: ['./rules-tooltip.component.scss'],
  standalone: true,
  imports: [CommonModule, RulesCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RulesTooltipComponent {
  @Input() isVisible: boolean = false;
}
