import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FloatingRulesButtonComponent } from './floating-rules-button.component';
import { By } from '@angular/platform-browser';

describe('FloatingRulesButtonComponent', () => {
  let component: FloatingRulesButtonComponent;
  let fixture: ComponentFixture<FloatingRulesButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FloatingRulesButtonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloatingRulesButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have isRulesVisible and isHelpVisible set to false by default', () => {
    expect(component.isRulesVisible).toBeFalse();
    expect(component.isHelpVisible).toBeFalse();
  });

  it('should toggle rules visibility and hide help when toggling rules', () => {
    component.toggleRules();
    expect(component.isRulesVisible).toBeTrue();
    expect(component.isHelpVisible).toBeFalse();

    component.toggleRules();
    expect(component.isRulesVisible).toBeFalse();
    expect(component.isHelpVisible).toBeFalse();
  });

  it('should toggle help visibility and hide rules when toggling help', () => {
    component.toggleHelp();
    expect(component.isHelpVisible).toBeTrue();
    expect(component.isRulesVisible).toBeFalse();

    component.toggleHelp();
    expect(component.isHelpVisible).toBeFalse();
    expect(component.isRulesVisible).toBeFalse();
  });

  it('should hide help when showing rules', () => {
    component.isHelpVisible = true;
    component.toggleRules();
    expect(component.isRulesVisible).toBeTrue();
    expect(component.isHelpVisible).toBeFalse();
  });

  it('should hide rules when showing help', () => {
    component.isRulesVisible = true;
    component.toggleHelp();
    expect(component.isHelpVisible).toBeTrue();
    expect(component.isRulesVisible).toBeFalse();
  });

  it('should have correct button styles', () => {
    const button = fixture.debugElement.query(By.css('button'));
    const styles = window.getComputedStyle(button.nativeElement);
    expect(styles.position).toBe('fixed');
    expect(styles.right).toBe('20px');
    expect(styles.bottom).toBe('20px');
    expect(styles.zIndex).toBe('1000');
  });

  it('should have correct button hover styles', () => {
    const button = fixture.debugElement.query(By.css('button'));
    const styles = window.getComputedStyle(button.nativeElement);
    expect(styles.transition).toContain('transform');
    expect(styles.transition).toContain('box-shadow');
  });

  it('should emit click events correctly', () => {
    const rulesButton = fixture.debugElement.query(By.css('.rules-button'));
    const helpButton = fixture.debugElement.query(By.css('.help-button'));

    spyOn(component, 'toggleRules');
    spyOn(component, 'toggleHelp');

    rulesButton.triggerEventHandler('click', null);
    expect(component.toggleRules).toHaveBeenCalled();

    helpButton.triggerEventHandler('click', null);
    expect(component.toggleHelp).toHaveBeenCalled();
  });

  it('should have correct animation styles for tooltips', () => {
    component.isRulesVisible = true;
    fixture.detectChanges();
    const rulesTooltip = fixture.debugElement.query(By.css('.rules-tooltip'));
    const styles = window.getComputedStyle(rulesTooltip.nativeElement);
    expect(styles.transition).toContain('opacity');
    expect(styles.transition).toContain('transform');
  });
});
