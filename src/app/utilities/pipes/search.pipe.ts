import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search'
})
export class SearchPipe implements PipeTransform {
  public transform(value, keys: any, term: string, filteredData: Array<any>) {
    return value.filter((item) => {
      let exist_flag: Boolean = false;
      keys.forEach((key) => {
        if (!exist_flag) {
          exist_flag = false;
          if (item.hasOwnProperty(key)) {
            if (term) {
              if (item[key].toLowerCase().indexOf(term.toLowerCase()) === -1) {
                exist_flag = false;
              } else {
                exist_flag = true;
              }
              // let regExp = new RegExp('\\b' + term, 'gi');
              // exist_flag = regExp.test(item[key]);
            } else {
              exist_flag = true;
            }
          } else {
            exist_flag = false;
          }
        }
      });
      if (term != undefined && term != '' && exist_flag == true)
        filteredData.push(item);
      return keys.length > 0 ? exist_flag : true;
    });
  }
}
