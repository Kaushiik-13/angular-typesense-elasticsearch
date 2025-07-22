import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-product-page-ts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './product-page-ts.component.html',
  styleUrls: ['./product-page-ts.component.css']
})
export class ProductPageTsComponent implements OnInit {
  filterForm: FormGroup;
  products: any[] = [];
  facets: { [key: string]: any[] } = {};
  currentPage = 1;
  pageSize = 9;
  totalHits = 0;
  totalSec = 0;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.filterForm = this.fb.group({
      search: [''],
      format: [''],
      publisher: [''],
      publication_year: [''],
      average_rating: [''],
      is_ebook: ['']
    });
  }

  ngOnInit() {
    this.search(); // Initial load

    // Live filter changes with debounce
    this.filterForm.valueChanges.pipe(debounceTime(100)).subscribe(() => {
      this.currentPage = 1;
      this.search();
    });
  }

  get paginatedProducts() {
    return this.products;
  }

  get totalPages() {
    return Math.ceil(this.totalHits / this.pageSize);
  }

  get paginationRange(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const maxVisible = 5;

    let start = Math.max(current - Math.floor(maxVisible / 2), 1);
    let end = start + maxVisible - 1;

    if (end > total) {
      end = total;
      start = Math.max(end - maxVisible + 1, 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.search();
  }

  clearFilters() {
    this.filterForm.reset();
    this.currentPage = 1;
    this.search();
  }

  search(): void {
    const headers = new HttpHeaders({
      'X-TYPESENSE-API-KEY': 'xyz'
    });

    const formValues = this.filterForm.value;
    const searchQuery = formValues.search || '*';

    let filters = [];
    if (formValues.format) filters.push(`format:=${formValues.format}`);
    if (formValues.publisher) filters.push(`publisher:=${formValues.publisher}`);
    if (formValues.publication_year) filters.push(`publication_year:>=${formValues.publication_year}`);
    if (formValues.average_rating) filters.push(`average_rating:>=${formValues.average_rating}`);
    if (formValues.is_ebook !== '' && formValues.is_ebook !== null)
      filters.push(`is_ebook:=${formValues.is_ebook}`);

    const filter_by = filters.join(' && ');

    const queryParams = new URLSearchParams({
      q: searchQuery,
      query_by: 'title,publisher',
      per_page: this.pageSize.toString(),
      page: this.currentPage.toString(),
      facet_by: 'format,publisher,publication_year,is_ebook',
      ...(filter_by && { filter_by })
    });

    const url = `http://localhost:8108/collections/books/documents/search?${queryParams.toString()}`;

    this.http.get<any>(url, { headers }).subscribe(response => {
      this.products = response.hits.map((hit: any) => hit.document);
      this.totalHits = response.found;
      this.totalSec = response.search_time_ms;

      // Parse facet_counts into usable structure
      this.facets = response.facet_counts.reduce((acc: any, facet: any) => {
        acc[facet.field_name] = facet.counts;
        return acc;
      }, {});
    });
  }
}
