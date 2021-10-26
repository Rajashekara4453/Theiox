import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'columnsearch'
})
export class ColumnsearchPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    return null;
  }
}
