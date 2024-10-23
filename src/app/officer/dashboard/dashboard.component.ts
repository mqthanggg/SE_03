import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  numberStudents = 0;
  numberPrinters = 0;
  numberRequests = 0;
  constructor(private http: HttpClient){
    this.http.get('http://localhost:4000/dashboard').subscribe((res: any) => {
      this.numberStudents = res.users;
      this.numberPrinters = res.printers;
      this.numberRequests = res.logs;
    })
  }

}
