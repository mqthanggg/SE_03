import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-system-config',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './system-config.component.html',
  styleUrl: './system-config.component.css'
})
export class SystemConfigComponent {
  @Output() ReloadEvent = new EventEmitter();
  data: any;
  defaultDate: any;
  defaultPages: number = 0;
  listOfTypes: any[] = [];
  constructor(private http: HttpClient){
    this.http.get('http://localhost:4000/default-pages').subscribe((res: any) => {
      this.data = res.data;
      this.defaultDate = this.data.defaultDate;
      this.defaultPages = this.data.defaultPages;
    })
    this.http.get('http://localhost:4000/types/full').subscribe((res: any) => {
      this.listOfTypes = res.data;
    })
  }
  updateData(){
    this.data.defaultDate = this.defaultDate;
    this.data.defaultPages = this.defaultPages;
    let types_put = this.http.put('http://localhost:4000/types', {data: this.listOfTypes});
    let pages_post = this.http.post('http://localhost:4000/default-pages', {data: this.data});
    this.ReloadEvent.emit([types_put, pages_post]);
  }
  //yyyy-mm-dd
}
