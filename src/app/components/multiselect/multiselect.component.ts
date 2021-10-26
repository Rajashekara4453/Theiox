import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl
} from '@angular/forms';

@Component({
  selector: 'kl-multiselect',
  templateUrl: './multiselect.component.html',
  styleUrls: ['./multiselect.component.scss']
})
export class MultiselectComponent implements OnInit {
  @Input() DropDownInfo: any;
  @Input() settings: any;
  @Input() SelectedInfo: any;
  @Output() SelectedValues: EventEmitter<any>;
  @Output() Reset: EventEmitter<any>;
  @Input() form_Control: FormControl;
  dropdownList = [];
  selectedItems = [];
  constructor() {
    this.SelectedValues = new EventEmitter<any>();
    this.Reset = new EventEmitter<any>();
  }

  ngOnInit() {
    if (this.SelectedInfo) {
      this.selectedSetData();
    }
    if (this.settings.DefaultSelect) {
      for (let i = 0; i < this.dropdownList.length; i++) {
        this.selectedItems.push(this.dropdownList[i]);
      }
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.DropDownInfo) {
      if (changes.DropDownInfo['currentValue']) {
        this.DropDownInfo = [];
        this.DropDownInfo = changes['DropDownInfo']['currentValue'];
        this.dropdownSetData();
      }
    }
    if (changes.SelectedInfo) {
      if (changes.SelectedInfo['currentValue']) {
        this.SelectedInfo = [];
        this.SelectedInfo = changes['SelectedInfo']['currentValue'];
        this.selectedSetData();
      }
    }
  }

  dropdownSetData() {
    // this.selectedItems = [];
    if (typeof this.DropDownInfo === 'undefined') {
      this.DropDownInfo = [];
    }
    this.dropdownList = [];
    if (this.DropDownInfo.length > 0) {
      this.dropdownList = this.DropDownInfo;
    }
    // for (let i = 0; i < this.DropDownInfo.length; i++) {
    //   const temp = {
    //     id: this.DropDownInfo[i].value,
    //     itemName: this.DropDownInfo[i].label,
    //     key: this.DropDownInfo[i].value,
    //   };
    //   this.dropdownList.push(temp);
    // }
  }
  selectedSetData() {
    if (typeof this.SelectedInfo === 'string') {
      this.SelectedInfo = [this.SelectedInfo];
    } else if (typeof this.SelectedInfo === 'undefined') {
      this.SelectedInfo = [];
    }
    this.selectedItems = [];
    if (this.settings.fullObject === true) {
      for (let i = 0; i < this.SelectedInfo.length; i++) {
        this.selectedItems.push(this.SelectedInfo[i]);
      }
    } else {
      for (let j = 0; j < this.DropDownInfo.length; j++) {
        for (let i = 0; i < this.SelectedInfo.length; i++) {
          if (this.SelectedInfo[i] === this.DropDownInfo[j].value) {
            this.selectedItems.push(this.DropDownInfo[j]);
          }
        }
      }
    }
  }
  emitData(event) {
    if (event) {
      this.SelectedValues.emit(this.SelectedInfo);
    }
  }
  onItemSelect(item: any) {
    this.utilityFunction(item);
  }
  onItemDeSelect(item: any) {
    this.utilityFunction(item);
  }
  onSelectAll(items: any) {
    this.utilityFunction(items);
  }
  onDeSelectAll(items: any) {
    this.Reset.emit(this.SelectedInfo);
  }
  utilityFunction(items) {
    // let TempObj = {};
    const ObjectPush = [];
    if (this.settings.fullObject === true) {
      // for (let i = 0; i < this.selectedItems.length; i++) {
      //   TempObj = {
      //     label: this.selectedItems[i].itemName,
      //     value: this.selectedItems[i].key,
      //   };
      //   ObjectPush.push(TempObj);
      // }
      this.SelectedInfo = this.selectedItems;
      this.SelectedValues.emit(ObjectPush);
    } else if (this.settings.fullObject === false) {
      for (let i = 0; i < this.selectedItems.length; i++) {
        // ObjectPush.push(this.selectedItems[i].key);
        ObjectPush.push(this.selectedItems[i][this.settings.primaryKey]);
      }
      this.SelectedInfo = ObjectPush;
      this.SelectedValues.emit(ObjectPush);
    }
    // this.SelectedValues.emit(this.SelectedInfo);
  }
  refreshFunc() {
    this.selectedItems = [];
  }
}
