import {
  Component,
  OnInit,
  Input,
  EventEmitter,
  Output,
  SimpleChange
} from '@angular/core';

@Component({
  selector: 'kl-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.scss']
})
export class WizardComponent implements OnInit {
  @Input() data: any;
  @Output() step = new EventEmitter();
  @Input() changeStep: Number;
  @Input() settings = {
    showHrLine: true // Horizontal Line
  };

  constructor() {
    this.step = new EventEmitter<any>();
  }

  // ngOnChnages
  ngOnChanges(change: SimpleChange) {
    if (change['changeStep'].currentValue) {
      this.stepUpdate(change['changeStep'].currentValue);
    }
  }

  ngOnInit() {}
  onclick(step) {
    if (step['stepnumber']) {
      this.stepUpdate(step['stepnumber']);
    }
    this.step.emit(step);
  }
  stepUpdate(number) {
    this.data.forEach((eachStep) => {
      if (eachStep['stepnumber'] <= number) {
        eachStep['active'] = true;
      } else {
        eachStep['active'] = false;
      }
    });
  }
  // emitdata(step, i)
}
