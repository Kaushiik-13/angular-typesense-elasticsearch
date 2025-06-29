import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Typesense from 'typesense';

@Component({
  selector: 'app-book',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './book.component.html',
  styleUrls: ['./book.component.css']
})
export class BookComponent implements OnInit {
  query = '';
  genre = '';
  minRating: number | null = null;
  results: any[] = [];

  genres = [  'self-help',   'business',   'motivation',   'psychology',   'leadership',   'productivity',
  'startup',
  'creativity',
  'finance',
  'philosophy'
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

  ngOnInit(): void {
    this.search(); // Show all on load
  }

  search() {
    let filterConditions: string[] = [];

    if (this.genre) {
      filterConditions.push(`genres:=[${this.genre}]`);
    }

    if (this.minRating != null) {
      filterConditions.push(`rating:>=${this.minRating}`);
    }

    const filter_by = filterConditions.join(' && ');

    this.client
      .collections('books')
      .documents()
      .search({
        q: this.query || '*', // show all if empty
        query_by: 'title,author',
        filter_by: filter_by || undefined,
        per_page: 250                       

      })
      .then((res: any) => {
        this.results = res.hits.map((hit: any) => hit.document);
      });
  }


  
}
