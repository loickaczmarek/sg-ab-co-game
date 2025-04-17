import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rules-tooltip',
  templateUrl: './rules-tooltip.component.html',
  styleUrls: ['./rules-tooltip.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class RulesTooltipComponent {
  @Input() isVisible: boolean = false;
}
