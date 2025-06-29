import { Routes } from '@angular/router';
import { BookComponent } from './book/book.component';
import { MoviesComponent } from './movies/movies.component';
import { TransactionComponent } from './transaction/transaction.component';
import { ProdComponent } from './prod/prod.component';
import { ProductsComponent } from './products/products.component';
import { Products2Component } from './products2/products2.component';
import { Products3Component } from './products3/products3.component';
import { Products4Component } from './products4/products4.component';

export const routes: Routes = [
    {path:'book',component:BookComponent},
    {path:'movies',component:MoviesComponent},
    {path:'bank',component:TransactionComponent},
    {path:'prod',component:ProdComponent},
    {path:'products',component:ProductsComponent},
    {path:'products3',component:Products3Component},
    {path:'prodcts4',component:Products4Component},
    {path:'products2',component:Products2Component}
];
