import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-help-tooltip',
  templateUrl: './help-tooltip.component.html',
  styleUrls: ['./help-tooltip.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class HelpTooltipComponent {
  @Input() isVisible: boolean = false;
}
