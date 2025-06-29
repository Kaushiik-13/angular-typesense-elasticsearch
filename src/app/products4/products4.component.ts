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
  selector: 'app-products4',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './products4.component.html',
  styleUrl: './products4.component.css',
})
export class Products4Component implements OnInit {
  authors: Author[] = [];
  filteredAuthors: Author[] = [];
  genres: string[] = [];
  selectedGenre = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const url = 'http://localhost:8108/collections/authors/documents/search';
    const headers = new HttpHeaders({
      'X-TYPESENSE-API-KEY': 'xyz',
      'Content-Type': 'application/json',
    });

    const params = new HttpParams()
      .set('q', '*')
      .set('query_by', 'name')
      .set('filter_by', '$books(id:*)') // Ensure books exist
      .set('include_fields', '$books(*, strategy:nest_array)'); // Always return array of books

    this.http.get<any>(url, { headers, params }).subscribe((res) => {
      this.authors = res.hits.map((hit: any) => ({
        ...hit.document,
        books: hit.document.books || [],
      }));

      this.filteredAuthors = [...this.authors];

      // Extract unique genres for dropdown
      const genreSet = new Set<string>();
      this.authors.forEach(author =>
        author.books.forEach(book => genreSet.add(book.genre))
      );
      this.genres = Array.from(genreSet);
    });
  }

  applyFilter(): void {
    this.filteredAuthors = this.selectedGenre
      ? this.authors
          .map(author => ({
            ...author,
            books: author.books.filter(book => book.genre === this.selectedGenre),
          }))
          .filter(author => author.books.length)
      : [...this.authors];
  }
}
