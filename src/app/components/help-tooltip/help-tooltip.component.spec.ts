import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HelpTooltipComponent } from './help-tooltip.component';
import { By } from '@angular/platform-browser';

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

  it('should have isVisible input set to false by default', () => {
    expect(component.isVisible).toBeFalse();
  });

  it('should update isVisible when input changes', () => {
    component.isVisible = true;
    fixture.detectChanges();
    expect(component.isVisible).toBeTrue();
  });

  it('should toggle visible class based on isVisible input', () => {
    // Initially hidden
    const tooltipElement = fixture.debugElement.query(By.css('.help-tooltip'));
    expect(tooltipElement.nativeElement.classList.contains('visible')).toBeFalse();

    // Show tooltip
    component.isVisible = true;
    fixture.detectChanges();
    expect(tooltipElement.nativeElement.classList.contains('visible')).toBeTrue();

    // Hide tooltip
    component.isVisible = false;
    fixture.detectChanges();
    expect(tooltipElement.nativeElement.classList.contains('visible')).toBeFalse();
  });

  it('should render help content', () => {
    const helpContent = fixture.debugElement.query(By.css('.help-content'));
    expect(helpContent).not.toBeNull();
    expect(helpContent.nativeElement.textContent).toContain('Guide de jeu');
  });
});
