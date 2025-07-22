import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-ts-joins',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './ts-joins.component.html',
  styleUrls: ['./ts-joins.component.css']
})
export class TsJoinsComponent implements OnInit {

  data: any[] = [];
  products: any[] = [];
  AfterfoundCount: number = 0;
  foundCount: number = 0;
  cats: Set<string> = new Set();
  // Filters
  category = '';
  stock = '';
  minRating = '';
  ifFilter = false;
  // Dropdowns
  categoriesList: string[] = [];
  // Pagination
  currentPage: number = 1;
  perPage: number = 6;
  totalPages: number = 0;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.CatFetch()
    if (this.ifFilter == false) {
      this.fetchInitialProd();
    }
    else {
      this.searchProducts();
    }
  }


CatFetch(): void {
  const headers = new HttpHeaders({
    'X-TYPESENSE-API-KEY': 'xyz',
    'Content-Type': 'application/json'
  });

  const body = {
    searches: [
      {
        collection: 'categorie', // Make sure this is correct (singular vs plural)
        include_fields: '$products(*)',
        q: '*',
        facet_by: 'name',
        per_page: 10,
        page: this.currentPage,
      }
    ]
  };

  this.http.post<any>('http://localhost:8108/multi_search', body, { headers })
    .subscribe({
      next: (res) => {
        const facetCounts = res.results?.[0]?.facet_counts?.[0]?.counts ?? [];

        // Clear existing set and populate with new facet values
        this.cats.clear();
        facetCounts.forEach((facet: any) => {
          this.cats.add(facet.value);
        });

        console.log('Categories from facet:', Array.from(this.cats));
      },
      error: (err) => {
        console.error('Error in multi_search:', err);
      }
    });
}




  fetchInitialProd(): void {
    const headers = new HttpHeaders({
      'X-TYPESENSE-API-KEY': 'xyz',
      'Content-Type': 'application/json'
    });

    const body = {
      searches: [
        {
          collection: 'categorie',
          include_fields: '$products(*)',
          q: '*',
          per_page: this.perPage,
          page: this.currentPage
        }
      ]
    };

    this.http.post<any>('http://localhost:8108/multi_search', body, { headers })
      .subscribe({
        next: (res) => {
          const hits = res.results?.[0]?.hits ?? [];
          this.data = hits.map((hit: any) => hit.document);
          this.foundCount = res.results?.[0]?.found ?? 0;
          this.totalPages = Math.ceil(this.foundCount / this.perPage);
        },
        error: (err) => {
          console.error('Error in multi_search:', err);
        }
      });
  }


  searchProducts(): void {
    const headers = new HttpHeaders({
      'X-TYPESENSE-API-KEY': 'xyz',
    });

    // Build filter_by string dynamically
    let filter_by = '';

    if (this.category) {
      filter_by += `$categories(name:="${this.category}" && active:=true)`;
    }

    if (this.stock) {
      if (filter_by) filter_by += ' && ';
      filter_by += `in_stock:=${this.stock}`;
    }

    if (this.minRating) {
      if (filter_by) filter_by += ' && ';
      filter_by += `rating:>=${this.minRating}`;
    }

    // Setup search params
    let params = new HttpParams()
      .set('q', '*')
      .set('query_by', 'title')
      .set('page', this.currentPage)
      .set('per_page', this.perPage);

    if (filter_by) {
      params = params.set('filter_by', filter_by);
    }

    this.http.get<any>('http://localhost:8108/collections/products/documents/search', { headers, params })
      .subscribe({
        next: (res) => {
          this.products = res.hits.map((hit: any) => {
            const doc = hit.document;
            doc.categoryName = doc.categories?.name || 'N/A';
            console.log(res);
            this.foundCount = res.found || 0;

            return doc;
          });
          this.totalPages = Math.ceil(res.found / this.perPage);
        },
        error: (err) => {
          console.error('Search error:', err);
        }
      });
  }


  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      if(this.ifFilter=true)
      {
      this.fetchInitialProd();
      }
      this.searchProducts()
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
         if(this.ifFilter=true)
      {
      this.fetchInitialProd();
      }
      this.searchProducts()
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
        if(this.ifFilter=true)
      {
      this.fetchInitialProd();
      }
      this.searchProducts()
    }
  }

  clearFilters(): void {
    this.category = '';
    this.stock = '';
    this.minRating = '';
    this.currentPage = 1;
    this.ifFilter = false;
    this.fetchInitialProd();
  }

  applyFilters(): void {
    this.ifFilter = true;
  }
}
