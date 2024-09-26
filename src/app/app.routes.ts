import { Routes } from '@angular/router';
import { PrintComponent } from './print/print.component';
import { BuyComponent } from './buy/buy.component';
import { HomeComponent } from './home/home.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    {path: 'print', component: PrintComponent},
    {path: 'buy', component: BuyComponent},
    {path: 'home', component: HomeComponent},
    {path: 'about-us', component: AboutUsComponent},
    {path: 'login', component: LoginComponent}
];
