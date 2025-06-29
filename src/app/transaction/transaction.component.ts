import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css']
})
export class TransactionComponent implements OnInit {
  transactions: any[] = [];
  searchTerm: string = '';
  selectedLocation: string = '';
  selectedID: string = '';
  selectedDomain: string = '';
  currentPage: number = 1;
  perPage: number = 100;
  totalPages: number = 1;
  totalCount: number = 0;

  searchSubject: Subject<void> = new Subject();

  locationOptions = [
    'Vellore', 'Pune', 'Kochin', 'Jaipur', 'Amritsar', 'Patiala', 'Trichy', 'Konark', 'Kota',
    'Lunglei', 'Delhi', 'Bikaner', 'Mon', 'Bokaro', 'Kanpur', 'Buxar', 'Goa', 'Lucknow', 'Betul',
    'Banglore', 'Srinagar', 'Kolkata', 'Indore', 'Kullu', 'Surat', 'Bhuj', 'Durg', 'Doda', 'Daman',
    'Madurai', 'Bhind', 'Ajmer', 'Ranchi'
  ];

  domainOptions = [
    'RESTRAUNT', 'PUBLIC', 'INTERNATIONAL', 'MEDICAL',
    'EDUCATION', 'INVESTMENTS', 'RETAIL'
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(300)).subscribe(() => {
      this.currentPage = 1;
      this.fetchTransactions();
    });

    this.fetchTransactions();
  }

  fetchTransactions(): void {
    const query = this.searchTerm.trim() || '*'; // Used for fuzzy/full-text match on query_by
    const filters = [];

    if (this.selectedID) {
      filters.push(`id:=${this.selectedID}`);
    }

    if (this.selectedLocation) {
      filters.push(`location:=${this.selectedLocation}`);
    }

    if (this.selectedDomain) {
      filters.push(`domain:=${this.selectedDomain}`);
    }

    const filterQuery = filters.length ? `&filter_by=${filters.join(' && ')}` : '';

    this.http.get(
      `/typesense/collections/transactions/documents/search?q=${query}&query_by=location,domain${filterQuery}&per_page=${this.perPage}&page=${this.currentPage}`,
      {
        headers: {
          'X-TYPESENSE-API-KEY': 'xyz' // Replace with your actual key
        }
      }
    ).subscribe((res: any) => {
      this.transactions = res.hits?.map((hit: any) => hit.document) || [];
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

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchTransactions();
    }
  }
}
