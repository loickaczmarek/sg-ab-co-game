import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingRulesButtonComponent } from './floating-rules-button.component';

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
});
