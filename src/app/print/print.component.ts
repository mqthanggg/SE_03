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
  alreadySubmittedFileName: string = "";
  filePages: number = 0;
  accurateFilePages: number = 0;
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
  @Input() userID = "";
  @Input() copies = 1;
  @Input() userPapers = 0;
  @Output() userPapersChange = new EventEmitter;
  printingResponse: {
    res_copies: number,
    res_file_name: string,
    res_mode: string,
    res_printer_id: string,
    res_size: string,
    res_userID: string,
    res_papers: number,
    status: number
  } | undefined = undefined;
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
      req_papers: this.getRequiredPapers(),
      file_name: this.alreadySubmittedFileName
    }
    this.http.post(this.serverURL + '/printing-request', req).subscribe((res: any) => {
      if (res.status === 200) {
        this.printingResponse = res;
        this.selectedFile = undefined;
        console.log(res);
        this.alreadySubmittedFileName = "";
        this.userPapersChange.emit(this.userPapers -= res.res_papers);        
        this.togglePopUp(true);
        this.renderer.setProperty(this.elRef.nativeElement.querySelector('#file-upload'), "value", null)
      }
    });
  }
  togglePopUp(open: boolean){
    let popUpBg = this.elRef.nativeElement.querySelector('#pop-up-bg')
    let popUp = this.elRef.nativeElement.querySelector('#print-pop-up');
    if(open){
      this.renderer.removeClass(popUpBg, 'hidden');
      this.renderer.removeClass(popUp, 'opacity-0');
      this.renderer.addClass(popUp, 'opacity-100');
      this.renderer.removeClass(popUp, 'scale-0');
      setTimeout(() => {
        this.renderer.addClass(popUp, 'scale-100')
      })
    }
    else {
      this.renderer.addClass(popUpBg, 'hidden');
      this.renderer.removeClass(popUp, 'scale-100');
      this.renderer.removeClass(popUp, 'opacity-100');
      this.renderer.addClass(popUp, 'scale-0');
      this.renderer.addClass(popUp, 'opacity-0');
    }
  }
  getRequiredPapers(){
    if (this.filePages === 0 || this.copies === 0 || this.selectedSize === undefined || this.selectedMode === "") return "N/A";
    const A4Size = this.listOfPaperSize.find((type: PaperType) => {
      return type.type === "A4";
    })
    let A4Area = 0;
    if (A4Size !== undefined) A4Area = A4Size.width*A4Size.height;
    let currentSizeArea = (this.selectedSize as PaperType).width * (this.selectedSize as PaperType).height;
    let selectedSizePapers = 0;
    if (A4Area > currentSizeArea) {
      selectedSizePapers = this.DecimalPrecision2.trunc(this.DecimalPrecision2.round(A4Area / currentSizeArea, 1), 0);
      selectedSizePapers = 1/selectedSizePapers;
    }
    else selectedSizePapers = this.DecimalPrecision2.trunc(this.DecimalPrecision2.round(currentSizeArea / A4Area, 1), 0);
    if (this.selectedMode === 'two-sided')
      this.accurateFilePages = this.DecimalPrecision2.ceil(this.filePages/2, 0);
    else {
      this.accurateFilePages = this.filePages;
    }
    return this.DecimalPrecision2.floor(selectedSizePapers*this.copies*this.accurateFilePages, 0);
  }
  DecimalPrecision2 = (function() {
    if (Math.sign === undefined) {
        Math.sign = function(x: number) {
            return (Number(x > 0) - Number(x < 0)) || +x;
        };
    }
    return {
        // Decimal round (half away from zero)
        round: function(num: number, decimalPlaces: number) {
            var p = Math.pow(10, decimalPlaces || 0);
            var n = (num * p) * (1 + Number.EPSILON);
            return Math.round(n) / p;
        },
        // Decimal ceil
        ceil: function(num: number, decimalPlaces: number) {
            var p = Math.pow(10, decimalPlaces || 0);
            var n = (num * p) * (1 - Math.sign(num) * Number.EPSILON);
            return Math.ceil(n) / p;
        },
        // Decimal floor
        floor: function(num: number, decimalPlaces: number) {
            var p = Math.pow(10, decimalPlaces || 0);
            var n = (num * p) * (1 + Math.sign(num) * Number.EPSILON);
            return Math.floor(n) / p;
        },
        // Decimal trunc
        trunc: function(num: number, decimalPlaces: number) {
            return (num < 0 ? this.ceil : this.floor)(num, decimalPlaces);
        },
        // Format using fixed-point notation
        toFixed: function(num: number, decimalPlaces: number) {
            return this.round(num, decimalPlaces).toFixed(decimalPlaces);
        }
    };
})();
}
