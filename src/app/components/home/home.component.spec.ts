import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a title', () => {
    const titleElement = fixture.debugElement.query(By.css('h1'));
    expect(titleElement).not.toBeNull();
  });

  it('should have a start game button', () => {
    const startButton = fixture.debugElement.query(By.css('button[routerLink="/game-setup"]'));
    expect(startButton).not.toBeNull();
  });

  it('should have a deck editor button', () => {
    const deckEditorButton = fixture.debugElement.query(By.css('button[routerLink="/deck-editor"]'));
    expect(deckEditorButton).not.toBeNull();
  });

  it('should have correct title styles', () => {
    const titleElement = fixture.debugElement.query(By.css('h1'));
    const styles = window.getComputedStyle(titleElement.nativeElement);
    expect(styles.textAlign).toBe('center');
    expect(styles.marginBottom).toBe('2rem');
  });

  it('should have correct button styles', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    buttons.forEach(button => {
      const styles = window.getComputedStyle(button.nativeElement);
      expect(styles.padding).toBe('1rem 2rem');
      expect(styles.fontSize).toBe('1.2rem');
      expect(styles.margin).toBe('1rem');
    });
  });

  it('should have correct button hover styles', () => {
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    buttons.forEach(button => {
      const styles = window.getComputedStyle(button.nativeElement);
      expect(styles.transition).toContain('background-color');
      expect(styles.transition).toContain('transform');
    });
  });

  it('should navigate to game setup when start button is clicked', () => {
    const startButton = fixture.debugElement.query(By.css('button[routerLink="/game-setup"]'));
    spyOn(router, 'navigateByUrl');
    startButton.triggerEventHandler('click', null);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/game-setup');
  });

  it('should navigate to deck editor when deck editor button is clicked', () => {
    const deckEditorButton = fixture.debugElement.query(By.css('button[routerLink="/deck-editor"]'));
    spyOn(router, 'navigateByUrl');
    deckEditorButton.triggerEventHandler('click', null);
    expect(router.navigateByUrl).toHaveBeenCalledWith('/deck-editor');
  });

  it('should have correct container styles', () => {
    const container = fixture.debugElement.query(By.css('.container'));
    const styles = window.getComputedStyle(container.nativeElement);
    expect(styles.display).toBe('flex');
    expect(styles.flexDirection).toBe('column');
    expect(styles.alignItems).toBe('center');
    expect(styles.justifyContent).toBe('center');
    expect(styles.minHeight).toBe('100vh');
  });
}); 