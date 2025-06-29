import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Typesense from 'typesense';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './movies.component.html',
  styleUrls: ['./movies.component.css']
})
export class MoviesComponent implements OnInit {
  query = '';
  genre = '';
  results: any[] = [];

  genres = [
    'Drama', 'Romance', 'War', 'Action', 'Comedy', 'Thriller',
    'Animation', 'Adventure', 'Fantasy', 'Sci-Fi'
  ];

  private client = new Typesense.Client({
    nodes: [
      {
        host: 'p560o47sqn3fzk1ep-1.a1.typesense.net',
        port: 443,
        protocol: 'https',
      }
    ],
    apiKey: 'xFnGAM2SLUxQ1XycIzh82kiP0IdAfwhw',
    connectionTimeoutSeconds: 5,
  });

  ngOnInit() {
    this.search(); // Load all movies initially
  }

  search() {
  const filters: string[] = [];

  if (this.genre) {
    filters.push(`genre:${this.genre}`); // Use `:` for partial match within the string
  }

  const filter_by = filters.join(' && ');

  this.client.collections('movies').documents().search({
    q: this.query || '*',
    query_by: 'movie_name,description',
    filter_by: filter_by || undefined,
    per_page: 250
  }).then((res: any) => {
    this.results = res.hits.map((hit: any) => hit.document);
  });
}

}
