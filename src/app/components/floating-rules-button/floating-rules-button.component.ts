import { Component } from '@angular/core';
import { RulesTooltipComponent } from '../rules-tooltip/rules-tooltip.component';
import { HelpTooltipComponent } from '../help-tooltip/help-tooltip.component';

@Component({
  selector: 'app-floating-rules-button',
  templateUrl: './floating-rules-button.component.html',
  styleUrls: ['./floating-rules-button.component.scss'],
  standalone: true,
  imports: [RulesTooltipComponent, HelpTooltipComponent]
})
export class FloatingRulesButtonComponent {
  isRulesVisible: boolean = false;
  isHelpVisible: boolean = false;

  toggleRules(): void {
    this.isRulesVisible = !this.isRulesVisible;
    if (this.isRulesVisible) {
      this.isHelpVisible = false;
    }
  }

  toggleHelp(): void {
    this.isHelpVisible = !this.isHelpVisible;
    if (this.isHelpVisible) {
      this.isRulesVisible = false;
    }
  }
}
