import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from '../../../components/toastr/toastr.service';
import { AppService } from '../../../services/app.service';
import { AuthGuard } from '../../auth/auth.guard';

@Component({
  selector: 'kl-client-management',
  templateUrl: './client-management.component.html',
  styleUrls: ['./client-management.component.scss']
})
export class ClientManagementComponent implements OnInit {
  addClientForm: FormGroup;

  clientId: string;
  clientLogo: string;
  clientName: string;
  clientDescription: string;
  clientAddress: string;
  clientLogoPath: string = null;
  clientSpecificInfo: any = {};
  user_id: string;
  files: any;
  filestring: string;
  newClientLogo: string;

  showAddClientForm: boolean = false;
  isValidForm: boolean = false;
  disableSave: boolean = false;
  isShowDelete: boolean = false;

  clientList: any = [];
  queryString: string = '';
  disableOrEnable: string;
  userObject: any = {};

  constructor(
    private _formBuilder: FormBuilder,
    private _toastLoad: ToastrService,
    private _auth: AuthGuard,
    private _appService: AppService
  ) {}

  ngOnInit() {
    this.addClientForm = this._formBuilder.group({
      userId: [''],
      clientId: [''],
      clientName: ['', Validators.required],
      clientDescription: ['', Validators.required],
      clientAddress: [''],
      clientLogo: [''],
      Imagefile: [''],
      clientLogoPath: [''],
      clientSpecificInfo: ['']
    });

    this.getClientList();
  }

  // Method to fetch all the clients
  getClientList() {
    const dataToSend = {};
    this._appService.getClientList(dataToSend).subscribe((ClientdataDB) => {
      this.clientList = ClientdataDB.data;
    });
  }

  // Method to diaplay client creation or editing form
  showClientForm(clientId: string) {
    this.userObject = this._auth.accessUserObject();
    this.user_id = this.userObject.eMail;
    if (clientId === '') {
      this.clientId = clientId;
      this.showAddClientForm = true;
      this.isShowDelete = false;
      // this.clientLogo = 'assets/images/defaultClientLogo.png';
      this.loadClientLogo('');
    } else {
      this.showAddClientForm = true;
      this.isShowDelete = true;
      const dataToSend = {
        client_id: clientId
      };

      this._appService.viewClientData(dataToSend).subscribe((clientData) => {
        if (clientData.status == 'success') {
          this.populateClientData(clientData.data);
        } else {
          this._toastLoad.toast('error', 'Error', clientData.message, true);
        }
      });
    }
  }

  displayClientLogo: string;

  // Method to display client logo
  loadClientLogo(clientLogoDB) {
    if (clientLogoDB === '') {
      this.clientLogo = 'assets/images/defaultClientLogo.png';
    } else {
      this.clientLogo = clientLogoDB;
      this.newClientLogo = this.clientLogo;
    }
  }

  // Method to view client data on edit
  populateClientData(clientData) {
    this.loadClientLogo(clientData.client_logo);
    this.clientId = clientData.client_id;
    this.clientName = clientData.client_name;
    this.clientDescription = clientData.client_description;
    this.clientAddress = clientData.client_address;
    // this.clientLogo = this.clientLogo;
    this.clientLogoPath = clientData.client_logo_path;
    this.clientSpecificInfo = clientData.client_specific_info;
  }

  // Method to display client list table
  loadClientList() {
    this.showAddClientForm = false;
  }

  // Method to add/edit client
  addClientToList(clientData) {
    this.isValidForm = this.validateAddClientForm();
    if (this.isValidForm == false) {
      return;
    } else if (this.isValidForm == true) {
      this.disableSave = true;
      const dataToSend = {
        client_id: this.clientId,
        client_name: clientData.clientName,
        client_description: clientData.clientDescription,
        client_address: clientData.clientAddress,
        client_logo_path: null,
        client_specific_info: [],
        user_id: this.user_id
      };
      if (clientData.client_id === '') {
        dataToSend['client_id'] = null;
        dataToSend['client_logo'] = null;
        this.saveOrUpdateClientData(dataToSend);
      } else if (clientData.client_id !== '' || clientData.client_id !== null) {
        if (this.newClientLogo) dataToSend['client_logo'] = this.newClientLogo;
        dataToSend['isdeleted'] = clientData.isdeleted;
        dataToSend['date_time'] = clientData.date_time;
        (dataToSend['client_specific_info']['client_phone'] =
          clientData.client_phone),
          (dataToSend['client_specific_info']['client_email'] =
            clientData.client_phone);

        this.saveOrUpdateClientData(dataToSend);
      }
    }
  }

  // Method to send client data to back-end
  saveOrUpdateClientData(dataToSend) {
    this._appService.saveClientData(dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this._toastLoad.toast(
          'success',
          'Success',
          'Client Created Successfully',
          true
        );
        this.resetFields();
        this.getClientList();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
        this.resetFields();
      }
    });
  }

  // Method to reset Form
  resetFields() {
    this.disableSave = false;
    this.clientId = '';
    this.addClientForm.reset();
    this.loadClientList();
  }

  // Method to Validate Form
  validateAddClientForm() {
    if (this.addClientForm.controls.clientName.invalid) {
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Value For Client Name Field Is Mandatory',
        true
      );
      return false;
    }
    if (this.addClientForm.controls.clientDescription.invalid) {
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Value For Client Description Is Mandatory',
        true
      );
      return false;
    }
    return true;
  }

  // Method to display delete modal and data on it.
  sendClientIdToDelete(
    clientId: string,
    clientName: string,
    clientIsDeleted: string
  ) {
    this.clientId = clientId;
    this.clientName = clientName;
    if (clientIsDeleted === 'true') {
      this.disableOrEnable = 'enable';
    } else if (clientIsDeleted === 'false') {
      this.disableOrEnable = 'disable';
    }
  }

  deleteClientData() {
    const dataToSend = {
      client_id: this.clientId,
      type: this.disableOrEnable
    };
    this._appService.deleteClientData(dataToSend).subscribe((data) => {
      if (data.status === 'success') {
        this._toastLoad.toast('success', 'Success', data.message, true);
        this.getClientList();
      } else {
        this._toastLoad.toast('error', 'Error', data.message, true);
        this.getClientList();
      }
    });
  }

  // Method to check logo file size
  getFiles(event) {
    if (event.target.files[0].size > 1000000) {
      this._toastLoad.toast(
        'warning',
        'Warning',
        'Image size is too big! Try another.',
        true
      );
    } else {
      this.files = event.target.files;
      const reader = new FileReader();
      reader.onload = this.handleReaderLoaded.bind(this);
      reader.readAsBinaryString(this.files[0]);
    }
  }

  // Method to convert image to Base 64
  handleReaderLoaded(readerEvt) {
    const binaryString = readerEvt.target.result;
    this.filestring = btoa(binaryString); // Converting binary string data.
    this.clientLogo = 'data:image/png;base64,' + this.filestring;
    this.newClientLogo = this.clientLogo;
  }
}
