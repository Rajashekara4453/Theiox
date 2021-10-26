import {
  Component,
  OnInit,
  ViewChild,
  SimpleChanges,
  Input
} from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from '../../../services/app.service';
import { NgForm, NgModel } from '@angular/forms';
import { ToastrService } from '../../../components/toastr/toastr.service';
import { AuthGuard } from '../../auth/auth.guard';

@Component({
  selector: 'kl-master-form',
  templateUrl: './master-form.component.html',
  styleUrls: ['./master-form.component.scss']
})
export class MasterFormComponent implements OnInit {
  URL: any;
  @ViewChild('commonForm') commonForm: NgForm;
  @ViewChild('name') name: NgModel;
  @ViewChild('value') value: NgModel;
  // @Input() editableText: boolean = false;
  // @Input() editDelete: boolean = false;
  sideMenus: object;
  selectedValues: any;
  isUpdate: boolean = false;
  unitList: Array<any> = [];
  componentJSonData: any;
  MethodToGetList: any;
  // labelName1: any;
  // placeHolderName1: any;
  labelName: any;
  placeHolderName: any;
  // labelName2: any;
  // placeHolderName2: any;
  descriptionName: any;
  descriptionPlaceHolder: any;
  // labelName3: any;
  // placeHolderName3: any;
  valueName: any;
  valuePlaceholder: any;
  selection: any;
  selectionFiled: boolean = false;
  formLoad: boolean = false;
  // buttonName: String = 'Save';
  isLoading: boolean = false;
  showCancelButton = false;
  deleteCmpName: any;
  accessLevel: any;
  createEdit = true;
  disableBtn = false;
  notation: boolean;
  title: any;
  onLoaded = false;
  deleteName: any;
  public loadMasterForm: Boolean = false;
  constructor(
    private appService: AppService,
    private _toastLoad: ToastrService,
    private _router: Router,
    public _auth: AuthGuard
  ) {}
  ngOnInit() {
    this.URL = this._router.url;
    this.URL = this.URL.split('/').pop();
    // this.title = "Create " + this.URL;
    this.getMasterConfigurationJSon();
    this.allowAccessComponent('');
    this.getLabels();
  }
  getLabels() {
    this._auth.getMenuLabel().subscribe((data) => {
      this.title = 'Create ' + data;
    });
  }
  getCmpNameToDelete() {
    this.deleteCmpName = this.deleteName;
  }
  allowAccessComponent(acess: String) {
    const val = this._auth.allowAccessComponent('masterConfiguration', '');
    this.accessLevel = val;
    if (!this.accessLevel.view) {
      this._router.navigate(['/un-authorized']);
      return false;
    }
    // //this.accessLevel.create = false
    // if (val.create && val.edit) {
    //   // this.editableText = false;
    //   // this.editDelete = false;
    //   this.createEdit = true;

    // } else if (val.create && val.edit === false) {
    //   this.editableText = true;
    //   this.editDelete = true;
    // } else if (val.create === true && val.delete === false && val.edit === false) {
    //   this.editableText = false;
    //   this.editDelete = true;
    // }
    // return val;
  }
  // ngOnChanges(changes: SimpleChanges) {

