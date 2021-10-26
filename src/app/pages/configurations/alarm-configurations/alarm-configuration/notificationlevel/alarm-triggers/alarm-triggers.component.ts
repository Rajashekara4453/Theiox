import { Component, OnInit, Input } from '@angular/core';
import { AppService } from '../../../../../../services/app.service';

@Component({
  selector: 'kl-alarm-triggers',
  templateUrl: './alarm-triggers.component.html',
  styleUrls: ['./alarm-triggers.component.scss']
})
export class AlarmTriggersComponent implements OnInit {
  @Input() commands: Array<any> = [];
  @Input() devices:Array<any> = [];
  @Input() tags:Array<any> = [];
  isExpanded:boolean = true;
  constructor(private appService: AppService) { }

  ngOnInit() {
  }

  deleteCommand(index: number) {
    this.commands.splice(index, 1);
  }

  addCommand(){
    this.commands.splice(0, 0, {
      "device": [],
      "tag": [],
      "value": '',
      "label":null
    });
  }

  toggleExpandCollepseImg() {
    this.isExpanded = !this.isExpanded;
  }

}
