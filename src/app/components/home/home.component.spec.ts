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
    const startButton = fixture.debugElement.query(By.css('a[routerLink="/setup"]'));
    expect(startButton).not.toBeNull();
  });

  it('should have a deck editor button', () => {
    const deckEditorButton = fixture.debugElement.query(By.css('a[routerLink="/editor"]'));
    expect(deckEditorButton).not.toBeNull();
  });

  it('should have correct title styles', () => {
    const titleElement = fixture.debugElement.query(By.css('h1'));
    const styles = window.getComputedStyle(titleElement.nativeElement);
    expect(styles.textAlign).toBe('center');
    // Bootstrap uses margin classes instead of inline styles
    expect(titleElement.nativeElement.classList.contains('mb-4')).toBeTrue();
  });

  it('should have button elements with Bootstrap classes', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.btn'));
    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach(button => {
      expect(button.nativeElement.classList.contains('btn')).toBeTrue();
    });
  });

  it('should have bootstrap button variants', () => {
    const primaryButton = fixture.debugElement.query(By.css('.btn-primary'));
    const secondaryButton = fixture.debugElement.query(By.css('.btn-secondary'));
    expect(primaryButton).not.toBeNull();
    expect(secondaryButton).not.toBeNull();
  });

  it('should have links for navigation', () => {
    const setupLink = fixture.debugElement.query(By.css('a[routerLink="/setup"]'));
    const editorLink = fixture.debugElement.query(By.css('a[routerLink="/editor"]'));
    
    expect(setupLink.attributes['routerLink']).toBe('/setup');
    expect(editorLink.attributes['routerLink']).toBe('/editor');
  });

  it('should have a text-center container', () => {
    const container = fixture.debugElement.query(By.css('.text-center'));
    expect(container).not.toBeNull();
  });
}); 