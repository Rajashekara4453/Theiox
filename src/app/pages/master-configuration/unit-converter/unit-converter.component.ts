import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../services/app.service';
import { NgForm, NgModel } from '@angular/forms';
import { ToastrService } from '../../../components/toastr/toastr.service';
import { AuthGuard } from '../../auth/auth.guard';
import { Router } from '@angular/router';

@Component({
  selector: 'kl-unit-converter',
  templateUrl: './unit-converter.component.html',
  styleUrls: ['./unit-converter.component.scss']
})
export class UnitConverterComponent implements OnInit {
  constructor(
    private _appService: AppService,
    private _toastLoad: ToastrService,
    public _auth: AuthGuard,
    private _router: Router
  ) {}

  unitConverterFormData: any = {};
  unitConverter: Array<any> = [];
  dataObject: any = {};
  unitConverterArray: Array<any> = [];
  unitList_from: Array<any> = [];
  unitList_to: Array<any> = [];
  unitsDropdownSettings1: any = {};
  unitsDropdownSettings_from: any = {};
  unitsDropdownSettings_to: any = {};
  selectedUnit_from: any = {};
  selectedUnit_to: any = {};
  enteredValue: string;
  inverseValue: number = 0;
  from: any = [];
  to: any = [];
  value: number = 0;
  valuesArray: Array<any> = [];
  dataValue: any = {};
  warning: number = 0;
  dataReady: boolean = true;
  disableBtn = false;
  accessLevel: any;
  title: String;
  index: any;
  deleteText: any;
  ngOnInit() {
    this.getData();
    this.unitsDropdownSettings_from = {
      singleSelection: true,
      text: 'Select From Unit',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: 'singleSelect',
      labelKey: 'unit_name',
      primaryKey: 'unit_id',
      searchPlaceholderText: 'Search Unit',
      lazyLoading: true,
      enableFilterSelectAll: true,
      filterSelectAllText: 'Select the Filtered  From Unit',
      filterUnSelectAllText: 'Un-select the Filtered  From Unit'
    };

    this.unitsDropdownSettings_to = {
      singleSelection: true,
      text: 'Select To Unit',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      enableSearchFilter: true,
      classes: 'singleSelect',
      labelKey: 'unit_name',
      primaryKey: 'unit_id',
      searchPlaceholderText: 'Search Unit',
      lazyLoading: true,
      enableFilterSelectAll: true,
      filterSelectAllText: 'Select the Filtered  To Unit',
      filterUnSelectAllText: 'Un-select the Filtered  To Unit'
    };

    this.allowAccessComponent('');
    this.getLabels();
  }
  getLabels() {
    this._auth.getMenuLabel().subscribe((data) => {
      this.title = data;
    });
  }
  allowAccessComponent(acess: String) {
    const val = this._auth.allowAccessComponent('masterConfiguration', '');
    this.accessLevel = val;
    if (!this.accessLevel.view) {
      this._router.navigate(['/un-authorized']);
      return false;
    }
    // return val;
  }
  addRow() {
    this.dataReady = false;
    const temp = {
      from: [],
      to: [],
      value: '',
      inverse_value: ''
    };
    this.unitConverterArray.unshift(temp);
  }
  trackByFn(index) {
    return index;
  }

  deleteRow(index: number) {
    this.unitConverterArray.splice(index, 1);
    const warning = this.validateRows(this.unitConverterArray);
    if (warning === 0) {
      this.disableBtn = false;
    }
  }

