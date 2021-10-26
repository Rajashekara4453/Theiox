import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'kl-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements OnInit {
  @Input() percentValue: string = '';
  @Input() bgColor: string = '';
  @Input() displayText: string = '';
  @Input() isDisplayVertical: boolean = false;
  displayTextWidth: number;
  @ViewChild('progress') progress: ElementRef;
  @Input() progressTagCount;
  constructor() {}

  ngOnInit() {}

  ngOnChanges() {
    this.displayTextWidth = this.progress.nativeElement.offsetWidth;
  }

  ngOnCheck() {
    if (this.progress.nativeElement.offsetWidth) {
      this.displayTextWidth = this.progress.nativeElement.offsetWidth;
    }
  }
}
