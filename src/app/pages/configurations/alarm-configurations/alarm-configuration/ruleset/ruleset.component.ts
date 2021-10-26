import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'kl-ruleset',
  templateUrl: './ruleset.component.html',
  styleUrls: ['./ruleset.component.scss']
})
export class RulesetComponent implements OnInit {
  @Input() ruleSets: Array<any> = [];
  @Input() ruleSetAndOrOperationData: object = {};
  @Input() tags: Array<any> = [];
  @Input() thresholds: Array<any> = [];
  @Input() alarmConfig:string = '';
  isExpanded: boolean = true;
  constructor() { }

  ngOnInit() { }

  andClicked() {
    this.ruleSetAndOrOperationData["isAnd"] = true;
    this.ruleSetAndOrOperationData["isOr"] = false;
  }

  orClicked() {
    this.ruleSetAndOrOperationData["isOr"] = true;
    this.ruleSetAndOrOperationData["isAnd"] = false;
  }

  deleteRuleSet(index: number) {
    this.ruleSets.splice(index, 1);
    if (this.ruleSets.length == 0) this.addNewRuleSet();
  }

  toggleExpandCollepseImg() {
    this.isExpanded = !this.isExpanded;
  }

  addNewRuleSet() {
    this.ruleSets.splice(0, 0, {
      "rules": [
        {
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
        }
      ],
      "ruleAndOrOperationData": {
        "isOr": false,
        "isAnd": true
      },
      "priority": ""
    });
  }

}
