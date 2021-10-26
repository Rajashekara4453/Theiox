import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import { AppService } from '../../services/app.service';

@Injectable({
  providedIn: 'root'
})
export class ChipService {
  defaultStoredKeywords = [];
  customAddedKeywords = [];
  results = [];
  constructor(private appService: AppService) {}

  getKeywords() {
    this.appService.getKeywords().subscribe((data) => {
      this.defaultStoredKeywords = data['data'];
    });
  }

  getSuggestions(searchInput) {
    this.results = this.searchForSuggestions(
      this.defaultStoredKeywords.concat(this.customAddedKeywords),
      searchInput,
      ['keyword'],
      true,
      1
    );
    return from(this.results).toArray();
  }

  searchForSuggestions(
    items: any[],
    searchText: any,
    inKeysTobeSearched: any,
    isArrayOfObjects: boolean,
    minLength: number
  ) {
    if (!items) {
      return;
    }
    if (!searchText || searchText.length < (minLength ? minLength : 3)) {
      return;
    }
    let searchFor = searchText;
    searchFor = searchText.toLowerCase();
    const holdResults = items.filter((item) => {
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
              .includes(searchFor)
          ) {
            trueOrFalse = true;
            break;
          } else {
            continue;
          }
        }
        return trueOrFalse;
      } else {
        return item.toLowerCase().includes(searchText);
      }
    });
    return holdResults;
  }
}
