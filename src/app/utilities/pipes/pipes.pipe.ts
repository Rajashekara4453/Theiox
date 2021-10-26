import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'FilterPipe'
})
export class FilterPipe implements PipeTransform {
  transform(value: any, input: string, displayProperty: any) {
    if (input) {
      // tslint:disable-next-line:no-parameter-reassignment
      input = input.toLowerCase();
      // tslint:disable-next-line:ter-prefer-arrow-callback
      return value.filter(function (el: any) {
        return el[displayProperty].toLowerCase().indexOf(input) > -1;
      });
    }
    return value;
  }
}
