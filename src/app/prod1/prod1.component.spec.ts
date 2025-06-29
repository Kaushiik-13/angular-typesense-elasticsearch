import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Prod1Component } from './prod1.component';

describe('Prod1Component', () => {
  let component: Prod1Component;
  let fixture: ComponentFixture<Prod1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Prod1Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Prod1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
