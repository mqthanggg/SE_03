import { Component, Input } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { PrintComponent } from './print/print.component';
import { HomeComponent } from './home/home.component';
import { BuyComponent } from './buy/buy.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { LoginComponent } from './login/login.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, PrintComponent, HomeComponent, BuyComponent, AboutUsComponent, LoginComponent, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  userID = "";
  userPapers = 0;
  userName = "";
  isServerAvailable: boolean = false;
  isLoggedIn: boolean = false;
  visibleDropDown: boolean = false;
  currentTag = "login";
  avatarSrc = ""
  constructor(private http: HttpClient){
    this.checkServerAvailable()
    setInterval(() => {
      this.checkServerAvailable()
    }, 5000);
  }
  userPapersChange(papers: number){
    this.userPapers = papers;
  }
  changeCurrentTag(tag: "home" | "print" | "buy" | "about-us" | "login"){
    this.currentTag = tag;
  }
  userNameChange(name: string){
    this.userName = name;
  }
  changeLoggedInStage(stage: boolean){
    this.isLoggedIn = stage;
    if (stage) {
      this.getAvatarSrc();
      this.currentTag = "home"
    }
    else this.currentTag = "login";
  }
  toggleDropDown(){
    this.visibleDropDown = !this.visibleDropDown;
  }
  checkServerAvailable(){
    this.http.get('http://localhost:4000').subscribe({
      next: (res: any) => {
        if (res.status === 200) this.isServerAvailable = true;
      },
      error: (err: any) => {
        if (err.status === 0) {
          this.isServerAvailable = false;
          this.isLoggedIn = false;
          this.currentTag = 'login'
        }
      }
    })
  }
  changeUserID(ID: string){
    this.userID = ID;
  }
  getAvatarSrc(){
    this.http.get(`http://localhost:4000/user-avatar/${this.userID}`).subscribe((res: any) => {
      this.avatarSrc = res.avatar_src;
    })
  }
}
