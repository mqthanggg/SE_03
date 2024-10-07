import { Component, Output, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StudentComponent } from './student/student.component';
import { LoginComponent } from './login/login.component';
import { Router, RouterOutlet } from '@angular/router';
import { Location } from '@angular/common';
import { OfficerComponent } from './officer/officer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [StudentComponent, LoginComponent, RouterOutlet, OfficerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  userID = "";
  userName = "";
  userPapers = 0;
  isLoggedIn: boolean = false;
  userRole = "";

  isServerAvailable = false;

  constructor(private http: HttpClient, private router: Router, private location: Location) {  
    this.checkServerAvailable()
    setInterval(() => {
      this.checkServerAvailable()
    }, 5000);
    const currentState = this.router.getCurrentNavigation();
    
    if (currentState === null) {
      this.router.navigateByUrl('login');
      return;
    }
    this.isLoggedIn = currentState.extras.state?.['isLoggedIn'];
    
    if (!this.isLoggedIn) {
      this.userRole = this.userName = this.userID = "";
      this.userPapers = 0;
      this.router.navigateByUrl('login')
      return;
    }
    this.userRole = currentState.extras.state?.['userRole'];
    this.userName = currentState.extras.state?.['userName'];
    if (this.userRole === "student"){
      this.userID = currentState.extras.state?.['userID'];
      this.userPapers = currentState.extras.state?.['userPapers'];
    }
    
  }

  checkServerAvailable(){
    this.http.get('http://localhost:4000').subscribe({
      next: (res: any) => {
        if (res.status === 200) this.isServerAvailable = true;
      },
      error: (err: any) => {
        if (err.status === 0) {
          this.isServerAvailable = false;
        }
      }
    })
  }
  changeUserID(id: string) {
    this.userID = id;
  }
  changeUserName(name: string){
    this.userName = name;
  }
  changeLoggedInState(state: boolean){
    this.isLoggedIn = state;
  }
  changeUserPapers(papers: number){
    this.userPapers = papers;
  }
  changeUserRole(role: string){
    this.userRole = role;
  }
}
