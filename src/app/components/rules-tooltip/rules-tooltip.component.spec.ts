import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RulesTooltipComponent } from './rules-tooltip.component';

describe('RulesTooltipComponent', () => {
  let component: RulesTooltipComponent;
  let fixture: ComponentFixture<RulesTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RulesTooltipComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RulesTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
