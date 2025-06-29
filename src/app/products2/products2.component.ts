import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-products2',
  standalone: true,
  imports: [HttpClientModule, CommonModule, FormsModule],
  templateUrl: './products2.component.html',
  styleUrls: ['./products2.component.css']
})
export class Products2Component implements OnInit {
  products: any[] = [];
  currentPage: number = 1;
  perPage: number = 10;
  totalPages: number = 1;
  totalFound: number = 0;
  searchTerm: string = '';

  selectedBrands: string[] = [];
  selectedTypes: string[] = [];
  selectedLabels: string[] = [];

  brandOptions: { name: string, count: number }[] = [];
  typeOptions: { name: string, count: number }[] = [];
  labelOptions: { name: string, count: number }[] = [];

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.filterBySelected(); // initial load
    this.facet_byBrand();
  }

  formatFilterValue(value: string): string {
    return /[,\s]/.test(value) ? `"${value}"` : value;
  }

  toggleFilter(field: string, value: string, list: string[]): void {
    const index = list.indexOf(value);
    if (index === -1) list.push(value);
    else list.splice(index, 1);

    this.currentPage = 1;
    this.filterBySelected();
  }

  clearFilters(): void {
    this.selectedBrands = [];
    this.selectedTypes = [];
    this.selectedLabels = [];
    this.currentPage = 1;
    this.filterBySelected();

  }

  isChecked(value: string, list: string[]): boolean {
    return list.includes(value);
  }



  onSearchChange(): void {
    this.currentPage = 1;
    this.filterBySelected();
  }

  facet_byBrand(): void {
    const url = `http://localhost:8108/collections/amazon_products/documents/search?q=*&facet_by=Brand`;

    this.http.get(url, {
      headers: { 'X-TYPESENSE-API-KEY': 'xyz' }
    }).subscribe((res: any) => {
      const brandFacet = res.facet_counts?.find((f: any) => f.field_name === 'Brand');
      this.brandOptions = (brandFacet?.counts || []).map((item: any) => ({
        name: item.value,
        count: item.count
      }));
    });
  }

  filterBySelected(pageChange?: number): void {
    const baseUrl = 'http://localhost:8108/collections/amazon_products/documents/search';
    const q = this.searchTerm.trim() || '*';
    const queryBy = 'Title,Brand,MPN,Label';
    const facetBy = 'Brand,ProductTypeName,Label';

    if (pageChange !== undefined) {
      const newPage = this.currentPage + pageChange;
      if (newPage >= 1 && newPage <= this.totalPages) {
        this.currentPage = newPage;
      }
    }

    const filters: string[] = [];
    if (this.selectedBrands.length) {
      filters.push(`Brand:=[${this.selectedBrands.map(this.formatFilterValue).join(',')}]`);
    }
    if (this.selectedTypes.length) {
      filters.push(`ProductTypeName:=[${this.selectedTypes.map(this.formatFilterValue).join(',')}]`);
    }
    if (this.selectedLabels.length) {
      filters.push(`Label:=[${this.selectedLabels.map(this.formatFilterValue).join(',')}]`);
    }

    const filterBy = filters.length ? `&filter_by=${encodeURIComponent(filters.join(' && '))}` : '';
    const url = `${baseUrl}?q=${encodeURIComponent(q)}&query_by=${queryBy}&facet_by=${facetBy}&per_page=${this.perPage}&page=${this.currentPage}${filterBy}`;

    this.http.get(url, {
      headers: { 'X-TYPESENSE-API-KEY': 'xyz' }
    }).subscribe((res: any) => {
      this.products = res.hits?.map((hit: any) => hit.document) || [];
      this.totalFound = res.found || 0;
      this.totalPages = Math.ceil(this.totalFound / this.perPage);

      console.log(res)
      const facets = res.facet_counts || [];
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

  getFacetCounts(facets: any[], field: string): { name: string, count: number }[] {
    const facet = facets.find(f => f.field_name === field);
    return facet?.counts.map((c: any) => ({ name: c.value, count: c.count })) || [];
  }
}
