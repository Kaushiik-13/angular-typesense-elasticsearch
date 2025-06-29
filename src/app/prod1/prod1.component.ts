// prod1.component.ts
import { Component, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders, HttpClientModule } from '@angular/common/http';
import { debounceTime } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-prod1',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule, FormsModule],
  templateUrl: './prod1.component.html',
  styleUrls: ['./prod1.component.css']
})
export class Prod1Component implements OnInit {
  searchControl = new FormControl('');
  results: any[] = [];
  facets: any = {};
  filters: any = {
    author_names: [],
    average_rating: ''
  };
  page = 0;
  size = 12;
  total = 0;
  allAuthors: string[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.searchControl.valueChanges.pipe(debounceTime(0)).subscribe(() => {
      this.page = 0;
      this.search();
    });
    this.search();
    this.fetchAuthors();
  }

  search() {
    const body = {
      query: {
        bool: {
          must: this.searchControl.value ? [
            { match: { author_name: this.searchControl.value } }
          ] : [],
          filter: this.buildFilters()
        }
      },
      aggs: {
        rating_facet: {
          range: {
            field: 'average_rating',
            ranges: [
              { from: 0, to: 1.5 },
              { from: 1.5, to: 2.5 },
              { from: 2.5, to: 3.5 },
              { from: 3.5, to: 4.5 },
              { from: 4.5, to: 5.1 }
            ]
          }
        }
      },
      from: this.page * this.size,
      size: this.size,
      track_total_hits: true
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post('http://localhost:9200/authors/_search', body, { headers })
      .subscribe((res: any) => {
        this.results = res.hits.hits.map((h: any) => h._source);
        this.total = res.hits.total.value;
        this.facets = res.aggregations;
      });
  }

  fetchAuthors() {
    const body = {
      size: 0,
      aggs: {
        author_facet: {
          terms: { field: 'author_name.keyword', size: 10 }
        }
      }
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    this.http.post('http://localhost:9200/authors/_search', body, { headers })
      .subscribe((res: any) => {
        if (res.aggregations?.author_facet?.buckets) {
          this.allAuthors = res.aggregations.author_facet.buckets.map((b: any) => b.key);
        }
      });
  }

  buildFilters() {
    const filters = [];

    if (this.filters.average_rating) {
      const [from, to] = this.filters.average_rating.split('-');
      filters.push({
        range: {
          average_rating: {
            gte: parseFloat(from),
            ...(to ? { lt: parseFloat(to) } : {})
          }
        }
      });
    }

    if (this.filters.author_names.length > 0) {
      filters.push({ terms: { "author_name.keyword": this.filters.author_names } });
    }

    return filters;
  }

  applyRadioFilter(type: string, value: string) {
    this.filters[type] = value || '';
    this.page = 0;
    this.search();
  }

  onAuthorToggle(name: string, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    const list = this.filters.author_names;
    if (checked && !list.includes(name)) {
      list.push(name);
    } else if (!checked) {
      const index = list.indexOf(name);
      if (index !== -1) list.splice(index, 1);
    }
    this.page = 0;
    this.search();
    this.fetchAuthors();
  }

  getAuthorDocCount(author: string): number {
    const bucket = this.facets?.author_facet?.buckets?.find((b: any) => b.key === author);
    return bucket ? bucket.doc_count : 0;
  }

  clearFilters() {
    this.filters = {
      author_names: [],
      average_rating: ''
    };
    this.page = 0;
    this.search();
    this.fetchAuthors();
  }

  nextPage() {
    if ((this.page + 1) * this.size < this.total) {
      this.page++;
      this.search();
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.search();
    }
  }
}