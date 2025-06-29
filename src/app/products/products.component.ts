import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  currentPage: number = 1;
  perPage: number = 10;
  totalPages: number = 1;
  totalFound: number = 0;
  searchTerm: string = '';
  appendMode: boolean = false;

  selectedBrands: string[] = [];
  selectedTypes: string[] = [];
  selectedLabels: string[] = [];

  brandOptions: { name: string, count: number }[] = [];
  typeOptions: { name: string, count: number }[] = [];
  labelOptions: { name: string, count: number }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchProducts(false);
  }

  formatFilterValue(value: string): string {
    return /[,\s]/.test(value) ? `"${value}"` : value;
  }

  fetchProducts(append: boolean): void {
    const baseUrl = 'http://localhost:8108/collections/amazon_products/documents/search';
    const q = this.searchTerm.trim() || '*';
    const queryBy = 'Title,Brand,MPN,Label';
    const facetBy = 'Brand,ProductTypeName,Label';

    const filters: string[] = [];

    if (this.selectedBrands.length) {
      filters.push(`Brand:=[${this.selectedBrands.map(this.formatFilterValue).join('||')}]`);
    }
    if (this.selectedTypes.length) {
      filters.push(`ProductTypeName:=[${this.selectedTypes.map(this.formatFilterValue).join('||')}]`);
    }
    if (this.selectedLabels.length) {
      filters.push(`Label:=[${this.selectedLabels.map(this.formatFilterValue).join('||')}]`);
    }

    const filterBy = filters.length > 0 ? `&filter_by=${encodeURIComponent(filters.join(' && '))}` : '';
    const url = `${baseUrl}?q=${encodeURIComponent(q)}&query_by=${queryBy}&per_page=${this.perPage}&page=${this.currentPage}&facet_by=${facetBy}${filterBy}`;

    this.http.get(url, {
      headers: { 'X-TYPESENSE-API-KEY': 'xyz' }
    }).subscribe((res: any) => {
      const newProducts = res.hits?.map((hit: any) => hit.document) || [];

      if (append) {
        this.mergeNewProducts(newProducts);
      } else {
        this.products = newProducts;
      }

      this.totalFound = res.found || 0;
      this.totalPages = Math.ceil(this.totalFound / this.perPage);

      const facets = res.facet_counts || [];
      this.brandOptions = this.getFacetCounts(facets, 'Brand');
      this.typeOptions = this.getFacetCounts(facets, 'ProductTypeName');
      this.labelOptions = this.getFacetCounts(facets, 'Label');

      this.products.forEach(product => {
        const price = product.ListPrice;
        if (typeof price === 'string' && price.includes('$')) {
          product.ListPrice = price.slice(price.indexOf('$'));
        }
      });
    });
  }

  mergeNewProducts(newItems: any[]): void {
    const seen = new Set(this.products.map(p => p.ITEM));
    const merged = [...this.products];
    for (const item of newItems) {
      if (!seen.has(item.ITEM)) {
        merged.push(item);
        seen.add(item.ITEM);
      }
    }
    this.products = merged;
  }

  getFacetCounts(facets: any[], field: string): { name: string, count: number }[] {
    const facet = facets.find((f: any) => f.field_name === field);
    return facet?.counts.map((c: any) => ({ name: c.value, count: c.count })) || [];
  }

  onSearchChange(): void {
    this.currentPage = 1;
    this.fetchProducts(false);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.fetchProducts(false);
  }

  toggleFilter(option: string, value: string, list: string[]): void {
    const index = list.indexOf(value);
    if (index === -1) list.push(value);
    else list.splice(index, 1);

    this.appendMode = true;
    this.fetchProducts(true);
  }

  clearFilters(): void {
    this.selectedBrands = [];
    this.selectedTypes = [];
    this.selectedLabels = [];
    this.appendMode = false;
    this.fetchProducts(false);
  }

  isChecked(value: string, list: string[]): boolean {
    return list.includes(value);
  }
}
