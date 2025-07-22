import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsJoinsComponent } from './ts-joins.component';

describe('TsJoinsComponent', () => {
  let component: TsJoinsComponent;
  let fixture: ComponentFixture<TsJoinsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TsJoinsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TsJoinsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
