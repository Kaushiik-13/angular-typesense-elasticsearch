import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Book {
  id: string;
  title: string;
  genre: string;
}

interface Author {
  id: string;
  name: string;
  books: Book[];
}

@Component({
  selector: 'app-products3',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './products3.component.html',
  styleUrl: './products3.component.css',
})
export class Products3Component implements OnInit {
  authors: Author[] = [];
  genres: string[] = [];
  selectedGenre = '';
  apiKey = 'xyz';
  url = 'http://localhost:8108/collections/authors/documents/search';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchGenres(); // Load genres on init
    this.fetchAuthors(); // Initially load all authors
  }

  fetchGenres(): void {
    const headers = new HttpHeaders({
      'X-TYPESENSE-API-KEY': this.apiKey,
      'Content-Type': 'application/json',
    });

    const params = new HttpParams()
      .set('q', '*')
      .set('query_by', 'name')
      .set('filter_by', '$books(id:*)')
      .set('include_fields', '$books(*, strategy:nest_array)');

    this.http.get<any>(this.url, { headers, params }).subscribe((res) => {
      const authors = res.hits.map((hit: any) => hit.document);
      const genreSet = new Set<string>();
      authors.forEach((author: Author) => {
        author.books.forEach((book: Book) => {
          if (book.genre) genreSet.add(book.genre);
        });
      });
      this.genres = Array.from(genreSet);
    });
  }

  fetchAuthors(): void {
    const headers = new HttpHeaders({
      'X-TYPESENSE-API-KEY': this.apiKey,
      'Content-Type': 'application/json',
    });

    const params = new HttpParams()
      .set('q', '*')
      .set('query_by', 'name')
      .set('filter_by', this.selectedGenre ? `$books(genre:=${this.selectedGenre})` : '$books(id:*)')
      .set('include_fields', '$books(*, strategy:nest_array)');

    this.http.get<any>(this.url, { headers, params }).subscribe((res) => {
      this.authors = res.hits.map((hit: any) => ({
        ...hit.document,
        books: hit.document.books || [],
      }));
    });
  }

  onGenreChange(): void {
    this.fetchAuthors();
  }
}