  resetForm(unitConverterForm: NgForm) {
    unitConverterForm.reset();
    this.valuesArray = [];
    this.unitConverterArray = [];
    this.getData();
    this.disableBtn = false;
  }
  getData() {
    this.valuesArray.push({
      from: [],
      to: [],
      value: '',
      inverse_value: ''
    });
    const dataToSend = {};
    this._appService
      .getUnitConverterData(dataToSend)
      .subscribe((dataFromDB) => {
        this.dataObject = dataFromDB;
        this.unitList_from = this.dataObject.units;
        this.unitList_to = this.dataObject.units;
        for (let i = 0; i < this.dataObject.unit_converter.length; i++) {
          const from_unit_id: string = this.dataObject.unit_converter[i].from;
          const to_unit_id: string = this.dataObject.unit_converter[i].to;
          this.unitConverterFormData.from = this.findUnitName(from_unit_id);
          this.unitConverterFormData.to = this.findUnitName(to_unit_id);
          this.unitConverterFormData.value = this.dataObject.unit_converter[
            i
          ].value;
          this.unitConverterFormData.inverse_Value = this.dataObject.unit_converter[
            i
          ].inverse_value;
          this.dataValue = {
            from: [this.unitConverterFormData.from],
            to: [this.unitConverterFormData.to],
            value: this.unitConverterFormData.value,
            inverse_value: this.unitConverterFormData.inverse_Value
          };
          this.valuesArray.push(this.dataValue);
        }
        this.unitConverterArray = this.valuesArray;
      });
  }
  findUnitName(unitId: string) {
    for (let i = 0; i < this.unitList_from.length; i++) {
      if (unitId == this.unitList_from[i].unit_id) {
        return {
          unit_id: this.unitList_from[i].unit_id,
          unit_name: this.unitList_from[i].unit_name
        };
      }
    }
  }

  onItemSelect() {
    this.disableBtn = false;
  }

  validateRows(array: any) {
    this.disableBtn = true;
    this.warning = 0;
    this.unitConverter = [];
    for (let i = 0; i < array.length; i++) {
      this.selectedUnit_from = array[i].from[0];
      this.selectedUnit_from =
        typeof this.selectedUnit_from === 'undefined' ||
        this.selectedUnit_from === '[undefined]'
          ? ''
          : this.selectedUnit_from;
      this.selectedUnit_to = array[i].to[0];
      this.selectedUnit_to =
        typeof this.selectedUnit_to === 'undefined' ? '' : this.selectedUnit_to;
      this.enteredValue = array[i].value;
      const isNull = Object.is(this.enteredValue, null);
      if (isNull) {
        this.enteredValue = '';
      }
      this.inverseValue = array[i].inverse_value;
      if (
        new String(this.selectedUnit_from) != '' &&
        new String(this.selectedUnit_to) != '' &&
        new String(this.enteredValue) != ''
      ) {
        this.unitConverter.push({
          from: this.selectedUnit_from.unit_id,
          to: this.selectedUnit_to.unit_id,
          value: this.enteredValue,
          inverse_value: this.inverseValue
        });
      }
      if (
        new String(this.selectedUnit_from) == '' &&
        new String(this.selectedUnit_to) != ''
      ) {
        this._toastLoad.toast('warning', 'Warning', 'Values missing', true);
        this.warning++;
        break;
      } else if (
        new String(this.selectedUnit_to) == '' &&
        new String(this.selectedUnit_from) != ''
      ) {
        this._toastLoad.toast('warning', 'Warning', 'Values missing', true);
        this.warning++;
        break;
      } else if (
        new String(this.enteredValue) == '' &&
        new String(this.selectedUnit_to) != '' &&
        new String(this.selectedUnit_from) != ''
      ) {
        this._toastLoad.toast('warning', 'Warning', 'Values missing', true);
        this.warning++;
        break;
      } else if (
        new String(this.enteredValue) == '' &&
        new String(this.selectedUnit_to) == '' &&
        new String(this.selectedUnit_from) == '' &&
        i != 0
      ) {
        this._toastLoad.toast(
          'warning',
          'Warning',
          'Only FIRST row can be empty.. Enter all Values or Delete the row',
          true
        );
        this.warning++;
        break;
      }
    }
    // if (this.warning == 0) {
    //   const dataToSend = {
    //     unit_converter: this.unitConverter,
    //   };
    //   this.save(dataToSend);
    // }
    return this.warning;
  }
  save(array: any) {
    const warning = this.validateRows(array);
    if (warning == 0) {
      const dataToSend = {
        unit_converter: this.unitConverter
      };
      // this.save(dataToSend);

      this._appService.saveUnitConverter(dataToSend).subscribe((data) => {
        if (data.status == 'success') {
          this.valuesArray = [];
          this.unitConverterArray = [];
          this.getData();
          this.addRow();
          this.warning == 0;
          this.disableBtn = false;
          this._toastLoad.toast(
            'success',
            'Success',
            'Unit Converted and Saved Successfully',
            true
          );
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            'Error While Saving Unit Converter',
            true
          );
          this.disableBtn = false;
        }
      });
    }
  }
  deleteUniteConverter(value, from, to) {
    this.index = value;
    this.deleteText = from[0].unit_name + ' to ' + to[0].unit_name;
  }
}
