import { Component, ElementRef, Input, Renderer2, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import moment from 'moment'

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements AfterViewInit{
  @Input() userID = "";
  fromDate: string | null = moment().format('YYYY-MM-DD');
  toDate: string | null = moment().format('YYYY-MM-DD');
  isShowAllChecked = false;
  userLogs: any[] = [];
  constructor(private http: HttpClient, private elRef: ElementRef, private renderer: Renderer2){        
  }
  ngAfterViewInit(): void {
    if (this.userID !== ""){
      this.http.get(`http://localhost:4000/user-log/${this.userID}`).subscribe((res: any) => {
        if (res.status === 200){
          this.userLogs = res.logs;
        }
      })
    }
  }
  filterLog(printing_date: any): boolean{
    if (!this.isShowAllChecked){
      const logDate = new Date(Date.parse(printing_date));
      const date = logDate.getDate();
      const month = logDate.getMonth() + 1;
      const year = logDate.getFullYear();
      let queryDate = (date >= Number(moment(this.fromDate, "YYYY-MM-DD").format('D')) && date <= Number(moment(this.toDate, "YYYY-MM-DD").format('D')));
      let queryMonth = (month >= Number(moment(this.fromDate, "YYYY-MM-DD").format('M')) && month <= Number(moment(this.toDate, "YYYY-MM-DD").format('M')));
      let queryYear = (year >= Number(moment(this.fromDate, "YYYY-MM-DD").format('YYYY')) && year <= Number(moment(this.toDate, "YYYY-MM-DD").format('YYYY')))
      return queryDate && queryMonth && queryYear
    } 
    return this.isShowAllChecked;
  }
  
}
