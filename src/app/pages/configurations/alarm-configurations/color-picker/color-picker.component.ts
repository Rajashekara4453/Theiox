import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kl-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.scss']
})
export class ColorPickerComponent implements OnInit {
  // colorList: Array<string> = [];
  @Output()
  selectedColorDataChange: EventEmitter<string> = new EventEmitter<string>();
  _selectedColorData: string;
  @Input() colorList;
  @Input() set selectedColorData(val: string) {
    this.selectedColorDataChange.emit(val);
    this._selectedColorData = val;
  }

  // colorMap = {
  //   "#E9002D":"#EE4040",
  //   "#FFAA00":"#FFE348",
  //   " #00B000":"#24A148",
  //   "#009ADE":"#36A6DE",
  //   "#AF58BA":"#713C7C",
  //   "#9400D3":"#713C7C",
  //   "#4B0082":"#713C7C",
  //   "#A0B1BA":"#C9CECF",
  //   "#A6761D":"#BBBE64"
  // }
  get selectedColorData() {
    return this._selectedColorData;
  }
  constructor() { }

  ngOnInit() {
    }

  handleSelectedColor(color: string) {
    this.selectedColorData = color;
  }

  onMouseOver(e: any, color: string) {
    if (color != this._selectedColorData) {
      e.currentTarget.style["box-shadow"] = "2px -2px 5px " + color;
    }
  }

  onMouseOut(e: any, color: string) {
    if (color != this._selectedColorData) {
      e.currentTarget.style["box-shadow"] = "0px 0px 0px";
    }
  }

}
