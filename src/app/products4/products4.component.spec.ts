import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Products4Component } from './products4.component';

describe('Products4Component', () => {
  let component: Products4Component;
  let fixture: ComponentFixture<Products4Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Products4Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Products4Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
