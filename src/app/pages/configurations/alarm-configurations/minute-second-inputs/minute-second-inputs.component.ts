import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kl-minute-second-inputs',
  templateUrl: './minute-second-inputs.component.html',
  styleUrls: ['./minute-second-inputs.component.scss']
})
export class MinuteSecondInputsComponent implements OnInit {
  @Output()
  minuteSecondDataChange: EventEmitter<string> = new EventEmitter<string>();
  _minuteSecondData:string;
  @Input() set  minuteSecondData(val:string){
    this.minuteSecondDataChange.emit(val);
    this._minuteSecondData = val;
  }
  get minuteSecondData(){
    return this._minuteSecondData;
  }
  minuteValue:number = 0;
  secondValue:number = 0;
  constructor() { }

  ngOnInit() {
    this.setMinAndSecInputValue();
  }

  setMinAndSecInputValue(){
    let inMinuteSecondData:string = '';
    inMinuteSecondData = this.minuteSecondData; 
    this.minuteValue = (inMinuteSecondData != "" && inMinuteSecondData.split(":")[0] != "") ? Number(inMinuteSecondData.split(":")[0]) : 0;
    this.secondValue = (inMinuteSecondData != "" && inMinuteSecondData.split(":")[1] != "") ? Number(inMinuteSecondData.split(":")[1]) : 0;
  }

  onChangeOfMinuteSecond(){
    if(this.minuteValue !== null && this.secondValue !== null) {
      this.minuteSecondData = this.minuteValue+":"+this.secondValue;
    } else {
      this.minuteSecondData = "";
    }
  }

}
