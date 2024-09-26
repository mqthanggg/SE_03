import { Component, Output, Input, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthComponent } from '../auth/auth.component';
import { HttpClient } from '@angular/common/http';
import { User } from '../auth/type';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  @Input() userMail = "";
  @Input() userPassword = ""
  @Input() userID = "";
  @Output() userNameEvent = new EventEmitter;
  @Output() userPapersEvent = new EventEmitter;
  @Output() isLoggedInEvent = new EventEmitter;
  @Output() userIDEvent = new EventEmitter;

  selectedAvatar: File | undefined = undefined
  isSigningUp: boolean = false;
  alreadyAvailableUser: boolean = false;
  invalidSyntax: boolean = false;

  isLoggedInChange(stage: boolean){
    this.isLoggedInEvent.emit(stage);
  }

  listOfUsers: User[] = [];
  currentUser: User | undefined = undefined;
  isUnknown: boolean = false;
  constructor(private http: HttpClient) {  }
  obtainAvatarUpload(event: Event){
    if (event.target as HTMLInputElement !== null){
      if ((event.target as HTMLInputElement).files !== null){
        this.selectedAvatar = ((event.target as HTMLInputElement).files as FileList)[0]
      }
    }
  }
  submitLogin(){
    // this.http.post()
    this.http.post('http://localhost:4000/login-request', {mail: this.userMail, password: this.userPassword}).subscribe((res: any) => {
      console.log(res);
      
      if (res.isLoggedIn) {
        this.userPapersEvent.emit(res.papers);
        this.userNameEvent.emit(this.userMail.split(`@`)[0]);
        this.userIDEvent.emit(res.userID);
        this.isLoggedInEvent.emit(true);
      }
      else {
        this.isUnknown = true;
        setTimeout(() => this.isUnknown = false, 2000);
      }
    })
  }
  clickSignUp(){
    //Avatar 40x40
    //SSO?
    // if (!this.userMail.includes('@hcmut.edu.vn')) {
    //   this.invalidMail = true;
    //   setTimeout(() => this.invalidMail = false, 2000);
    // }
    this.isSigningUp = true;
    this.userMail = "";
    this.userPassword = "";
    
    
  }

  submitSignUp(){
    if (this.userMail.match(/[a-zA-Z0-9]+\.[a-zA-Z0-9]+@hcmut.edu.vn/) !== null && this.userPassword.length >= 8){
      this.http.post('http://localhost:4000/check-user', 
        {
          mail: this.userMail, 
          userID: this.userID
        }).subscribe((res: any) => {      
        if (res.isAvailable) {
          this.alreadyAvailableUser = true;
          setTimeout(() => this.alreadyAvailableUser = false, 2000);
        }
        else{
          const formData = new FormData();
          formData.append('mail', this.userMail);
          formData.append('password', this.userPassword);
          formData.append('userID', this.userID);
          formData.append('avatar_file', (this.selectedAvatar as File));
          this.http.post('http://localhost:4000/sign-up', 
            formData).subscribe((res: any) => {
            console.log(res.status);
            this.isSigningUp = false;
            this.userID = "";
          })
        }
      })
    }
    else {
      this.invalidSyntax = true;
      setTimeout(() => this.invalidSyntax = false, 2000);
    }
  }
  submit(){
    if (this.isSigningUp) return this.submitSignUp()
    else return this.submitLogin();
  }
}
