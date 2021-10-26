import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  ViewChild
} from '@angular/core';
import {
  FormsModule,
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  NgForm,
  NG_VALIDATORS,
  FormBuilder
} from '@angular/forms';
import { WizardComponent } from '../wizard/wizard.component';
import { ToastrService } from '../toastr/toastr.service';

import { TreeComponent, IActionMapping } from 'angular-tree-component';
import { FileDetector } from 'protractor';

@Component({
  selector: 'kl-dfm',
  templateUrl: './dfm.component.html',
  styleUrls: ['./dfm.component.scss']
})
export class DfmComponent implements OnInit {
  public validateObject: any = {};
  // submitted = false;
  constructor(public _toaster: ToastrService) {
    this.SelectedValues = new EventEmitter<any>();
    this.showFields = new EventEmitter<any>();
    this.nextstep = new EventEmitter<any>();
    this.previousstep = new EventEmitter<any>();
    this.cancel = new EventEmitter<any>();
    this.close = new EventEmitter<any>();
    this.customActions = new EventEmitter<any>();
    this.customActionsSave = new EventEmitter<any>();
    this.viewRenderedFully = new EventEmitter<any>();
    this.customBtnAction = new EventEmitter<any>();
    this.recharge = new EventEmitter<any>();
  }
  @ViewChild('myForm') myForm: NgForm;
  @Input() DFMDATA: any; // Inputs form data from parent component
  @Input() wizardref: WizardComponent;
  @Input() stepnumber: any;
  @Output() previousstep = new EventEmitter();
  @Output() nextstep = new EventEmitter();
  @Output() SelectedValues: EventEmitter<any>; // Emit to Parent Component
  @Output() showFields: EventEmitter<any>; // Emit to Parent Component
  @Output() cancel: EventEmitter<any>; // Emit to Parent Component
  @Output() close: EventEmitter<any>; // Emit to Parent Component
  @Output() customActions: EventEmitter<any>; // Emit to Parent Component
  @Output() customActionsSave: EventEmitter<any>; // Emit to Parent Component

  @Input() disableBtn: any;
  @Output() viewRenderedFully: EventEmitter<any>;
  @Output() customBtnAction: EventEmitter<any>;
  @Output() recharge: EventEmitter<any>;
  @ViewChild(TreeComponent) treesingleselect;
  actionMapping: IActionMapping = {
    mouse: {
      click: (tree, node, e: Event) =>
        this.checkTreeMultiSelect(node, !node.data.checked, e)
    }
  };

  @ViewChild(TreeComponent) treeMultiselect;
  @ViewChild(TreeComponent) treeHierarchy;

