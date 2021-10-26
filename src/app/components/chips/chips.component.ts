import {
  Component,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
  EventEmitter
} from '@angular/core';
import { AngularMultiSelect } from 'angular2-multiselect-dropdown';
import { fromEvent, Subscription } from 'rxjs';
import { debounceTime, filter, map, switchMap, tap } from 'rxjs/operators';
import { ChipService } from './chip.service';

@Component({
  selector: 'kl-chips',
  templateUrl: './chips.component.html',
  styleUrls: ['./chips.component.scss']
})
export class ChipsComponent implements OnInit, OnDestroy {
  @ViewChild('dropdownRef') dropdownRef: AngularMultiSelect;
  @Output() onAdd = new EventEmitter();
  @Output() onRemove = new EventEmitter();
  @Output() onRemoveAll = new EventEmitter();
  @Output() onSelectAllFiltered = new EventEmitter();
  @Output() onDeSelectAllFiltered = new EventEmitter();

  itemList = [];
  selectedItems = [];
  settings = {};
  count = 1000;
  searchInputField: any;
  clearButton: any;
  userInputSearch: string = '';
  private unlistener: () => void;
  private clickUnlistener: () => void;
  searchSubscription: Subscription;
  isDropdownOpened: boolean = false;
  emitSelected = [];
  emitAllSelected = [];
  isExactMatchInSuggestion: boolean = false;

  constructor(private renderer: Renderer2, private chipService: ChipService) {}

  ngOnInit() {
    this.itemList = [];
    this.selectedItems = [];
    this.setDopdownsettings(
      false,
      'Start typing... Press enter to add a new keyword.'
    );
    this.getKeywords();
  }

  ngOnDestroy() {
    this.chipService.customAddedKeywords = [];
    if (this.searchSubscription) this.searchSubscription.unsubscribe();
  }

  setDopdownsettings(selectAll, label) {
    this.settings = {
      labelKey: 'keyword',
      singleSelection: false,
      disabled: false,
      text: 'Add keywords',
      enableSearchFilter: true,
      searchPlaceholderText: 'Search keywords',
      enableFilterSelectAll: selectAll,
      filterSelectAllText: 'Select all',
      filterUnSelectAllText: 'Deselect all',
      maxHeight: 300,
      enableCheckAll: false,
      noDataLabel: label
    };
  }

  onItemSelect(item) {
    this.emitSelected = [];
    if (this.selectedItems.length > 0) {
      for (const each of this.selectedItems) {
        this.emitSelected.push(each['keyword']);
      }
    }
    //  this.emitSelected.push(item['keyword']);
    this.onAdd.emit(this.emitSelected);
  }

  OnItemDeSelect(item: any) {
    this.emitSelected = [];
    for (const eachKeyword of this.selectedItems) {
      this.emitSelected.push(eachKeyword['keyword']);
    }
    this.onRemove.emit(this.emitSelected);
  }

  onSelectAllSuggested(items: any) {
    this.emitAllSelected = [];
    if (this.selectedItems.length > 0) {
      for (const eachKeyword of this.selectedItems) {
        this.emitAllSelected.push(eachKeyword['keyword']);
      }
    }
    this.onSelectAllFiltered.emit(this.emitAllSelected);
  }

  onDeselectAllSuggested(items: any) {
    this.emitAllSelected = [];
    for (const eachKeyword of this.selectedItems) {
      this.emitAllSelected.push(eachKeyword['keyword']);
    }
    this.onDeSelectAllFiltered.emit(this.emitAllSelected);
  }

  onDeSelectAll(items: any) {
    this.selectedItems = [];
    this.itemList = [];
    // this.emitAllSelected = [];
    this.setDopdownsettings(
      false,
      'Start typing... Press enter to add a new keyword.'
    );
    this.onRemoveAll.emit([]);
  }

  onDropdownClose(e) {
    if (this.unlistener) {
      this.unlistener();
    }
    if (this.clickUnlistener) {
      this.clickUnlistener();
    }
  }

  onClickOutside() {
    if (this.searchInputField) {
      this.renderer.setProperty(this.searchInputField, 'value', '');
    }
    this.itemList = [];
    this.setDopdownsettings(
      false,
      'Start typing... Press enter to add a new keyword.'
    );
  }

  onDropdownOpen() {
    this.searchInputField = this.dropdownRef[
      '_elementRef'
    ].nativeElement.children[0].children[1].children[2].children[0].children[2];
    this.clearButton = this.dropdownRef[
      '_elementRef'
    ].nativeElement.children[0].children[1].children[2].children[0].children[1];
    this.clickUnlistener = this.renderer.listen(
      this.clearButton,
      'click',
      (event) => {
        this.itemList = [];
        this.setDopdownsettings(
          false,
          'Start typing... Press enter to add a new keyword.'
        );
      }
    );
    this.unlistener = this.renderer.listen(
      this.searchInputField,
      'keyup.enter',
      (event) => {
        this.isExactMatchInSuggestion = false;
        const searchInput = this.searchInputField.value.trim();
        this.userInputSearch = searchInput;
        this.count++;
        if (searchInput !== '') {
          if (this.itemList.length == 0) {
            // no suggestions
            this.addKeyword({ id: this.count, keyword: searchInput }, true);
          }
          if (this.itemList.length > 0) {
            //few suggestions exist, handle A. may be exact match B. may not be(new)
            for (const eachItem of this.itemList) {
              if (eachItem['keyword'] === searchInput) {
                // A.
                this.isExactMatchInSuggestion = true;
                this.addKeyword(eachItem, false);
                break;
              }
            }
            if (!this.isExactMatchInSuggestion) {
              // B.
              this.addKeyword({ id: this.count, keyword: searchInput }, true);
              this.isExactMatchInSuggestion = false;
            }
          }
        }
        // this.dropdownRef.closeDropdown();
        // setTimeout(() => {this.dropdownRef['_elementRef'].nativeElement.children[0].children[0].children[0].click();}, 4);
      }
    );
    if (!this.isDropdownOpened) {
      this.initTypeaheadSuggestions();
      this.isDropdownOpened = true;
    }
  }

  initTypeaheadSuggestions() {
    this.searchSubscription = fromEvent(this.searchInputField, 'keyup')
      .pipe(
        debounceTime(250),
        map((event: KeyboardEvent) => (event.target as HTMLInputElement).value),
        tap((text) => this.clearSuggestions(text)),
        filter((text) => text.trim().length > 0 && text !== ''),
        switchMap((value) => this.chipService.getSuggestions(value))
      )
      .subscribe((data) => {
        this.itemList = data;
        if (this.itemList.length > 0) {
          this.setDopdownsettings(true, '');
        }
        if (this.itemList.length === 0) {
          this.setDopdownsettings(false, 'Press enter to add.'); // to avoid duplicate label
        }
      });
  }

  getKeywords() {
    this.chipService.getKeywords();
  }

  clearSuggestions(inputText) {
    if (inputText.length === 0) {
      this.itemList = [];
      this.setDopdownsettings(
        false,
        'Start typing... Press enter to add a new keyword.'
      );
    }
  }

  addKeyword(keyword, suggest) {
    const isDuplicate = this.checkIsDuplicate();
    if (!isDuplicate) {
      if (suggest) {
        this.chipService.customAddedKeywords.push(keyword);
      }
      this.selectedItems.push(keyword);
      this.onItemSelect(keyword);
    }
  }

  checkIsDuplicate() {
    if (this.selectedItems.length > 0) {
      for (const each of this.selectedItems) {
        if (each['keyword'] === this.userInputSearch) return true;
      }
    } else {
      return false;
    }
  }
}
