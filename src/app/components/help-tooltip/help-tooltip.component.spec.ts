import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HelpTooltipComponent } from './help-tooltip.component';

describe('HelpTooltipComponent', () => {
  let component: HelpTooltipComponent;
  let fixture: ComponentFixture<HelpTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpTooltipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HelpTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
