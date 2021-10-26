import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'AlarmFilterPipe'
})
export class AlarmFilterPipe implements PipeTransform {
  transform(value: any, input: string) {
    if (input) {
      // tslint:disable-next-line:no-parameter-reassignment
      input = input.toLowerCase();
      // tslint:disable-next-line:ter-prefer-arrow-callback
      return value.filter(function (el: any) {
        return el.alarmName.toLowerCase().indexOf(input) > -1;
      });
    }
    return value;
  }
}
