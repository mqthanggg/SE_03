import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { OfficerComponent } from './officer/officer.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
    {path: "login", component: LoginComponent, title: "Login"},
    {path: "app", component: AppComponent, title: "Student Smart Printing Service"},
    // {path: "", redirectTo: "/app", pathMatch:"full"}
];
