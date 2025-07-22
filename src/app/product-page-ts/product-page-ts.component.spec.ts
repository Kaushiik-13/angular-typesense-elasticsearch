import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPageTsComponent } from './product-page-ts.component';

describe('ProductPageTsComponent', () => {
  let component: ProductPageTsComponent;
  let fixture: ComponentFixture<ProductPageTsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductPageTsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductPageTsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
