import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'kl-rules',
  templateUrl: './rules.component.html',
  styleUrls: ['./rules.component.scss']
})
export class RulesComponent implements OnInit {
  @Input() rules: Array<any> = [];
  @Input() ruleAndOrOperationData: object = {};
  @Input() tags: Array<any> = [];
  @Input() thresholds: Array<any> = [];
  @Input() category = '';
  isExpanded: boolean = true;
  constructor() { }

  ngOnInit() {
  }

  deleteRule(index: number) {
    this.rules.splice(index, 1);
    if (this.rules.length == 0) this.addNewRule();
  }

  andClicked() {
    this.ruleAndOrOperationData["isAnd"] = true;
    this.ruleAndOrOperationData["isOr"] = false;
  }

  orClicked() {
    this.ruleAndOrOperationData["isOr"] = true;
    this.ruleAndOrOperationData["isAnd"] = false;
  }

  toggleExpandCollepseImg() {
    this.isExpanded = !this.isExpanded;
  }

  addNewRule() {
    this.rules.splice(0, 0, {
      "leftHandSide": {
        "tag": null
      },
      "condition": "",
      "rightHandSide": {
        "compareOption": "customValue",
        "customValue": null,
        "threshold": null,
        "tag": null,
      },
      "resetValue": {
        "isResetValueRequired": false,
        "compareOption": "customValue",
        "customValue": null,
        "tag": null,
        "threshold": null,
        "tolerenceValue": null,
        "pTolerenceValue": null
      }
    });
  }

}
