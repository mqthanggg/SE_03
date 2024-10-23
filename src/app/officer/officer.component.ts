import { Component, ElementRef, Renderer2 } from '@angular/core';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PrintersComponent } from './printers/printers.component';
import { Observable, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { SystemConfigComponent } from './system-config/system-config.component';
import { LogComponent } from './log/log.component';

@Component({
  selector: 'app-officer',
  standalone: true,
  imports: [DashboardComponent, PrintersComponent, SystemConfigComponent, LogComponent],
  templateUrl: './officer.component.html',
  styleUrl: './officer.component.css'
})
export class OfficerComponent{
  isAsideOptionClicked = false;
  latestPage: "dashboard" | "printers" | "system_config" | "view_log" | "view_report" | "reload" | "" = "";
  page: "dashboard" | "printers" | "system_config" | "view_log" | "view_report" | "reload"= "view_log";
  constructor(private renderer: Renderer2, private elRef: ElementRef, private router: Router){
    this.latestPage = this.page;
  }
  asideOptionClicked(){
    if (this.isAsideOptionClicked){
      this.renderer.removeClass(this.elRef.nativeElement.querySelector('aside'),'ml-0');
      this.renderer.addClass(this.elRef.nativeElement.querySelector('aside'),'-ml-[12.4rem]');
      this.isAsideOptionClicked = false;
    }
    else{
      this.renderer.addClass(this.elRef.nativeElement.querySelector('aside'),'ml-0');
      this.renderer.removeClass(this.elRef.nativeElement.querySelector('aside'),'-ml-[12.4rem]');
      this.isAsideOptionClicked = true;
    }
  }
  reload(observes: Observable<any>[]){
    this.latestPage = this.page;
    this.page = "reload"
    forkJoin(observes).subscribe((res:any[]) => {
        if (res.every((value) => value.status===200)) {
        this.page = this.latestPage as "dashboard" | "printers" | "system_config" | "view_log" | "view_report" | "reload";
      }
    })
  }
  signOut(){
    this.router.navigateByUrl('login', {
    });
  }
}
