import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'customDate'
})
export class CustomDatePipe extends
  DatePipe implements PipeTransform {
  override transform(value: any, args?: any): any {
    // equals to yyyy-MM-dd -> https://www.angularjswiki.com/angular/angular-date-pipe-formatting-date-times-in-angular-with-examples/
    return super.transform(value, "y-MM-dd");
  }
}