  //   this.URL = this._router.url;
  //   this.URL = this.URL.split('/').pop();
  //   this.getMasterConfigurationJSon();
  //   this.addNew();
  // }
  getMasterConfigurationJSon() {
    this.loadMasterForm = false;
    this.appService.getComponentJson().subscribe((data) => {
      for (let i = 0; i <= data.data.length; i++) {
        if (this.URL === data.data[i].url) {
          this.componentJSonData = data.data[i];
          if (this.componentJSonData.valueFiled.isRequired) {
            // this.labelName1 = this.componentJSonData.labelName1;
            // this.placeHolderName1 = this.componentJSonData.placeholder1;
            // this.labelName2 = this.componentJSonData.labelName2;
            // this.placeHolderName2 = this.componentJSonData.placeholder2;
            // this.labelName3 = this.componentJSonData.labelName3;
            // this.placeHolderName3 = this.componentJSonData.placeholder3;
            this.labelName = this.componentJSonData.fields[0].label;
            this.placeHolderName = this.componentJSonData.fields[0].placeholder;
            this.descriptionName = this.componentJSonData.fields[1].label;
            this.descriptionPlaceHolder = this.componentJSonData.fields[1].placeholder;
            this.valueName = this.componentJSonData.fields[2].label;
            this.valuePlaceholder = this.componentJSonData.fields[2].placeholder;
            this.selection = this.componentJSonData.selectionField.isRequired;
            if (this.selection) {
              this.selectionFiled = true;
              this.getUnits();
            }
          } else {
            this.labelName = this.componentJSonData.fields[0].label;
            this.placeHolderName = this.componentJSonData.fields[0].placeholder;
            this.descriptionName = this.componentJSonData.fields[1].label;
            this.descriptionPlaceHolder = this.componentJSonData.fields[1].placeholder;
          }
          this.addNew();
          this.getList();
          break;
        }
      }
      this.loadMasterForm = true;
    });
  }
  //get Parameter units
  getUnits() {
    this.appService.getMasterUnits().subscribe((data) => {
      this.unitList = data.data;
    });
  }
  getList() {
    this.onLoaded = false;
    const method = this.componentJSonData.methods.ToGetList;
    this.appService[method]().subscribe((data) => {
      if (data.status === 'success') {
        this.sideMenus = data;
        this.sideMenus[
          'menuheading'
        ] = this.componentJSonData.sideMenus.menuheading;
        this.sideMenus[
          'buttonlabel'
        ] = this.componentJSonData.sideMenus.buttonlabel;
        this.sideMenus[
          'placeholder'
        ] = this.componentJSonData.sideMenus.placeholder;
        this.onLoaded = true;
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  onLeftSideBarItemClick(e: any) {
    this.loadMasterForm = false;
    this.title = 'Edit ' + e.name;
    this.deleteName = e.name;
    if (this.accessLevel.edit) {
      this.accessLevel.create = true;
    } else {
      this.accessLevel.create = false;
    }
    this.showCancelButton = true;
    this.selectedValues = JSON.parse(JSON.stringify(e));
    this.selection = this.componentJSonData.selectionField.isRequired;
    if (this.selection) {
      this.selectedValues.unit = this.selectedValues.unit.value;
    } else {
      this.selectedValues = this.selectedValues;
    }
    this.loadMasterForm = true;
    this.isUpdate = true;
    // this.buttonName = 'Update';
  }
  addNew() {
    // this.title = "Create " + this.URL;
    this.loadMasterForm = false;
    this.getLabels();
    this.showCancelButton = false;
    this.isUpdate = false;
    // this.buttonName = 'Save';
    this.commonForm.reset();
    this.selection = this.componentJSonData.selectionField.isRequired;
    if (this.selection) {
      this.selectedValues = {
        id: '',
        name: '',
        description: '',
        unit: null
      };
      this.formLoad = true;
    } else {
      if (this.URL === 'unit-master') {
        this.selectedValues = {
          id: '',
          name: '',
          notation: ''
        };
      } else {
        this.selectedValues = {
          id: '',
          name: '',
          description: '',
          value: null
        };
      }
      this.formLoad = true;
    }
    this.loadMasterForm = true;
    this.allowAccessComponent('');
  }
  onCancel() {
    this.getList();
    this.addNew();
  }
  update() {
    this.onCancel();
  }

  save() {
    this.isLoading = true;
    this.disableBtn = true;
    const methodToSave = this.componentJSonData.methods.ToSave;
    this.appService[methodToSave](this.selectedValues).subscribe((data) => {
      this.getList();
      if (this.URL === 'multiplicationFactors') {
        if (data.status === 'success') {
          this._toastLoad.toast(
            'success',
            'Success',
            this.selectedValues.hasOwnProperty('multiplication_factor_id')
              ? data.message
              : data.message,
            true
          );
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            this.selectedValues.hasOwnProperty('multiplication_factor_id')
              ? data.message
              : data.message,
            true
          );
        }
      } else if (
        this.URL === 'deviceTypes' ||
        this.URL === 'gatewayTypes' ||
        this.URL === 'parameters'
      ) {
        if (data.status === 'success') {
          this._toastLoad.toast(
            'success',
            'Success',
            this.selectedValues.hasOwnProperty('id')
              ? data.message
              : data.message,
            true
          );
        } else {
          this._toastLoad.toast(
            'error',
            'Error',
            this.selectedValues.hasOwnProperty('id')
              ? data.message
              : data.message,
            true
          );
        }
      } else {
        if (data.status === 'success') {
          this._toastLoad.toast('success', 'Success', data.message, true);
        } else {
          this._toastLoad.toast('error', 'Error', data.message, true);
        }
      }
      this.isLoading = false;
      this.update();
      this.disableBtn = false;
    });
  }

  delete() {
    const methodToDelete = this.componentJSonData.methods.ToDelete;
    let parameters;
    if (this.URL === 'multiplicationFactors') {
      parameters = this.selectedValues.multiplication_factor_id;
    } else if (
      this.URL === 'deviceTypes' ||
      this.URL === 'gatewayTypes' ||
      this.URL === 'parameters'
    ) {
      parameters = this.selectedValues.id;
    } else {
      parameters = this.selectedValues;
    }
    this.appService[methodToDelete](parameters).subscribe((data) => {
      if (data.status === 'success') {
        this._toastLoad.toast(
          'success',
          'Success',
          'Deleted Successfully',
          true
        );
      } else {
        this._toastLoad.toast('error', 'Error', 'Error in Deleting', true);
      }
      this.update();
    });
  }
}