  // validateObject = {};
  Form_filled_data: any = {}; // Component ngModel variable
  DFMObject: any = {};
  formDFM: FormGroup; // form validation variable
  public formValidateKeysArray: any = [];
  public formNonValidateKeysArray: any = [];
  DropDownsettings: object = {};
  mainKeys = [];
  date: Date = new Date();
  settings = {
    bigBanner: false,
    timePicker: false,
    format: 'dd-MM-yyyy',
    defaultOpen: false
  };
  settings2 = {
    bigBanner: true,
    timePicker: true,
    format: 'dd-MM-yyyy',
    defaultOpen: false
  };
  showSelect = false;
  showError = false;
  emailRegex = /^([a-zA-Z0-9_\-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([a-zA-Z0-9\-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
  faxRegex = /^\+?[0-9]+$/;
  mobRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
  numberFiledRegExp = /^-?(0|[1-9]\d*)(\.\d+)?(e-?(0|[1-9]\d*))?$/;
  numberValid = false;

  submitTrue = false;

  isDefaultFile: boolean = false;
  imageBaseString: any;
  newFileUploadedPreview: boolean = false;
  checkBox: any = {
    selectAll: false
  };
  TimeFormat: any;
  isTrueSelection = false;
  isTrueCheckBoxSelection = false;
  isRadioButtonSelection = false;
  ngOnInit() {
    const temp_var = {};
    this.Form_filled_data = {};
    // if (this.DFMDATA['selectedRecord'] !== undefined) {
    //   this.updateFileds();
    // } else

    if (this.DFMDATA['bodyContent']) {
      if (Object.keys(this.DFMDATA['bodyContent']).length > 0) {
        this.Form_filled_data = this.DFMDATA['bodyContent'];
        this.checkTheKeys();
        this.updateFileds();
        for (const item of this.DFMDATA['headerContent']) {
          for (const eachItem of item['data']) {
            if (this.Form_filled_data[eachItem.key] === undefined) {
              this.Form_filled_data[eachItem.key] = '';
              if (eachItem.type === 'date') {
                this.Form_filled_data[eachItem.key] =
                  this.date.toISOString().split('.')[0] + 'Z';
              } else if (eachItem.type === 'time') {
                if (
                  eachItem.hasOwnProperty('format') &&
                  eachItem.format !== ''
                ) {
                  if (eachItem.format === 'hh:mm') {
                    this.Form_filled_data[eachItem.key] =
                      ('0' + this.date.getHours()).slice(-2) +
                      ':' +
                      ('0' + this.date.getMinutes()).slice(-2);
                    this.TimeFormat = 0;
                  } else {
                    this.Form_filled_data[eachItem.key] =
                      ('0' + this.date.getHours()).slice(-2) +
                      ':' +
                      ('0' + this.date.getMinutes()).slice(-2) +
                      ':' +
                      ('0' + this.date.getSeconds()).slice(-2);
                    this.TimeFormat = 2;
                  }
                } else {
                  this.Form_filled_data[eachItem.key] =
                    ('0' + this.date.getHours()).slice(-2) +
                    ':' +
                    ('0' + this.date.getMinutes()).slice(-2) +
                    ':' +
                    ('0' + this.date.getSeconds()).slice(-2);
                  this.TimeFormat = 2;
                }
              } else if (eachItem.type === 'checkbox') {
                this.Form_filled_data[eachItem.key] = [];
              } else if (eachItem.type === 'radio') {
                this.Form_filled_data[eachItem.key] = [];
              } else if (eachItem.type === 'treeMultiselect') {
                this.Form_filled_data[eachItem.key] = [];
              } else if (eachItem.type === 'treesingleselect') {
                this.Form_filled_data[eachItem.key] = [];
              } else if (eachItem.type === 'multiselect') {
                this.Form_filled_data[eachItem.key] = [];
              } else if (eachItem.type === 'select') {
                this.Form_filled_data[eachItem.key] = [];
              } else if (eachItem.type === 'file') {
                this.Form_filled_data[eachItem.key] = [];
                //loading default image
                this.loadDefaultImage();
              }
            }
            // Validation using form control
            if (
              eachItem.type !== 'treesingleselect' &&
              eachItem.type !== 'treeMultiselect' &&
              eachItem.type !== 'treeHierarchy' &&
              eachItem.type !== 'tree'
            ) {
              this.activateValidation(
                eachItem.required,
                eachItem.key,
                this.Form_filled_data[eachItem.key]
              );
            }
          }
        }
      } else {
        for (const item of this.DFMDATA['headerContent']) {
          for (const eachItem of item['data']) {
            this.Form_filled_data[eachItem.key] = '';
            if (eachItem.type === 'date') {
              this.Form_filled_data[eachItem.key] =
                this.date.toISOString().split('.')[0] + 'Z';
            } else if (eachItem.type === 'time') {
              if (eachItem.hasOwnProperty('format') && eachItem.format !== '') {
                if (eachItem.format === 'hh:mm') {
                  this.Form_filled_data[eachItem.key] =
                    ('0' + this.date.getHours()).slice(-2) +
                    ':' +
                    ('0' + this.date.getMinutes()).slice(-2);
                  this.TimeFormat = 0;
                } else {
                  this.Form_filled_data[eachItem.key] =
                    ('0' + this.date.getHours()).slice(-2) +
                    ':' +
                    ('0' + this.date.getMinutes()).slice(-2) +
                    ':' +
                    ('0' + this.date.getSeconds()).slice(-2);
                  this.TimeFormat = 2;
                }
              } else {
                this.Form_filled_data[eachItem.key] =
                  ('0' + this.date.getHours()).slice(-2) +
                  ':' +
                  ('0' + this.date.getMinutes()).slice(-2) +
                  ':' +
                  ('0' + this.date.getSeconds()).slice(-2);
                this.TimeFormat = 2;
              }
            } else if (eachItem.type === 'checkbox') {
              this.Form_filled_data[eachItem.key] = [];
            } else if (eachItem.type === 'radio') {
              this.Form_filled_data[eachItem.key] = [];
            } else if (eachItem.type === 'treeMultiselect') {
              this.Form_filled_data[eachItem.key] = [];
            } else if (eachItem.type === 'treesingleselect') {
              this.Form_filled_data[eachItem.key] = [];
            } else if (eachItem.type === 'multiselect') {
              this.Form_filled_data[eachItem.key] = [];
            } else if (eachItem.type === 'select') {
              this.Form_filled_data[eachItem.key] = [];
            } else if (eachItem.type === 'file') {
              this.Form_filled_data[eachItem.key] = [];
              //loading default image
              this.loadDefaultImage();
            }
            // Validation using form control
            if (
              eachItem.type !== 'treesingleselect' &&
              eachItem.type !== 'treeMultiselect' &&
              eachItem.type !== 'treeHierarchy' &&
              eachItem.type !== 'tree'
            ) {
              this.activateValidation(
                eachItem.required,
                eachItem.key,
                this.Form_filled_data[eachItem.key]
              );
            }
          }
        }
      }
    } else {
      for (const item of this.DFMDATA['headerContent']) {
        for (const eachItem of item['data']) {
          this.Form_filled_data[eachItem.key] = '';
          if (eachItem.type === 'date') {
            this.Form_filled_data[eachItem.key] =
              this.date.toISOString().split('.')[0] + 'Z';
          } else if (eachItem.type === 'time') {
            if (eachItem.hasOwnProperty('format') && eachItem.format !== '') {
              if (eachItem.format === 'hh:mm') {
                this.Form_filled_data[eachItem.key] =
                  ('0' + this.date.getHours()).slice(-2) +
                  ':' +
                  ('0' + this.date.getMinutes()).slice(-2);
                this.TimeFormat = 0;
              } else {
                this.Form_filled_data[eachItem.key] =
                  ('0' + this.date.getHours()).slice(-2) +
                  ':' +
                  ('0' + this.date.getMinutes()).slice(-2) +
                  ':' +
                  ('0' + this.date.getSeconds()).slice(-2);
                this.TimeFormat = 2;
              }
            } else {
              this.Form_filled_data[eachItem.key] =
                ('0' + this.date.getHours()).slice(-2) +
                ':' +
                ('0' + this.date.getMinutes()).slice(-2) +
                ':' +
                ('0' + this.date.getSeconds()).slice(-2);
              this.TimeFormat = 2;
            }
          } else if (eachItem.type === 'checkbox') {
            this.Form_filled_data[eachItem.key] = [];
          } else if (eachItem.type === 'radio') {
            this.Form_filled_data[eachItem.key] = [];
          } else if (eachItem.type === 'treeMultiselect') {
            this.Form_filled_data[eachItem.key] = [];
          } else if (eachItem.type === 'treesingleselect') {
            this.Form_filled_data[eachItem.key] = [];
          } else if (eachItem.type === 'multiselect') {
            this.Form_filled_data[eachItem.key] = [];
          } else if (eachItem.type === 'select') {
            this.Form_filled_data[eachItem.key] = [];
          } else if (eachItem.type === 'file') {
            this.Form_filled_data[eachItem.key] = [];
            // loading default image
            this.loadDefaultImage();
          }
          // if (eachItem.required === true) {
          //   this.formValidateKeysArray.push(eachItem.key);
          // } else if (eachItem.required === false) {
          //   this.formNonValidateKeysArray.push(eachItem.key);
          // } else {
          //   this.formNonValidateKeysArray.push(eachItem.key);
          // }

          // Validation using form control
          if (
            eachItem.type !== 'treesingleselect' &&
            eachItem.type !== 'treeMultiselect' &&
            eachItem.type !== 'treeHierarchy' &&
            eachItem.type !== 'tree'
          ) {
            this.activateValidation(
              eachItem.required,
              eachItem.key,
              this.Form_filled_data[eachItem.key]
            );
          }
        }
      }
    }
    // making a form group
    this.formDFM = new FormGroup(this.validateObject);
  }
  /**
   * @param required boolean value whether a field is required or not
   * @param datatype data type of the field to apply validation
   * @param key Data to store key
   * @param fieldtype field type used to ignore validation even if some fields are required
   */
  activateValidation(required, key, dataType) {
    if (required) {
      this.validateObject[key] = new FormControl(dataType, Validators.required);
    } else {
      this.validateObject[key] = new FormControl(
        dataType,
        Validators.nullValidator
      ); // Null validator for non-mandatory fields
    }
    // for (let ind = 0; ind < this.formValidateKeysArray.length; ind++) {
    //   if (this.formValidateKeysArray[ind] === 'data1') {
    //     validateObject[this.formValidateKeysArray[ind]] = new FormControl([], Validators.required);
    //   } else {
    //     validateObject[this.formValidateKeysArray[ind]] = new FormControl('', Validators.required);
    //   }
    // }
    // for (let ind = 0; ind < this.formNonValidateKeysArray.length; ind++) {
    //   validateObject[this.formNonValidateKeysArray[ind]] = new FormControl('', Validators.nullValidator);
    // }
    // this.formDFM = new FormGroup(this.validateObject);
  }
  ngAfterViewInit() {
    // debugger
    this.viewRenderedFully.emit();
    // this.tree.treeModel.expandAll();
  }
  fieldNumberValidationMethod(body, type, value, event) {
    if (value === null && event.target.value === '') {
      if (event.data === null) {
        this.numberValid = false;
        this.recharge.emit({ body: body, value: value });
      } else {
        this.numberValid = true;
      }
    } else {
      if (event.target.value !== '') {
        if (!this.numberFiledRegExp.test(String(value).toLowerCase())) {
          this.numberValid = true;
        } else {
          this.numberValid = false;
          this.recharge.emit({ body: body, value: value });
        }
      } else {
        this.numberValid = false;
      }
    }
    // this.numberValid = true;
  }
  onHide(body, type, value) {
    if (value === null) {
      this.numberValid = false;
    }
  }

  fieldValidationMethod(body, key, value) {
    if (key === 'emailId') {
      if (!this.emailRegex.test(String(value).toLowerCase())) {
        body['error'] = true;
      } else {
        body['error'] = false;
      }
    }
    if (key === 'email') {
      if (!this.emailRegex.test(String(value).toLowerCase())) {
        body['error'] = true;
      } else {
        body['error'] = false;
      }
    } else if (key === 'refPerEmail') {
      if (!this.emailRegex.test(String(value).toLowerCase())) {
        body['error'] = true;
      } else {
        body['error'] = false;
      }
    } else if (key === 'fax') {
      if (!this.faxRegex.test(String(value).toLowerCase())) {
        body['error'] = true;
      } else {
        body['error'] = false;
      }
    } else if (key === 'refPerMobileNo') {
      if (!this.mobRegex.test(String(value).toLowerCase())) {
        body['error'] = true;
      } else {
        body['error'] = false;
      }
    } else if (key === 'mobileNumber' || key === 'phone') {
      if (!this.mobRegex.test(String(value).toLowerCase())) {
        body['error'] = true;
      } else {
        body['error'] = false;
      }
    }
  }
  updateFileds() {
    if (Object.keys(this.DFMDATA['bodyContent']).length > 0) {
      for (const item of this.DFMDATA['headerContent']) {
        for (const eachItem of item['data']) {
          if (eachItem.type === 'treesingleselect') {
            this.checkNodesofATree(
              eachItem.nodeData,
              this.DFMDATA['bodyContent'][eachItem.key]
            );
          } else if (eachItem.type === 'treeMultiselect') {
            this.checkNodesofATree(
              eachItem.nodeData,
              this.DFMDATA['bodyContent'][eachItem.key]
            );
          } else if (eachItem.type === 'tree') {
            // console.log(this.DFMDATA['bodyContent'][eachItem.key]);
            this.buildUserTree(
              eachItem.nodeData,
              this.DFMDATA['bodyContent'][eachItem.key]
            );
          }
          // else if (eachItem.type === 'checkbox') {
          //   // IsSelected
          //   for (let ind = 0; ind < eachItem.options.length; ind++) {
          //     for (
          //       let jind = 0;
          //       jind < this.DFMDATA['bodyContent'][eachItem.key].length;
          //       jind++
          //     ) {
          //       if (
          //         eachItem.options[ind].value ===
          //         this.DFMDATA['bodyContent'][eachItem.key][jind]
          //       ) {
          //         eachItem.options[ind]['IsSelected'] = true;
          //       }
          //     }
          //   }
          // }
        }
      }
    } else {
      this.Form_filled_data = this.DFMDATA['bodyContent'];
    }
  }
  dynamicDropDownInfo(inputObject, dependentKey) {
    const currentView = this;
    if (typeof this.Form_filled_data[dependentKey] !== 'undefined') {
      return inputObject['dependent_options'][
        this.Form_filled_data[dependentKey]
      ];
    } else {
      return [];
    }
  }
  onDateSelect(event, key) {
    const dateString = event.toISOString().split('.')[0] + 'Z';

    this.Form_filled_data[key] = dateString;
  }
  multiselectFunc(data, key) {
    this.Form_filled_data[key] = data;
  }
  OnSelectChange(data, key) {
    const selectedValue = data.value;
    this.isTrueSelection = false;
    this.Form_filled_data[key] = selectedValue;
    this.DFMDATA['bodyContent'] = this.Form_filled_data;
    // check and remove the sections
    for (let i = this.DFMDATA['headerContent'].length; i--; ) {
      if (this.DFMDATA['headerContent'][i].keyType === key) {
        for (let j = this.DFMDATA['headerContent'][i]['data'].length; j--; ) {
          const obj = this.DFMDATA['headerContent'][i]['data'][j].key;
          delete this.DFMDATA['bodyContent'][obj];
        }
        this.DFMDATA['headerContent'].splice(i, 1);
      }
    }
    // //check and remove the Data Section for perticualr sections
    for (let i = this.DFMDATA['headerContent'].length; i--; ) {
      for (let j = this.DFMDATA['headerContent'][i]['data'].length; j--; ) {
        const obj = this.DFMDATA['headerContent'][i]['data'][j];
        if (obj.hasOwnProperty('keyType')) {
          if (this.DFMDATA['headerContent'][i]['data'][j].keyType === key) {
            const objRef = this.DFMDATA['headerContent'][i]['data'][j].key;
            delete this.DFMDATA['bodyContent'][objRef];
            this.DFMDATA['headerContent'][i]['data'].splice(j, 1);
          }
        }
      }
    }
    for (const item of this.DFMDATA['headerContent']) {
      for (const eachItem of item['data']) {
        if (eachItem.key === key) {
          // Disable Enable functionality
          if (eachItem.hasOwnProperty('disableEnableFields')) {
            if (Object.keys(eachItem.disableEnableFields).length != 0) {
              if (eachItem.disableEnableFields[selectedValue]) {
                for (
                  let x = 0;
                  x < eachItem.disableEnableFields[selectedValue].length;
                  x++
                ) {
                  for (
                    let y = 0;
                    y < this.DFMDATA['headerContent'].length;
                    y++
                  ) {
                    for (
                      let z = 0;
                      z < this.DFMDATA['headerContent'][y].data.length;
                      z++
                    ) {
                      if (
                        eachItem.disableEnableFields[selectedValue][x].key ===
                        this.DFMDATA['headerContent'][y].data[z].key
                      ) {
                        this.DFMDATA['headerContent'][y].data[z].disabled =
                          eachItem.disableEnableFields[selectedValue][
                            x
                          ].disabled;
                        break;
                      }
                    }
                  }
                }
              }
            }
          }
          if (eachItem.hasOwnProperty('setValuesToFeilds')) {
            // value change functionality
            if (Object.keys(eachItem.setValuesToFeilds).length != 0) {
              this.DFMDATA['bodyContent'] = {
                ...this.DFMDATA['bodyContent'],
                ...eachItem.setValuesToFeilds[selectedValue]
              };
              this.Form_filled_data = this.DFMDATA['bodyContent'];
            }
          }
          if (eachItem.hasOwnProperty('dynamicFields')) {
            if (eachItem.dynamicFields.length > 0) {
              for (let i = 0; i < eachItem.dynamicFields.length; i++) {
                if (eachItem.dynamicFields[i].value === selectedValue) {
                  //for inserting items in to the perticular section
                  if (
                    eachItem.dynamicFields[i].hasOwnProperty('fields') &&
                    eachItem.dynamicFields[i].fields.length > 0
                  ) {
                    const fields = eachItem.dynamicFields[i].fields;
                    for (let j = 0; j < fields.length; j++) {
                      for (
                        let k = 0;
                        k < this.DFMDATA['headerContent'].length;
                        k++
                      ) {
                        if (
                          fields[j].sectionNumber ===
                          this.DFMDATA['headerContent'][k].sectionNumber
                        ) {
                          this.DFMDATA['headerContent'][k].data.push(
                            ...fields[j].data
                          );
                          this.DFMDATA['bodyContent'] = {
                            ...this.DFMDATA['bodyContent'],
                            ...fields[j].bodyContent
                          };
                          break;
                        }
                      }
                    }
                  }
                  //for inserting separtate sections
                  if (
                    eachItem.dynamicFields[i].hasOwnProperty('sections') &&
                    Object.keys(eachItem.dynamicFields[i].sections).length != 0
                  ) {
                    this.DFMDATA['headerContent'].push(
                      ...eachItem.dynamicFields[i].sections.headerContent
                    );
                    const value = eachItem.dynamicFields[i].sections;
                    this.DFMDATA['bodyContent'] = {
                      ...this.DFMDATA['bodyContent'],
                      ...value.bodyContent
                    };
                  }
                  this.Form_filled_data = this.DFMDATA['bodyContent'];
                  this.isTrueSelection = true;
                  break;
                }
              }
            }
            break;
          }
        }
      }
    }
    if (this.isTrueSelection) {
      this.onChangeSelection();
    }
  }
  onChangeSelection() {
    if (this.DFMDATA['bodyContent']) {
      if (Object.keys(this.DFMDATA['bodyContent']).length > 0) {
        // this.Form_filled_data = this.DFMDATA['bodyContent'];
        // this.checkTheKeys();
        this.updateFileds();
        for (const item of this.DFMDATA['headerContent']) {
          for (const eachItem of item['data']) {
            if (this.Form_filled_data[eachItem.key] === undefined) {
              this.Form_filled_data[eachItem.key] = '';
              if (eachItem.type === 'date') {
                this.Form_filled_data[eachItem.key] =
                  this.date.toISOString().split('.')[0] + 'Z';
              } else if (eachItem.type === 'time') {
                if (
                  eachItem.hasOwnProperty('format') &&
                  eachItem.format !== ''
                ) {
                  if (eachItem.format === 'hh:mm') {
                    this.Form_filled_data[eachItem.key] =
                      ('0' + this.date.getHours()).slice(-2) +
                      ':' +
                      ('0' + this.date.getMinutes()).slice(-2);
                    this.TimeFormat = 0;
                  } else {
                    this.Form_filled_data[eachItem.key] =
                      ('0' + this.date.getHours()).slice(-2) +
                      ':' +
                      ('0' + this.date.getMinutes()).slice(-2) +
                      ':' +
                      ('0' + this.date.getSeconds()).slice(-2);
                    this.TimeFormat = 2;
                  }
                } else {
                  this.Form_filled_data[eachItem.key] =
                    ('0' + this.date.getHours()).slice(-2) +
                    ':' +
                    ('0' + this.date.getMinutes()).slice(-2) +
                    ':' +
                    ('0' + this.date.getSeconds()).slice(-2);
                  this.TimeFormat = 2;
                }
              } else if (eachItem.type === 'checkbox') {
                this.Form_filled_data[eachItem.key] = [];
              } else if (eachItem.type === 'radio') {
                this.Form_filled_data[eachItem.key] = [];
              } else if (eachItem.type === 'treeMultiselect') {
                this.Form_filled_data[eachItem.key] = [];
              } else if (eachItem.type === 'treesingleselect') {
                this.Form_filled_data[eachItem.key] = [];
              } else if (eachItem.type === 'multiselect') {
                this.Form_filled_data[eachItem.key] = [];
              } else if (eachItem.type === 'select') {
                this.Form_filled_data[eachItem.key] = [];
              } else if (eachItem.type === 'file') {
                this.Form_filled_data[eachItem.key] = [];
                //loading default image
                this.loadDefaultImage();
              }
            }
            // Validation using form control
            if (
              eachItem.type !== 'treesingleselect' &&
              eachItem.type !== 'treeMultiselect' &&
              eachItem.type !== 'treeHierarchy' &&
              eachItem.type !== 'tree' &&
              eachItem.type !== 'checkbox'
            ) {
              this.activateValidation(
                eachItem.required,
                eachItem.key,
                this.Form_filled_data[eachItem.key]
              );
            }
          }
        }
      } else {
        for (const item of this.DFMDATA['headerContent']) {
          for (const eachItem of item['data']) {
            if (this.Form_filled_data[eachItem.key] === undefined) {
              this.Form_filled_data[eachItem.key] = '';
              if (eachItem.type === 'date') {
                this.Form_filled_data[eachItem.key] =
                  this.date.toISOString().split('.')[0] + 'Z';
              } else if (eachItem.type === 'time') {
                if (
                  eachItem.hasOwnProperty('format') &&
                  eachItem.format !== ''
                ) {
                  if (eachItem.format === 'hh:mm') {
                    this.Form_filled_data[eachItem.key] =
                      ('0' + this.date.getHours()).slice(-2) +
                      ':' +
                      ('0' + this.date.getMinutes()).slice(-2);
                    this.TimeFormat = 0;
                  } else {
                    this.Form_filled_data[eachItem.key] =
                      ('0' + this.date.getHours()).slice(-2) +
                      ':' +
                      ('0' + this.date.getMinutes()).slice(-2) +
                      ':' +
                      ('0' + this.date.getSeconds()).slice(-2);
                    this.TimeFormat = 2;
                  }
                } else {
                  this.Form_filled_data[eachItem.key] =
                    ('0' + this.date.getHours()).slice(-2) +
                    ':' +
                    ('0' + this.date.getMinutes()).slice(-2) +
                    ':' +
                    ('0' + this.date.getSeconds()).slice(-2);
                  this.TimeFormat = 2;
                }
              } else if (eachItem.type === 'checkbox') {
                this.Form_filled_data[eachItem.key] = [];
              } else if (eachItem.type === 'radio') {
                this.Form_filled_data[eachItem.key] = [];
              } else if (eachItem.type === 'treeMultiselect') {
                this.Form_filled_data[eachItem.key] = [];
              } else if (eachItem.type === 'treesingleselect') {
                this.Form_filled_data[eachItem.key] = [];
              } else if (eachItem.type === 'multiselect') {
                this.Form_filled_data[eachItem.key] = [];
              } else if (eachItem.type === 'select') {
                this.Form_filled_data[eachItem.key] = [];
              } else if (eachItem.type === 'file') {
                this.Form_filled_data[eachItem.key] = [];
                //loading default image
                this.loadDefaultImage();
              }
            }
            // Validation using form control
            if (
              eachItem.type !== 'treesingleselect' &&
              eachItem.type !== 'treeMultiselect' &&
              eachItem.type !== 'treeHierarchy' &&
              eachItem.type !== 'tree' &&
              eachItem.type !== 'checkbox'
            ) {
              this.activateValidation(
                eachItem.required,
                eachItem.key,
                this.Form_filled_data[eachItem.key]
              );
            }
          }
        }
      }
    } else {
      for (const item of this.DFMDATA['headerContent']) {
        for (const eachItem of item['data']) {
          if (this.Form_filled_data[eachItem.key] === undefined) {
            this.Form_filled_data[eachItem.key] = '';
            if (eachItem.type === 'date') {
              this.Form_filled_data[eachItem.key] =
                this.date.toISOString().split('.')[0] + 'Z';
            } else if (eachItem.type === 'time') {
              if (eachItem.hasOwnProperty('format') && eachItem.format !== '') {
                if (eachItem.format === 'hh:mm') {
                  this.Form_filled_data[eachItem.key] =
                    ('0' + this.date.getHours()).slice(-2) +
                    ':' +
                    ('0' + this.date.getMinutes()).slice(-2);
                  this.TimeFormat = 0;
                } else {
                  this.Form_filled_data[eachItem.key] =
                    ('0' + this.date.getHours()).slice(-2) +
                    ':' +
                    ('0' + this.date.getMinutes()).slice(-2) +
                    ':' +
                    ('0' + this.date.getSeconds()).slice(-2);
                  this.TimeFormat = 2;
                }
              } else {
                this.Form_filled_data[eachItem.key] =
                  ('0' + this.date.getHours()).slice(-2) +
                  ':' +
                  ('0' + this.date.getMinutes()).slice(-2) +
                  ':' +
                  ('0' + this.date.getSeconds()).slice(-2);
                this.TimeFormat = 2;
              }
            } else if (eachItem.type === 'checkbox') {
              this.Form_filled_data[eachItem.key] = [];
            } else if (eachItem.type === 'radio') {
              this.Form_filled_data[eachItem.key] = [];
            } else if (eachItem.type === 'treeMultiselect') {
              this.Form_filled_data[eachItem.key] = [];
            } else if (eachItem.type === 'treesingleselect') {
              this.Form_filled_data[eachItem.key] = [];
            } else if (eachItem.type === 'multiselect') {
              this.Form_filled_data[eachItem.key] = [];
            } else if (eachItem.type === 'select') {
              this.Form_filled_data[eachItem.key] = [];
            } else if (eachItem.type === 'file') {
              this.Form_filled_data[eachItem.key] = [];
              // loading default image
              this.loadDefaultImage();
            }
          }
          // if (eachItem.required === true) {
          //   this.formValidateKeysArray.push(eachItem.key);
          // } else if (eachItem.required === false) {
          //   this.formNonValidateKeysArray.push(eachItem.key);
          // } else {
          //   this.formNonValidateKeysArray.push(eachItem.key);
          // }

          // Validation using form control
          if (
            eachItem.type !== 'treesingleselect' &&
            eachItem.type !== 'treeMultiselect' &&
            eachItem.type !== 'treeHierarchy' &&
            eachItem.type !== 'tree' &&
            eachItem.type !== 'checkbox'
          ) {
            this.activateValidation(
              eachItem.required,
              eachItem.key,
              this.Form_filled_data[eachItem.key]
            );
          }
        }
      }
    }
    // making a form group
    this.formDFM = new FormGroup(this.validateObject);
  }

  cancelOperation() {
    this.Form_filled_data = {};
    const currentVw = this;
    // tslint:disable-next-line:ter-prefer-arrow-callback
    setTimeout(function () {
      currentVw.showFields.emit('new');
    }, 500);
  }

  // Temprorily commented - varsha
  //  customBtn(event){
  //   this.customBtnAction.emit(event);
  // }
  // // =================================================== CheckBox code ================================
  checkboxUpdate(key, value, CheckBox, optionsList) {
    if (typeof this.Form_filled_data[key] === 'undefined') {
      this.Form_filled_data[key] = [];
    }
    if (CheckBox.IsSelected) {
      if (!this.Form_filled_data[key].includes(value)) {
        this.Form_filled_data[key].push(value);
      }
      if (this.Form_filled_data[key].length === optionsList.length) {
        this.checkBox['selectAll'] = true;
      }
    } else if (!CheckBox.IsSelected) {
      let index = 0;
      for (let i = 0; i < this.Form_filled_data[key].length; i++) {
        if (this.Form_filled_data[key][i] === value) {
          index = i;
          break;
        }
      }
      this.Form_filled_data[key].splice(index, 1);
      if (
        this.checkBox['selectAll'] &&
        this.Form_filled_data[key].length < optionsList.length
      ) {
        this.checkBox.selectAll = false;
      }
    }
    // Check box dynamicFeilds code
    this.DynamicFieldCalcualtions(key, value, CheckBox.IsSelected);
  }

  selectAllCheckboxOptions(event, options, key) {
    this.checkBox['selectAll'] = event;
    this.Form_filled_data[key] = [];
    for (let i = 0; i < options.length; i++) {
      const element = options[i];
      element['IsSelected'] = event;
      this.Form_filled_data[key].push(element['value']);
    }
  }

  // ========================================= radio Group Code =============================================

  radioFieldUpdate(key, value, RadioButton) {
    // console.log(key + " - " + value);
    this.Form_filled_data[key] = value;
    // Radion button dynamicFeilds code
    this.DynamicFieldCalcualtions(key, value, RadioButton.IsSelected);
  }

  // ========================================= upload image Code =============================================

  loadDefaultImage() {
    this.isDefaultFile = true;
  }

  uploadFile(event, key) {
    // switch (key) {
    //   case 'imageFile':
    if (event.target.files[0].size > 1000000) {
      this._toaster.toast(
        'warning',
        'Warning',
        'Image size must be less than 1 MB. Try another.',
        true
      );
      // alert("File is too big!");
    } else {
      const file = event.target.files[0];
      // this.formDFM.controls[key].setValue(file ? file.name : '');
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.isDefaultFile = false;
        this.newFileUploadedPreview = true;
        this.imageBaseString = reader.result;
        this.Form_filled_data[key] = this.imageBaseString;
      };
    }
    //   break;

    // default:
    //   break;
    //}
  }

  displayImage(imageFile) {
    if (imageFile !== '') {
      this.isDefaultFile = false;
      this.imageBaseString = imageFile;
    } else {
      this.isDefaultFile = true;
    }
  }

  // =========================================== Tree Functions ===============================================
  /**
   *  if Tree type === treesingleselect
   * @param node Selected Node Data
   * @param checked Status of Checked
   * @param key Data to store key
   */
  public checkSingleSelectTree(node, checked, key) {
    this.Form_filled_data[key] = [
      {
        parent_id: this.returnParentId(node),
        node_id: node.data.node_id
      }
    ];
    this.unCheckAllNodes(node.treeModel.nodes);
    if (checked) {
      node.data['isChecked'] = true;
    } else {
      this.Form_filled_data[key] = [];
    }
    // this.Form_filled_data[saveKey] = this.tree.treeModel.nodes; // to save the entire tree

    this.treesingleselect.treeModel.update();
  }

  /**
   *  if Tree type === treesingleselect
   * @param node Selected Node Data
   * @param checked Status of Checked
   * @param key Data to store key
   */
  public checkTreeMultiSelect(node, checked, key) {
    if (checked) {
      this.Form_filled_data[key].push({
        parent_id: this.returnParentId(node),
        node_id: node.data.node_id
      });
    } else {
      for (let ind = 0; ind < this.Form_filled_data[key].length; ind++) {
        if (this.Form_filled_data[key][ind].node_id === node.data.node_id) {
          this.Form_filled_data[key].splice(ind, 1);
        }
      }
    }
    node.data['isChecked'] = checked;
  }

  /**
   * Recursive function to CLear tree from Selection
   * @param node Parent Nodes of tree
   */
  unCheckAllNodes(node) {
    for (let ind = 0; ind < node.length; ind++) {
      if (node[ind].isChecked) {
        node[ind].isChecked = false;
      }
      if (node[ind].children) {
        this.unCheckAllNodes(node[ind].children);
      }
    }
  }

  /**
   * REcersive function to auto populate the Selected nodes
   * @param node Node list
   * @param selectedNodes Selected node_id
   */
  checkNodesofATree(node, selectedNodes) {
    if (selectedNodes != undefined) {
      for (let ind = 0; ind < node.length; ind++) {
        for (let jind = 0; jind < selectedNodes.length; jind++) {
          if (
            selectedNodes[jind] &&
            node[ind].node_id === selectedNodes[jind].node_id
          ) {
            node[ind].isChecked = true;
          }
        }
        if (node[ind].children) {
          this.checkNodesofATree(node[ind].children, selectedNodes);
        }
      }
    }
  }

  /**
   * ParentId to return the data
   * @param node Node data that needs to return its parent data
   */
  returnParentId(node) {
    let new_node = node;
    while (!new_node.data.parent_id) {
      new_node = new_node.parent;
    }
    return new_node.data.parent_id;
  }

  // ** *************Tree - varsha******************* */

  /** Tree that -  
                Selects all the child, if a parent is selected.
                DOES NOT select the parent if all the child nodes are selected individually.
  */

  // Method to keep Tree Expand by default
  onInitialized(tree: any) {
    setTimeout(() => {
      tree.treeModel.expandAll();
    });
  }

  // Methods invoked on tree nodes selection
  public check(node, checked, key, e) {
    e.stopPropagation();
    // e.preventDefault();
    this.updateChildNodeCheckbox(node, checked);
    this.updateParentNodeCheckbox(node.realParent);
    const selectedNodesTree = node.treeModel.nodes;
    const selectedNodes = this.extractUserTreeNodes(selectedNodesTree);
    // console.log(selectedNodes);
    this.Form_filled_data[key] = selectedNodes;
    // console.log(this.Form_filled_data[key]);
  }

  public updateChildNodeCheckbox(node, checked) {
    node.data.checked = checked;
    if (node.children) {
      node.children.forEach((child) => {
        return this.updateChildNodeCheckbox(child, checked);
      });
    }
  }

  public updateParentNodeCheckbox(node) {
    if (!node) {
      return;
    }
    if (node.data.node_id != undefined) {
      const parentId = node.data.node_id;
    }
    let allChildrenChecked = true;
    let noChildChecked = true;
    for (const child of node.children) {
      if (!child.data.checked || child.data.indeterminate) {
        allChildrenChecked = false;
      }
      if (child.data.checked) {
        noChildChecked = false;
      }
    }
    if (allChildrenChecked) {
      node.data.checked = false;
      node.data.indeterminate = false;
    } else if (noChildChecked) {
      node.data.checked = false;
      node.data.indeterminate = false;
    } else {
      node.data.checked = false;
      node.data.indeterminate = false;
    }
    this.updateParentNodeCheckbox(node.parent);
  }

  // Methods to fetch selected node's parent_id and node_id

  extractUserTreeNodes(allTreeNodes) {
    const selectedNodes = [];
    let hierarchy: any;
    let parent_id: string;
    allTreeNodes.forEach((eachTreeNode) => {
      parent_id = eachTreeNode.node_id;
      hierarchy = this.getSelectedNodes(
        eachTreeNode,
        'checked',
        parent_id,
        selectedNodes
      );
    });
    return hierarchy;
  }

  getSelectedNodes(
    currentNode,
    InkeyToFind: any,
    parent_id: string,
    selectedNodes: any
  ) {
    if (currentNode[InkeyToFind] === true) {
      selectedNodes.push({
        node_id: currentNode.node_id,
        parent_id: parent_id
      });
      for (const index in currentNode.children) {
        const node = currentNode.children[index];
        this.getSelectedNodes(node, InkeyToFind, parent_id, selectedNodes);
      }
    } else {
      for (const index in currentNode.children) {
        const node = currentNode.children[index];
        this.getSelectedNodes(node, InkeyToFind, parent_id, selectedNodes);
      }
    }
    return selectedNodes;
  }

  /** On Edit display the selected nodes*/

  // Fetch saved node_id's from DB and send it to merge with original Tree to build a tree.
  buildUserTree(originalTree: any, userTree: any) {
    if (userTree != undefined) {
      let selectedNodes: any;
      userTree.forEach((nodeObject) => {
        for (let i = 0; i < originalTree.length; i++) {
          const treeRootNode = originalTree[i];
          if (nodeObject.parent_id === treeRootNode.node_id) {
            const nodeFound = this.updateNodeInformation(
              nodeObject.node_id,
              treeRootNode,
              'node_id'
            );

            if (nodeFound === '') {
              // this.sitesHeirarchy = this.originalTree;
              selectedNodes = originalTree;
            }
          }
        }
      });
      return selectedNodes;
    }
  }

  // Merging user's node_id's with original tree and return user's own tree
  updateNodeInformation(
    valueTobeSearched: any,
    currentNode: any,
    InkeyToFind: any
  ) {
    if (valueTobeSearched === currentNode[InkeyToFind]) {
      currentNode['checked'] = true;
    } else {
      // tslint:disable-next-line: forin
      for (const index in currentNode.children) {
        const node = currentNode.children[index];
        this.updateNodeInformation(valueTobeSearched, node, InkeyToFind);
      }
      return '';
    }
  }

  // ** *************Tree - varsha - ends******************* */

  // =========================================== Button Emitting Functions ==================================
  submitData() {
    // this.submitted = true;
    // Function returns if form is invalid

    // if (this.formDFM.invalid) {
    //   this._toaster.toast('warning', 'Validation', 'Please enter the Required Fields', true);
    //   return;
    // }
    this.submitTrue = true;
    for (const item of this.DFMDATA.headerContent) {
      for (const eachItem of item['data']) {
        if (eachItem.required) {
          if (
            eachItem.type === 'treesingleselect' ||
            eachItem.type === 'treeMultiselect' ||
            eachItem.type === 'tree' ||
            eachItem.type === 'checkbox' ||
            eachItem.type === 'radio' ||
            eachItem.type === 'file' ||
            eachItem.type === 'multiselect' ||
            eachItem.type === 'select'
          ) {
            if (this.Form_filled_data[eachItem.key].length === 0) {
              this.submitTrue = false;
            }
          } else {
            if (
              this.Form_filled_data[eachItem.key] === '' ||
              this.Form_filled_data[eachItem.key] === undefined ||
              this.Form_filled_data[eachItem.key] === null
            ) {
              this.submitTrue = false;
            }
          }
        }
      }
      // if (item.error === true) {
      //   this.submitTrue = false;
      //   return;
      // } else {
      //   this.submitTrue = true;
      // }
    }
    if (this.submitTrue) {
      this.SelectedValues.emit(this.Form_filled_data);
    } else {
      // alert('please enter valid data');
      this._toaster.toast(
        'warning',
        'Validation',
        'Please enter the Required Fields',
        true
      );
    }
  }

  cancelForm() {
    this.cancel.emit();
    this.loadDefaultImage();
  }
  closeForm() {
    this.close.emit();
    // this.loadDefaultImage();
  }
  // function to get form controls to check in html
  get f() {
    return this.formDFM.controls;
  }

  // ===================================== Stepper Functions =========================
  stepprevious() {
    this.stepnumber = this.stepnumber - 1;
    this.previousstep.emit(this.stepnumber);
  }
  stepnext() {
    this.stepnumber = this.stepnumber + 1;
    this.nextstep.emit(this.stepnumber);
    // this.wizardref.onclick();
  }
  custtomButtonGroup(customAction) {
    if (customAction.hasOwnProperty('isSave')) {
      if (customAction.isSave) {
        this.submitCustomSaveData(customAction);
      } else {
        this.customActions.emit(customAction);
      }
    } else {
      this.customActions.emit(customAction);
    }
  }

  submitCustomSaveData(customAction) {
    // this.submitted = true;
    this.submitTrue = true;
    for (const item of this.DFMDATA.headerContent) {
      for (const eachItem of item['data']) {
        if (eachItem.required) {
          if (
            eachItem.type === 'treesingleselect' ||
            eachItem.type === 'treeMultiselect' ||
            eachItem.type === 'tree' ||
            eachItem.type === 'checkbox' ||
            eachItem.type === 'radio' ||
            eachItem.type === 'file' ||
            eachItem.type === 'multiselect' ||
            eachItem.type === 'select'
          ) {
            if (this.Form_filled_data[eachItem.key].length === 0) {
              this.submitTrue = false;
            }
          } else {
            if (
              this.Form_filled_data[eachItem.key] === '' ||
              this.Form_filled_data[eachItem.key] === undefined ||
              this.Form_filled_data[eachItem.key] === null
            ) {
              this.submitTrue = false;
            }
          }
        }
      }
    }
    if (this.submitTrue) {
      this.customActionsSave.emit({
        formData: this.Form_filled_data,
        customAction: customAction
      });
    } else {
      this._toaster.toast(
        'warning',
        'Validation',
        'Please enter the Required Fields',
        true
      );
    }
  }
  DynamicFieldCalcualtions(key, value, condition) {
    if (condition) {
      if (!this.Form_filled_data[key].includes(value)) {
        this.Form_filled_data[key].push(value);
      }
      this.DFMDATA['bodyContent'] = this.Form_filled_data;
      for (const item of this.DFMDATA['headerContent']) {
        for (const eachItem of item['data']) {
          if (eachItem.key === key) {
            if (eachItem.hasOwnProperty('disableEnableFields')) {
              if (eachItem.disableEnableFields.length > 0) {
                for (let x = 0; x < eachItem.disableEnableFields.length; x++) {
                  for (
                    let y = 0;
                    y < this.DFMDATA['headerContent'].length;
                    y++
                  ) {
                    for (
                      let z = 0;
                      z < this.DFMDATA['headerContent'][y].data.length;
                      z++
                    ) {
                      if (
                        eachItem.disableEnableFields[x].key ===
                        this.DFMDATA['headerContent'][y].data[z].key
                      ) {
                        this.DFMDATA['headerContent'][y].data[z].disabled =
                          eachItem.disableEnableFields[x].disabled;
                        break;
                      }
                    }
                  }
                }
              }
            }
            // value change functionality
            if (eachItem.hasOwnProperty('setValuesToFeilds')) {
              if (Object.keys(eachItem.setValuesToFeilds).length != 0) {
                this.DFMDATA['bodyContent'] = {
                  ...this.DFMDATA['bodyContent'],
                  ...eachItem.setValuesToFeilds
                };
                this.Form_filled_data = this.DFMDATA['bodyContent'];
              }
            }
            if (eachItem.hasOwnProperty('dynamicFields')) {
              if (eachItem.dynamicFields.length > 0) {
                for (let i = 0; i < eachItem.dynamicFields.length; i++) {
                  if (
                    eachItem.dynamicFields[i].hasOwnProperty('fields') &&
                    eachItem.dynamicFields[i].fields.length > 0
                  ) {
                    const fields = eachItem.dynamicFields[i].fields;
                    for (let j = 0; j < fields.length; j++) {
                      for (
                        let k = 0;
                        k < this.DFMDATA['headerContent'].length;
                        k++
                      ) {
                        if (
                          fields[j].sectionNumber ===
                          this.DFMDATA['headerContent'][k].sectionNumber
                        ) {
                          this.DFMDATA['headerContent'][k].data.push(
                            ...fields[j].data
                          );
                          this.DFMDATA['bodyContent'] = {
                            ...this.DFMDATA['bodyContent'],
                            ...fields[j].bodyContent
                          };
                          break;
                        }
                      }
                    }
                  }
                  //for inserting separtate sections
                  if (
                    eachItem.dynamicFields[i].hasOwnProperty('sections') &&
                    Object.keys(eachItem.dynamicFields[i].sections).length != 0
                  ) {
                    this.DFMDATA['headerContent'].push(
                      ...eachItem.dynamicFields[i].sections.headerContent
                    );
                    const value = eachItem.dynamicFields[i].sections;
                    this.DFMDATA['bodyContent'] = {
                      ...this.DFMDATA['bodyContent'],
                      ...value.bodyContent
                    };
                  }
                  this.Form_filled_data = this.DFMDATA['bodyContent'];
                  this.isTrueCheckBoxSelection = true;
                  break;
                }
              }
              break;
            }
          }
        }
      }
      this.onChangeSelection();
    }
    // check and remove the sections
    if (!condition) {
      for (let i = this.DFMDATA['headerContent'].length; i--; ) {
        if (this.DFMDATA['headerContent'][i].keyType === key) {
          for (let j = this.DFMDATA['headerContent'][i]['data'].length; j--; ) {
            const obj = this.DFMDATA['headerContent'][i]['data'][j].key;
            delete this.DFMDATA['bodyContent'][obj];
          }
          this.DFMDATA['headerContent'].splice(i, 1);
        }
      }
      // //check and remove the Data Section for perticualr sections
      for (let i = this.DFMDATA['headerContent'].length; i--; ) {
        for (let j = this.DFMDATA['headerContent'][i]['data'].length; j--; ) {
          const obj = this.DFMDATA['headerContent'][i]['data'][j];
          if (obj.hasOwnProperty('keyType')) {
            if (this.DFMDATA['headerContent'][i]['data'][j].keyType === key) {
              const objRef = this.DFMDATA['headerContent'][i]['data'][j].key;
              delete this.DFMDATA['bodyContent'][objRef];
              this.DFMDATA['headerContent'][i]['data'].splice(j, 1);
            }
          }
        }
      }
      for (const item of this.DFMDATA['headerContent']) {
        for (const eachItem of item['data']) {
          if (eachItem.key === key) {
            if (eachItem.hasOwnProperty('disableEnableFields')) {
              if (eachItem.disableEnableFields.length > 0) {
                for (let x = 0; x < eachItem.disableEnableFields.length; x++) {
                  for (
                    let y = 0;
                    y < this.DFMDATA['headerContent'].length;
                    y++
                  ) {
                    for (
                      let z = 0;
                      z < this.DFMDATA['headerContent'][y].data.length;
                      z++
                    ) {
                      if (
                        eachItem.disableEnableFields[x].key ===
                        this.DFMDATA['headerContent'][y].data[z].key
                      ) {
                        this.DFMDATA['headerContent'][y].data[
                          z
                        ].disabled = !eachItem.disableEnableFields[x].disabled;
                        break;
                      }
                    }
                  }
                }
              }
            }
            // value change functionality
            if (eachItem.hasOwnProperty('setValuesToFeilds')) {
              if (Object.keys(eachItem.setValuesToFeilds).length != 0) {
                const mainKey = Object.keys(eachItem.setValuesToFeilds);
                for (let i = 0; i < mainKey.length; i++) {
                  if (this.DFMDATA['bodyContent'].hasOwnProperty(mainKey[i])) {
                    const selectedObject = {};
                    selectedObject[mainKey[i]] = '';
                    this.DFMDATA['bodyContent'] = {
                      ...this.DFMDATA['bodyContent'],
                      ...selectedObject
                    };
                  }
                }
                this.Form_filled_data = this.DFMDATA['bodyContent'];
              }
            }
          }
        }
      }
      this.onChangeSelection();
    }
  }
  checkTheKeys() {
    let flag = false;
    this.Form_filled_data = this.DFMDATA['bodyContent'];
    const fromData = Object.keys(this.Form_filled_data);
    for (let i = 0; i < fromData.length; i++) {
      for (const item of this.DFMDATA['headerContent']) {
        for (const eachItem of item['data']) {
          if (eachItem.key === fromData[i]) {
            if (eachItem.hasOwnProperty('dynamicFields')) {
              if (eachItem.dynamicFields.length > 0) {
                flag = false;
                for (let j = 0; j < eachItem.dynamicFields.length; j++) {
                  if (
                    eachItem.dynamicFields[j].value ===
                    this.Form_filled_data[fromData[i]]
                  ) {
                    let valueFields;
                    if (
                      eachItem.dynamicFields[j].hasOwnProperty('fields') &&
                      eachItem.dynamicFields[j].fields.length > 0
                    ) {
                      valueFields = eachItem.dynamicFields[j].fields;
                      for (let m = 0; m < valueFields.length; m++) {
                        for (
                          let k = 0;
                          k < this.DFMDATA['headerContent'].length;
                          k++
                        ) {
                          if (
                            valueFields[m].sectionNumber ===
                            this.DFMDATA['headerContent'][k].sectionNumber
                          ) {
                            this.DFMDATA['headerContent'][k].data.push(
                              ...valueFields[m].data
                            );
                            break;
                          }
                        }
                      }
                    }
                    //for inserting separtate sections
                    let valueSections;
                    if (
                      eachItem.dynamicFields[j].hasOwnProperty('sections') &&
                      Object.keys(eachItem.dynamicFields[j].sections).length !=
                        0
                    ) {
                      valueSections =
                        eachItem.dynamicFields[j].sections.headerContent;
                      for (let o = 0; o < valueSections.length; o++) {
                        let result = false;
                        for (
                          let k = 0;
                          k < this.DFMDATA['headerContent'].length;
                          k++
                        ) {
                          if (
                            valueSections[o].sectionNumber ===
                            this.DFMDATA['headerContent'][k].sectionNumber
                          ) {
                            result = true;
                            break;
                          }
                        }
                        if (!result) {
                          this.DFMDATA['headerContent'].push(valueSections[o]);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
