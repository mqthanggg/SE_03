import { Component, ElementRef, Renderer2, Input, EventEmitter, Output  } from '@angular/core';
import { FormsModule, FormBuilder, FormGroup } from '@angular/forms'
import { Printer, PaperType } from './type'
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-print',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './print.component.html',
  styleUrl: './print.component.css'
})
export class PrintComponent {
  alreadySubmittedFileName = "";
  filePages = 0;
  accurateFilePages = 0;
  selectedPrinter: Printer | undefined = undefined;
  selectedSize: PaperType | undefined = undefined;
  listOfPrinters: Printer[] = [];
  supportedTypes: string[] = [];
  listOfPaperSize: PaperType[] = [];
  validFile: boolean = true;
  sizeVisible: boolean = false;
  modeVisible: boolean = false;
  selectedMode: "one-sided" | "two-sided" | "" = "";
  selectedFile: FileList | undefined = undefined;
  uploadForm: FormGroup | undefined = undefined;
  @Input() userID = "";
  @Input() copies = 1;
  @Input() userPapers = 0;
  @Output() userPapersChange = new EventEmitter;
  serverURL: string = `http://localhost:4000`
  constructor(private http: HttpClient, private elRef: ElementRef, private renderer: Renderer2, private formBuilder: FormBuilder){
  }
  ngOnInit(){
    this.http.get(this.serverURL + '/printer-storage').subscribe((res: any) => {
      this.listOfPrinters = (res.listOfPrinters as Printer[]);
    })
    this.http.get(this.serverURL + '/valid-types').subscribe((res: any) => {
      this.supportedTypes = (res.listOfTypes as string[]);      
    })
    this.http.get(this.serverURL + '/paper-size').subscribe((res: any) => {
      this.listOfPaperSize = (res.listOfSizes as PaperType[]);
    })
  }
  ngAfterViewInit(){
  }
  checkFileUpload(event: Event){    
    if ((event.target as HTMLInputElement | null) !== null){
      if (((event.target as HTMLInputElement).files as FileList) !== null) {
        let fileType: string = ((event.target as HTMLInputElement).files as FileList)[0].type;      
          
        this.validFile = this.supportedTypes.includes(fileType);
        if (this.validFile) {
          this.selectedFile = ((event.target as HTMLInputElement).files as FileList);
          const formData = new FormData();
          formData.append('printer_id', (this.selectedPrinter as Printer).id.toString())
          formData.append('submitted_file', this.alreadySubmittedFileName);
          formData.append('file', this.selectedFile[0]);
          this.http.post(this.serverURL + '/file-submit', formData).subscribe((res: any) => {
            this.accurateFilePages = this.filePages = res.file_pages;
          })
          this.alreadySubmittedFileName = ((event.target as HTMLInputElement).files as FileList)[0].name;
        }
      }
    }
  }
  printerClicked(id: number){    
    let thisPrinter = this.elRef.nativeElement.querySelector('#id'+id.toString());
    
    if (this.selectedPrinter === undefined) {
      this.selectedPrinter = this.listOfPrinters[id];
      this.listOfPrinters[id].selected = true;
      this.renderer.addClass(thisPrinter,'bg-blue-200');
      this.renderer.addClass(thisPrinter,'border-blue-500');
      this.renderer.removeClass(thisPrinter,'bg-white');
      this.renderer.removeClass(thisPrinter, 'border-slate-500')
    }
    else{
      if (id === this.selectedPrinter?.id){
        this.renderer.removeClass(thisPrinter,'bg-blue-200');
        this.renderer.removeClass(thisPrinter,'border-blue-500');
        this.renderer.addClass(thisPrinter,'bg-white');
        this.renderer.addClass(thisPrinter, 'border-slate-500')
        this.selectedPrinter = undefined;
      }
      else{
        let selectedPrinter = this.elRef.nativeElement.querySelector('#id' + (this.selectedPrinter as Printer).id.toString())
        this.renderer.removeClass(selectedPrinter,'bg-blue-200');
        this.renderer.removeClass(selectedPrinter,'border-blue-500');
        this.renderer.addClass(selectedPrinter,'bg-white');
        this.renderer.addClass(selectedPrinter, 'border-slate-500')
        this.renderer.addClass(thisPrinter,'bg-blue-200');
        this.renderer.addClass(thisPrinter,'border-blue-500');
        this.renderer.removeClass(thisPrinter,'bg-white');
        this.renderer.removeClass(thisPrinter, 'border-slate-500')
        this.selectedPrinter = this.listOfPrinters[id];
      }
    }
  }
  sizeClicked(type: string){
    let thisSizeElement = this.elRef.nativeElement.querySelector('#' + type);
    
    if (this.selectedSize === undefined){
      this.renderer.addClass(thisSizeElement,'bg-blue-200');
      this.renderer.removeClass(thisSizeElement,'bg-white');
      this.selectedSize = this.listOfPaperSize.find((value: PaperType) => {
        return value.type === type;
      })
    }
    else{
      if (this.selectedSize.type === type){
        this.renderer.removeClass(thisSizeElement,'bg-blue-200');
        this.renderer.addClass(thisSizeElement,'bg-white');
        this.selectedSize = undefined;
      }
      else {
        let selectedSize = this.elRef.nativeElement.querySelector('#' + this.selectedSize.type);
        this.renderer.removeClass(selectedSize,'bg-blue-200');
        this.renderer.addClass(selectedSize,'bg-white');
        this.renderer.addClass(thisSizeElement,'bg-white');
        this.renderer.removeClass(thisSizeElement,'bg-blue-200');
        this.selectedSize = this.listOfPaperSize.find((value: PaperType) => {
          return value.type === type;
        });
      }
    }
  }
  generateID(id: number){
    return "id" + id.toString();
  }
  toggleSizeVisible(){
    this.sizeVisible = !this.sizeVisible;
    this.elRef.nativeElement.querySelector('#size-drop-down').focus()
    if (this.sizeVisible){
      this.renderer.removeClass(this.elRef.nativeElement.querySelector('#paper-size'), 'border-white');
      this.renderer.addClass(this.elRef.nativeElement.querySelector('#paper-size'), 'border-blue-500');
    }
    else{
      this.renderer.addClass(this.elRef.nativeElement.querySelector('#paper-size'), 'border-white');
      this.renderer.removeClass(this.elRef.nativeElement.querySelector('#paper-size'), 'border-blue-500');
    }
  }
  selectMode(mode: "one-sided" | "two-sided"){
    let thisMode = this.elRef.nativeElement.querySelector('#' + mode);
    
    if (this.selectedMode === "") {
      this.selectedMode = mode;
      if (mode === "two-sided") {
        this.accurateFilePages /= 2
        this.accurateFilePages = Math.ceil(this.accurateFilePages);
      }
      else this.accurateFilePages = this.filePages
      this.renderer.addClass(thisMode,'bg-blue-200');
      this.renderer.addClass(thisMode,'border-blue-500');
      this.renderer.removeClass(thisMode,'bg-white');
      this.renderer.removeClass(thisMode, 'border-slate-500')
    }
    else{
      if (mode === this.selectedMode){
        this.renderer.removeClass(thisMode,'bg-blue-200');
        this.renderer.removeClass(thisMode,'border-blue-500');
        this.renderer.addClass(thisMode,'bg-white');
        this.renderer.addClass(thisMode, 'border-slate-500')
        this.selectedMode = "";
      }
      else {
        this.renderer.addClass(thisMode,'bg-blue-200');
        this.renderer.addClass(thisMode,'border-blue-500');
        this.renderer.removeClass(thisMode,'bg-white');
        this.renderer.removeClass(thisMode, 'border-slate-500')
        
        this.renderer.removeClass(this.elRef.nativeElement.querySelector('#'+this.selectedMode),'bg-blue-200');
        this.renderer.removeClass(this.elRef.nativeElement.querySelector('#'+this.selectedMode),'border-blue-500');
        this.renderer.addClass(this.elRef.nativeElement.querySelector('#'+this.selectedMode),'bg-white');
        this.renderer.addClass(this.elRef.nativeElement.querySelector('#'+this.selectedMode), 'border-slate-500')
        this.selectedMode = mode;
        if (mode === "two-sided") {
          this.accurateFilePages /= 2
          this.accurateFilePages = Math.ceil(this.accurateFilePages);
        }
        else this.accurateFilePages = this.filePages
      }
    }
  }
  toggleModeVisible(){
    this.modeVisible = !this.modeVisible;
    if (this.modeVisible){
      this.renderer.removeClass(this.elRef.nativeElement.querySelector('#paper-mode'), 'border-white');
      this.renderer.addClass(this.elRef.nativeElement.querySelector('#paper-mode'), 'border-blue-500');
    }
    else{
      this.renderer.addClass(this.elRef.nativeElement.querySelector('#paper-mode'), 'border-white');
      this.renderer.removeClass(this.elRef.nativeElement.querySelector('#paper-mode'), 'border-blue-500');
    }
  }
  sendPrintingReq(){
    const formData = new FormData();
    const req = {
      user_id: this.userID,
      printer_id: (this.selectedPrinter as Printer).id.toString(),
      req_copies: this.copies,
      req_size: (this.selectedSize as PaperType).type,
      req_mode: this.selectedMode,
      file_pages: this.accurateFilePages,
      file_name: this.alreadySubmittedFileName
    }
    this.http.post(this.serverURL + '/printing-request', req).subscribe((res: any) => {
      if (res.status === 200) {
        console.log(res);
        this.alreadySubmittedFileName = "";
        this.userPapersChange.emit(this.userPapers -= Number(res.req_copies*this.accurateFilePages));
      }
    });
  }
}
