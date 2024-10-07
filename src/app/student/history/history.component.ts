import { Component, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnChanges{
  @Input() userID = "";
  @Input() isHidden = true;
  today = new Date();
  @Input() date = this.today.getDate();
  @Input() month = this.today.getMonth() + 1;
  @Input() year = this.today.getFullYear();
  isShowAllChecked = false;
  userLogs: any[] = [];
  constructor(private http: HttpClient, private elRef: ElementRef, private renderer: Renderer2){
  }
  filterLog(printing_date: any): boolean{
    if (!this.isShowAllChecked){
      const logDate = new Date(Date.parse(printing_date));
      const date = logDate.getDate();
      const month = logDate.getMonth();
      const year = logDate.getFullYear();
      return (this.date === null || this.date === date) &&
             (this.month === null || this.month - 1 === month) &&
             (this.year === null || this.year === year);
    }
    return this.isShowAllChecked;
  }
  ngOnChanges(changes: SimpleChanges){
    if (!changes['isHidden']) return;
    if (changes['isHidden'].currentValue === false){
      if (this.userID !== ""){
        this.http.get(`http://localhost:4000/user-log/${this.userID}`).subscribe((res: any) => {
          if (res.status === 200){
            this.userLogs = res.logs;
          }
        })
      }
    }
  }
}
