import { JsonPipe, NgClass } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Output, EventEmitter, Renderer2, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IDExistsValidatorDirective } from './idexists-validator.directive';

@Component({
  selector: 'app-printers',
  standalone: true,
  imports: [FormsModule, JsonPipe, NgClass, IDExistsValidatorDirective],
  templateUrl: './printers.component.html',
  styleUrl: './printers.component.css'
})
export class PrintersComponent {
  @Output() ReloadEvent = new EventEmitter();
  madeChanges = false;
  listOfPrinters: any[] = [];
  constructor(private http: HttpClient, private renderer: Renderer2, private elRef: ElementRef){
    this.http.get('http://localhost:4000/printer-storage').subscribe((res: any) => {
      this.listOfPrinters = res.listOfPrinters;
    })
  }

  editingPrinterID: number | undefined = undefined;
  editingPrinterManufacturer: string | undefined = undefined;
  editingPrinterModel: string | undefined = undefined;
  editingPrinterDesc: string | undefined = undefined;
  editingPrinterLocationCampus: string | undefined = undefined;
  editingPrinterLocationBuilding: string | undefined = undefined;
  editingPrinterLocationRoom: number | undefined = undefined;

  currentEditingPrinterIdx = 0;
  currentRemovingPrinterIdx = 0;

