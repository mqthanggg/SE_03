import { JsonPipe, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Output, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import moment from 'moment'

@Component({
  selector: 'app-log',
  standalone: true,
  imports: [NgClass, FormsModule, JsonPipe],
  templateUrl: './log.component.html',
  styleUrl: './log.component.css'
})
export class LogComponent {
  @Output() ReloadEvent = new EventEmitter();
  currentMode: "students" | "printers" = "students";
  studentLogs: any[] = [];
  copyStudentLogs: any[] = [];
  showAllStudents = true;
  showAllLogs = true;
  displayStudentID: number | null = null;
  fromDate: string | null = null;
  toDate: string | null = null;
  constructor(private http: HttpClient, private renderer: Renderer2, private elRef: ElementRef) {
    this.http.get('http://localhost:4000/student-logs').subscribe((res: any) => {
      this.studentLogs = res.data;      
      this.studentLogs.forEach((log: any) => {
        log.showAll = false;
      })
      this.copyStudentLogs = JSON.parse(JSON.stringify(this.studentLogs));
    })
  }
  updateLogs(){
    this.copyStudentLogs = JSON.parse(JSON.stringify(this.studentLogs));
    if (this.showAllLogs) {
      this.fromDate = this.toDate = null;
      return;
    }
    if ((this.fromDate === null || this.toDate === null) && !this.showAllLogs) {
      this.copyStudentLogs.forEach((student) => {
        student.logs = [];
      })
      return;
    }
    this.copyStudentLogs.forEach((student) => {
      student.logs = 
      (student.logs as any[]).filter((value) => { 
        if (this.showAllLogs) return true;
        const logFullDate = new Date(Date.parse(value.printing_date));        
        const date = logFullDate.getDate();
        const month = logFullDate.getMonth() + 1;
        const year = logFullDate.getFullYear();
        let queryDate = (date >= Number(moment(this.fromDate, "YYYY-MM-DD").format('D')) && date <= Number(moment(this.toDate, "YYYY-MM-DD").format('D')));
        console.log(`FromDate: ${moment(this.fromDate, "YYYY-MM-DD").format('D')} toDate: ${moment(this.toDate, "YYYY-MM-DD").format('D')}`);
        let queryMonth = (month >= Number(moment(this.fromDate, "YYYY-MM-DD").format('M')) && month <= Number(moment(this.toDate, "YYYY-MM-DD").format('M')));
        console.log(`FromMonth: ${moment(this.fromDate, "YYYY-MM-DD").format('M')} toMonth: ${moment(this.toDate, "YYYY-MM-DD").format('M')}`);
        let queryYear = (year >= Number(moment(this.fromDate, "YYYY-MM-DD").format('YYYY')) && year <= Number(moment(this.toDate, "YYYY-MM-DD").format('YYYY')))
        console.log(`FromYear: ${moment(this.fromDate, "YYYY-MM-DD").format('YYYY')} toYear: ${moment(this.toDate, "YYYY-MM-DD").format('YYYY')}`);
        return queryDate && queryMonth && queryYear
      })
    })
  }
  displayStudentIDOnChange(){
    if (this.displayStudentID === null) this.showAllStudents = true;
    else this.showAllStudents = false;
  }
  showAllStudentsOnChange(){
    if (this.showAllStudents) this.displayStudentID = null;
  }
  studentsMode(){
    this.currentMode = "students";
  }
  printersMode(){
    this.currentMode = "printers";
  }
  toggleShowExtraLogs(idx: number){
    this.copyStudentLogs[idx].showAll = !this.copyStudentLogs[idx].showAll;
  }
}
