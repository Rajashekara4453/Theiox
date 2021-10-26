import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sidebarSearch'
})
export class SidebarSearchPipe implements PipeTransform {
  /*
  (p1) items : array to be searched in.
  (p2) searchText: the text to be searched in the array.
  (p3) inKeysTobeSearched: Array of property names of an object in string format; To search in Array of objects.
  (p4) isArrayOfObjects: make it false if you are passing array of strings.
  (p5) minLength: waits for minimum number of characters as input; default = 3
  */
  transform(
    items: any[],
    searchText: any,
    inKeysTobeSearched: any,
    isArrayOfObjects: boolean,
    minLength: number
  ): any[] {
    if (!items) {
      return [];
    }
    if (!searchText || searchText.length < (minLength ? minLength : 3)) {
      return [];
    }
    let searchFor = searchText;
    searchFor = searchText.toLowerCase();
    const result = this.search(
      items,
      searchText,
      inKeysTobeSearched,
      isArrayOfObjects
    );
    return result;
  }
  search(items, searchText, inKeysTobeSearched, isArrayOfObjects) {
    const result = items.filter((item) => {
      if (isArrayOfObjects) {
        if (inKeysTobeSearched == null || inKeysTobeSearched.length == 0) {
          console.log(
            'elmfilter: Key has to be specified when value for isArrayOfObjects is true.'
          );
        }
        let trueOrFalse: boolean = false;
        for (let index = 0; index < inKeysTobeSearched.length; index++) {
          const element = inKeysTobeSearched[index];
          if (
            (item[element] ? item[element] : '')
              .toLowerCase()
              .includes(searchText.toLowerCase())
          ) {
            trueOrFalse = true;
          }
          if (item.hasOwnProperty('children') && item.children.length > 0) {
            item.children.filter((childItem) => {
              if (
                childItem[element]
                  .toLowerCase()
                  .includes(searchText.toLowerCase())
              ) {
                trueOrFalse = true;
              }
              // else{
              //   this.search(item['children'],searchText,inKeysTobeSearched,isArrayOfObjects);

              // }
            });
          } else {
            continue;
          }
        }
        return trueOrFalse;
      } else {
        return item.toLowerCase().includes(searchText);
      }
    });
    return result;
  }
}
