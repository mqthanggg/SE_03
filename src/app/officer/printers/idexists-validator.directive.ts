import { Directive, Input } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';

@Directive({
  selector: '[appIDExistsValidator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: IDExistsValidatorDirective,
      multi: true
    }
  ],
  standalone: true
})
export class IDExistsValidatorDirective implements Validator{
  @Input () info: {idx?: number, listOfPrinters?: any[]} = {};
  constructor() { 
  }
  validate(control: AbstractControl<any, any>): ValidationErrors | null {
    let id = control.value;
    if (this.info.listOfPrinters?.find((value, index) => {      
      if (index === this.info.idx) return false;
      else {
        return value.id === id;
      }
    }) !== undefined) {
      return {"existedID": true}
    }
    return null;
  }
}
