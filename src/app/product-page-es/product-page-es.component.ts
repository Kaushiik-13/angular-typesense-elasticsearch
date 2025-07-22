import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { debounceTime } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-page-es',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './product-page-es.component.html',
  styleUrls: ['./product-page-es.component.css']
})
export class ProductPageEsComponent implements OnInit {
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
    this.search();

    this.filterForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
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
    const formValues = this.filterForm.value;
    const from = (this.currentPage - 1) * this.pageSize;
    const query: any = {
      from,
      size: this.pageSize,
      query: {
        bool: {
          must: [],
          filter: []
        }
      },
      aggs: {
        format: { terms: { field: 'format.keyword', size: 100 } },
        publisher: { terms: { field: 'publisher.keyword', size: 100 } },
        publication_year: { terms: { field: 'publication_year', size: 100 } },
        is_ebook: { terms: { field: 'is_ebook', size: 2 } }
      },
      track_total_hits: true
    };

    // Search text
    if (formValues.search) {
      query.query.bool.must.push({
        multi_match: {
          query: formValues.search,
          fields: ['title^2', 'publisher']
        }
      });
    } else {
      query.query.bool.must.push({ match_all: {} });
    }

    // Filters
    if (formValues.format)
      query.query.bool.filter.push({ term: { 'format.keyword': formValues.format } });
    if (formValues.publisher)
      query.query.bool.filter.push({ term: { 'publisher.keyword': formValues.publisher } });
    if (formValues.publication_year)
      query.query.bool.filter.push({ range: { publication_year: { gte: formValues.publication_year } } });
    if (formValues.average_rating)
      query.query.bool.filter.push({ range: { average_rating: { gte: formValues.average_rating } } });
    if (formValues.is_ebook !== '' && formValues.is_ebook !== null)
      query.query.bool.filter.push({ term: { is_ebook: formValues.is_ebook === 'true' } });

    const startTime = performance.now();
    this.http.post<any>('http://localhost:9200/books/_search', query).subscribe(response => {
      const endTime = performance.now();
      this.totalSec = Math.round(endTime - startTime);

      this.totalHits = response.hits.total.value;
      this.products = response.hits.hits.map((hit: any) => hit._source);

      this.facets = {
        format: response.aggregations.format.buckets.map((b: any) => ({ value: b.key, count: b.doc_count })),
        publisher: response.aggregations.publisher.buckets.map((b: any) => ({ value: b.key, count: b.doc_count })),
        publication_year: response.aggregations.publication_year.buckets.map((b: any) => ({ value: b.key, count: b.doc_count })),
        is_ebook: response.aggregations.is_ebook.buckets.map((b: any) => ({ value: b.key.toString(), count: b.doc_count }))
      };
    });
  }
}
