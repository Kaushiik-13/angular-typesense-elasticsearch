import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPageEsComponent } from './product-page-es.component';

describe('ProductPageEsComponent', () => {
  let component: ProductPageEsComponent;
  let fixture: ComponentFixture<ProductPageEsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductPageEsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductPageEsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
