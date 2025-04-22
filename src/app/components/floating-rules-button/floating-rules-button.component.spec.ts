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

  it('should have buttons for rules and help', () => {
    const rulesButton = fixture.debugElement.query(By.css('.floating-rules-button'));
    const helpButton = fixture.debugElement.query(By.css('.floating-help-button'));
    
    expect(rulesButton).not.toBeNull();
    expect(helpButton).not.toBeNull();
  });

  it('should have button click handlers', () => {
    expect(component.toggleRules).toBeDefined();
    expect(component.toggleHelp).toBeDefined();
  });

  it('should emit events from toggleRules and toggleHelp methods', () => {
    spyOn(component, 'toggleRules').and.callThrough();
    spyOn(component, 'toggleHelp').and.callThrough();

    component.toggleRules();
    expect(component.toggleRules).toHaveBeenCalled();
    expect(component.isRulesVisible).toBeTrue();

    component.toggleHelp();
    expect(component.toggleHelp).toHaveBeenCalled();
    expect(component.isHelpVisible).toBeTrue();
  });

  it('should render tooltips based on visibility state', () => {
    component.isRulesVisible = true;
    component.isHelpVisible = false;
    fixture.detectChanges();
    
    const rulesToolTip = fixture.debugElement.query(By.css('app-rules-tooltip'));
    const helpToolTip = fixture.debugElement.query(By.css('app-help-tooltip'));
    
    expect(rulesToolTip).not.toBeNull();
    expect(helpToolTip).not.toBeNull();
    expect(rulesToolTip.attributes['ng-reflect-is-visible']).toBe('true');
    expect(helpToolTip.attributes['ng-reflect-is-visible']).toBe('false');
  });
});
