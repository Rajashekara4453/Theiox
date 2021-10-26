import { Component, OnInit } from '@angular/core';
import { AppService } from '../../../services/app.service';
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
import { ToastrService } from '../../../components/toastr/toastr.service';
import { AuthGuard } from '../../auth/auth.guard';
import { Router } from '@angular/router';
import { ServiceloaderService } from '../../../components/loader/serviceloader/serviceloader.service';
@Component({
  selector: 'kl-gateway-model',
  templateUrl: './gateway-model.component.html',
  styleUrls: ['./gateway-model.component.scss']
})
export class GatewayModelComponent implements OnInit {
  // Variable Declarations
  public sideMenus: any = {};
  public DFMinput: any;
  options: any = [];
  protocol = false;
  public dmfLoading = false;
  protocolsJson: any;
  title = '';
  genericData: any;
  protocolData: any;
  public protocolType: String;
  onLoaded = false;
  draggedEventKey: any = {};
  showProtocolInfo: any;
  editCreate = false;
  accessLevel: any;
  disableBtn = false;
  constructor(
    private appservice: AppService,
    private _toastLoad: ToastrService,
    public _auth: AuthGuard,
    private _router: Router,
    private loader: ServiceloaderService
  ) {}
  ngOnInit() {
    this.allowAccessComponent('');
    this.getSidebarMenus();
    this.addNewGatewayModel();
    this.getProtocols();
    this.getLabels();
  }
  getLabels() {
    this._auth.getMenuLabel().subscribe((data) => {
      this.title = 'Create ' + data;
    });
  }
  allowAccessComponent(acess: String) {
    const val = this._auth.allowAccessComponent('masterConfiguration', '');
    this.accessLevel = val;
    if (!this.accessLevel.view) {
      this._router.navigate(['/un-authorized']);
      return false;
    }
    //this.accessLevel.create = trur;
  }
  allowDrop(ev) {
    ev.preventDefault();
  }
  drag(ev) {}
  drop(ev) {
    this.getGatewayData(this.draggedEventKey);
  }
  draggedEventFromMenubar(data: any) {
    this.draggedEventKey = data.data;
  }
  // method the list the gateway models
  getSidebarMenus() {
    this.onLoaded = false;
    this.appservice.getgatewaysDataLists().subscribe((data) => {
      if (data.status === 'success') {
        this.sideMenus['menuheading'] = 'Gateway Model';
        this.sideMenus['placeholder'] = 'Search Gateway models';
        this.sideMenus['buttonlabel'] = 'Create Gateway model';
        this.sideMenus['data'] = data.nodes;
        this.onLoaded = true;
      } else {
        this._toastLoad.toast(
          'error',
          'Error',
          'Error in Loading the List',
          true
        );
      }
    });
  }
  // Method to get the gateway model dfm by gateway_id
  getGatewayData(key) {
    this.loader.show();
    if (this.accessLevel.edit) {
      this.accessLevel.create = true;
    } else {
      this.accessLevel.create = false;
    }
    this.title = 'Edit ' + key.gatewaymodelname;
    this.protocolType = '';
    this.showProtocolInfo = '';
    this.dmfLoading = false;
    this.protocol = false;
    this.appservice.getSavedogatewaysData(key.gateway_id).subscribe((data) => {
      if (data.status === 'success') {
        this.protocolsJson = data['data'];
        // this.protocolData = this.protocolsJson['protocol']['dfm_data'][
        //   data.bodyContent.protocol
        // ]['headerContent'];
        this.genericData = this.protocolsJson['protocol']['dfm_data'];
        this.genericData.headerContent = this.genericData.headerContent;
        this.genericData.userActions = {
          save: {
            label: 'Update'
          },
          cancel: {
            label: 'Cancel'
          }
        };
        this.genericData.bodyContent = data.bodyContent;
        this.genericData.headerContent = [
          {
            data: this.protocolsJson['protocol']['dfm_data'].headerContent,
            layoutType: 'section',
            // sectionTitle: 'General Info',
            sectionTitle: '',
            sectionWidth: '12'
          }
          // ,
          // {
          //   data: this.protocolData,
          //   layoutType: 'section',
          //   sectionTitle: this.showProtocolInfo,
          //   sectionWidth: '12'
          // }
        ];
        this.DFMinput = this.genericData;
        this.dmfLoading = true;
        this.loader.hide();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
        this.loader.hide();
      }
    });
  }
  addNewGatewayModel() {
    this.dmfLoading = false;
    this.protocolType = null;
    this.protocol = true;
    this.getLabels();
    this.getSidebarMenus();
    this.allowAccessComponent('');
  }
  // Method to create/edit gateway model
  getselectedValues(json) {
    this.disableBtn = true;
    if (json.protocol.length > 0) {
      this.editCreate = true;
    } else {
      // json['protocol'] = this.protocolType;
    }
    this.appservice.createGatewayModel(json).subscribe((data) => {
      if (data.status === 'success') {
        // if (this.editCreate) {
        //   this._toastLoad.toast(
        //     'success',
        //     'Success',
        //     'Gateway Model Updated Successfully',
        //     true
        //   );
        // } else {
        this._toastLoad.toast(
          'success',
          'Success',
          'Gateway Model Created Successfully',
          true
        );
        // }
        this.disableBtn = false;
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
      this.editCreate = false;
      // this.getSidebarMenus();
      this.addNewGatewayModel();
      this.disableBtn = false;
    });
  }
  onCancel() {
    this.addNewGatewayModel();
  }
  getProtocols() {
    this.protocol = false;
    this.appservice.getProtocols().subscribe((data) => {
      if (data.status === 'success') {
        this.options = data['data'];
        this.protocol = true;
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
      }
    });
  }
  // Method to Load the dfm based on the protocol selection
  typeOfProtocolChanged(value) {
    this.loader.show();
    this.dmfLoading = false;
    this.showProtocolInfo = '';
    const protocol = {
      protocol: value
    };
    this.appservice.getModelProtocolsBody(protocol).subscribe((data) => {
      if (data.status === 'success') {
        this.protocolsJson = data['data'];
        // this.protocolData = this.protocolsJson['protocol']['dfm_data'][value1][
        //   'headerContent'
        // ];
        this.genericData = this.protocolsJson['protocol']['dfm_data'];
        this.genericData.headerContent = this.genericData.headerContent;
        this.genericData.bodyContent = data.bodyContent;
        this.genericData.userActions = {
          save: {
            label: 'Save'
          },
          cancel: {
            label: 'Cancel'
          }
        };
        this.genericData.headerContent = [
          {
            data: this.protocolsJson['protocol']['dfm_data'].headerContent,
            layoutType: 'section',
            // sectionTitle: 'General Info',
            sectionTitle: '',
            sectionWidth: '12'
          }
          // {
          //   data: this.protocolData,
          //   layoutType: 'section',
          //   sectionTitle: this.showProtocolInfo,
          //   sectionWidth: '12'
          // }
        ];
        this.DFMinput = this.genericData;
        this.dmfLoading = true;
        this.loader.hide();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
        this.loader.hide();
      }
    });
  }
}
