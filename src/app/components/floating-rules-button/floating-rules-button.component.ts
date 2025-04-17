import { Component } from '@angular/core';
import { RulesTooltipComponent } from '../rules-tooltip/rules-tooltip.component';

@Component({
  selector: 'app-floating-rules-button',
  templateUrl: './floating-rules-button.component.html',
  styleUrls: ['./floating-rules-button.component.scss'],
  standalone: true,
  imports: [RulesTooltipComponent]
})
export class FloatingRulesButtonComponent {
  isRulesVisible: boolean = false;

  toggleRules(): void {
    this.isRulesVisible = !this.isRulesVisible;
  }
}
