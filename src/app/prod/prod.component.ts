import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-prod',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './prod.component.html',
  styleUrls: ['./prod.component.css']
})
export class ProdComponent implements OnInit {
  products: any[] = [];
  searchTerm: string = '';
  selectedBrand: string = '';
  selectedCategory: string = '';
  currentPage: number = 1;
  perPage: number = 20;
  totalPages: number = 1;
  totalCount: number = 0;

  searchSubject: Subject<void> = new Subject();

  // If you have dynamic brand/category, load from API. This is static for demo.
  brandOptions = ['Nike', 'Adidas', 'York', 'Oka', 'Puma', 'Roadster'];
  categoryOptions = ['Clothing and Accessories', 'Footwear', 'Winter Wear', 'Bottomwear'];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.currentPage = 1;
      this.fetchProducts();
    });

    this.fetchProducts();
  }

  fetchProducts(): void {
    const query = this.searchTerm.trim() || '*';
    const filters: string[] = [];

    if (this.selectedBrand) {
      filters.push(`brand:=${this.selectedBrand}`);
    }

    if (this.selectedCategory) {
      filters.push(`category:=${this.selectedCategory}`);
    }

    const filterQuery = filters.length ? `&filter_by=${filters.join(' && ')}` : '';

    const url = `/typesense/collections/flipkart_products/documents/search?q=${query}` +
      `&query_by=title,brand,category${filterQuery}` +
      `&per_page=${this.perPage}&page=${this.currentPage}`;

    this.http.get(url, {
      headers: {
        'X-TYPESENSE-API-KEY': 'xyz' // Replace with your real API key
      }
    }).subscribe((res: any) => {
      this.products = res.hits?.map((hit: any) => hit.document) || [];
      this.totalPages = res.found ? Math.ceil(res.found / this.perPage) : 1;
      this.totalCount = res.found || 0;
    });
  }

  onSearchChange(): void {
    this.searchSubject.next();
  }

  onFilterChange(): void {
    this.searchSubject.next();
  }

  toggleCategory(category: string): void {
    if (this.selectedCategory === category) {
      this.selectedCategory = '';
    } else {
      this.selectedCategory = category;
    }
    this.onFilterChange();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchProducts();
    }
  }
}
