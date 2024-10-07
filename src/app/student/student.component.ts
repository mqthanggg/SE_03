import { Component, Input, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { PrintComponent } from './print/print.component';
import { HomeComponent } from './home/home.component';
import { BuyComponent } from './buy/buy.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { HttpClient } from '@angular/common/http';
import { HistoryComponent } from './history/history.component';

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [PrintComponent, HomeComponent, BuyComponent, AboutUsComponent, HistoryComponent],
  templateUrl: './student.component.html',
  styleUrl: './student.component.css'
})
export class StudentComponent implements AfterViewInit{
  @Input() userID = "";
  @Input() userPapers = 0;
  @Input() userName = "";
  visibleDropDown: boolean = false;
  currentTag = "home";
  avatarSrc = ""
  constructor(private http: HttpClient, private router: Router){
    
  }
  signOut(){
    this.router.navigateByUrl('login', {
    });
  }
  ngAfterViewInit(): void {
      this.getAvatarSrc();
  }
  userPapersChange(papers: number){
    this.userPapers = papers;
  }
  changeCurrentTag(tag: "home" | "print" | "buy" | "about-us" | "history"){
    this.currentTag = tag;
  }
  userNameChange(name: string){
    this.userName = name;
  }
  toggleDropDown(){
    this.visibleDropDown = !this.visibleDropDown;
  }
  getAvatarSrc(){
    this.http.get(`http://localhost:4000/user-avatar/${this.userID}`).subscribe((res: any) => {
      this.avatarSrc = res.avatar_src;
    })
  }
}
