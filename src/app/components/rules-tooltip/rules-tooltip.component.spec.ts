import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RulesTooltipComponent } from './rules-tooltip.component';
import { RulesCardComponent } from '../rules-card/rules-card.component';
import { By } from '@angular/platform-browser';

describe('RulesTooltipComponent', () => {
  let component: RulesTooltipComponent;
  let fixture: ComponentFixture<RulesTooltipComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RulesTooltipComponent, RulesCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RulesTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have isVisible input set to false by default', () => {
    expect(component.isVisible).toBeFalse();
  });

  it('should update isVisible when input changes', () => {
    component.isVisible = true;
    fixture.detectChanges();
    expect(component.isVisible).toBeTrue();
  });

  it('should not display visible class when isVisible is false', () => {
    component.isVisible = false;
    fixture.detectChanges();
    const tooltipElement = fixture.debugElement.query(By.css('.rules-tooltip'));
    expect(tooltipElement).not.toBeNull();
    expect(tooltipElement.classes['visible']).toBeFalsy();
  });

  it('should display tooltip when isVisible is true', () => {
    component.isVisible = true;
    fixture.detectChanges();
    const tooltipElement = fixture.debugElement.query(By.css('.rules-tooltip.visible'));
    expect(tooltipElement).not.toBeNull();
  });
});