  newPrinterID: number | undefined = undefined;
  newPrinterManufacturer: string | undefined = undefined;
  newPrinterModel: string | undefined = undefined;
  newPrinterDesc: string | undefined = undefined;
  newPrinterLocationCampus: string | undefined = undefined;
  newPrinterLocationBuilding: string | undefined = undefined;
  newPrinterLocationRoom: number | undefined = undefined;
  newPrinterStatus: boolean = true;
  onSubmit(){

  }
  editPrinter(idx: number){
    this.currentEditingPrinterIdx = idx;
    ({
      id: this.editingPrinterID,
      manufacturer: this.editingPrinterManufacturer,
      model: this.editingPrinterModel,
      desc: this.editingPrinterDesc,
      location: {
        campus: this.editingPrinterLocationCampus,
        building: this.editingPrinterLocationBuilding,
        room: this.editingPrinterLocationRoom
      }
    } = this.listOfPrinters[idx])
    this.renderer.removeClass(this.elRef.nativeElement.querySelector("#edit-printer"),"hidden");
    setTimeout(() => {
      this.renderer.removeClass(this.elRef.nativeElement.querySelector("#edit-printer"), "opacity-0");
      this.renderer.addClass(this.elRef.nativeElement.querySelector("#edit-printer"), "opacity-95");
    }, 100);
  }
  closeEditPrinter(){
    this.renderer.addClass(this.elRef.nativeElement.querySelector("#edit-printer"), "opacity-0");
    this.renderer.removeClass(this.elRef.nativeElement.querySelector("#edit-printer"), "opacity-95");
    setTimeout(() => {
      this.renderer.addClass(this.elRef.nativeElement.querySelector("#edit-printer"),"hidden");
    }, 100);
  }
  saveEditPrinter(){
    if (!this.madeChanges ||
      this.listOfPrinters[this.currentEditingPrinterIdx].id == this.editingPrinterID &&
      this.listOfPrinters[this.currentEditingPrinterIdx].manufacturer == this.editingPrinterManufacturer &&
      this.listOfPrinters[this.currentEditingPrinterIdx].model == this.editingPrinterModel &&
      this.listOfPrinters[this.currentEditingPrinterIdx].desc == this.editingPrinterDesc &&
      this.listOfPrinters[this.currentEditingPrinterIdx].location.campus == this.editingPrinterLocationCampus &&
      this.listOfPrinters[this.currentEditingPrinterIdx].location.building == this.editingPrinterLocationBuilding &&
      this.listOfPrinters[this.currentEditingPrinterIdx].location.room == this.editingPrinterLocationRoom
    ) {
      this.closeEditPrinter();
      return;
    }
    // Object.assign(this.listOfPrinters[this.currentEditingPrinterIdx], {
    //   id: this.editingPrinterID,
    //   manufacturer: this.editingPrinterManufacturer,
    //   model: this.editingPrinterModel,
    //   desc: this.editingPrinterDesc,
    //   location: {
    //     campus: this.editingPrinterLocationCampus,
    //     building: this.editingPrinterLocationBuilding,
    //     room: this.editingPrinterLocationRoom
    //   }
    // }); 
    // this.updatePrinters();
    this.ReloadEvent.emit(
      this.http.put(`http://localhost:4000/printer_storage/${this.currentEditingPrinterIdx}`, {
        id: this.editingPrinterID,
        manufacturer: this.editingPrinterManufacturer,
        model: this.editingPrinterModel,
        desc: this.editingPrinterDesc,
        location: {
          campus: this.editingPrinterLocationCampus,
          building: this.editingPrinterLocationBuilding,
          room: this.editingPrinterLocationRoom
        }
      })
    );
  }
  saveNewPrinter(){
    // this.listOfPrinters.push({
    //   id: this.newPrinterID,
    //   manufacturer: this.newPrinterManufacturer,
    //   model: this.newPrinterModel,
    //   desc: this.newPrinterDesc,
    //   location: {
    //     campus: this.newPrinterLocationCampus,
    //     building: this.newPrinterLocationBuilding,
    //     room: this.newPrinterLocationRoom
    //   },
    //   status: this.newPrinterStatus ? "enabled" : "disabled",
    //   logs: []
    // })
    this.ReloadEvent.emit(
      this.http.post('http://localhost:4000/printer_storage', {
        id: this.newPrinterID,
        manufacturer: this.newPrinterManufacturer,
        model: this.newPrinterModel,
        desc: this.newPrinterDesc,
        location: {
          campus: this.newPrinterLocationCampus,
          building: this.newPrinterLocationBuilding,
          room: this.newPrinterLocationRoom
        },
        status: this.newPrinterStatus ? "enabled" : "disabled",
        logs: []
      })
    )
  }
  toggleEnabled(idx: number){
    this.ReloadEvent.emit(
      this.http.put(`http://localhost:4000/printer_storage/${idx}`, {
        status: "enabled"
      })
    );
  }
  toggleDisabled(idx: number){
    this.ReloadEvent.emit(
      this.http.put(`http://localhost:4000/printer_storage/${idx}`, {
        status: "disabled"
      })
    );
  }
  openDeletePrinter(idx: number){
    this.currentRemovingPrinterIdx = idx;
    this.renderer.setProperty(this.elRef.nativeElement.querySelector('#removing-printer-info'),"textContent","ID: " + this.listOfPrinters[this.currentRemovingPrinterIdx].id + " " +
    this.listOfPrinters[this.currentRemovingPrinterIdx].location.campus + " - " +
    this.listOfPrinters[this.currentRemovingPrinterIdx].location.building + " - " +
    this.listOfPrinters[this.currentRemovingPrinterIdx].location.room + "\n" +
    this.listOfPrinters[this.currentRemovingPrinterIdx].manufacturer + " " +
    this.listOfPrinters[this.currentRemovingPrinterIdx].model);
    this.renderer.removeClass(this.elRef.nativeElement.querySelector("#remove-printer"),"hidden");
    setTimeout(() => {
      this.renderer.removeClass(this.elRef.nativeElement.querySelector("#remove-printer"), "opacity-0");
      this.renderer.addClass(this.elRef.nativeElement.querySelector("#remove-printer"), "opacity-95");
    }, 100);

  }
  removePrinter(idx: number){
    this.listOfPrinters.splice(idx,1);
    this.ReloadEvent.emit(
      this.http.delete(`http://localhost:4000/printer_storage/${idx}`)
    );
  }
  closeDeletePrinter(){
    this.renderer.addClass(this.elRef.nativeElement.querySelector("#remove-printer"), "opacity-0");
    this.renderer.removeClass(this.elRef.nativeElement.querySelector("#remove-printer"), "opacity-95");
    setTimeout(() => {
      this.renderer.addClass(this.elRef.nativeElement.querySelector("#remove-printer"),"hidden");
    }, 100);
  }
}
