import { Component, OnInit, Input } from '@angular/core';
@Component({
  selector: 'kl-date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.scss']
})
export class DatePickerComponent implements OnInit {
  date: Date = new Date();
  @Input() labelForDate: string;
  settings = {
    bigBanner: false,
    timePicker: false,
    format: 'dd-MM-yyyy',
    defaultOpen: false
  };

  constructor() {}

  ngOnInit() {}
}
