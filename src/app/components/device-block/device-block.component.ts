import {
  Component,
  OnInit,
  Input,
  SimpleChanges,
  ViewChild,
  ElementRef,
  Output,
  EventEmitter
} from '@angular/core';
import { ToastrService } from '../toastr/toastr.service';
import { NgSelectComponent } from '@ng-select/ng-select';
@Component({
  selector: 'kl-device-block',
  templateUrl: './device-block.component.html',
  styleUrls: ['./device-block.component.scss']
})
export class DeviceBlockComponent implements OnInit {
  // Variable Declaration
  @Input() eachBlockData: Array<any>;
  @Input() deviceGroup_config: any;
  @Input() selectionData: any;
  @Input() protocolCategory: any;
  items: any;
  virtualDevices: any;
  selectedVirtualDevice: any;
  temporaryCheckedTagsHolder = [];
  checkedVirtualdevice = true;
  public eachBlockDataTemplete: Object = {};
  isBlockExpanded = false;
  @ViewChild('close') close: ElementRef;
  @ViewChild('myNgSelect') myNgSelectComponent: NgSelectComponent;
  public frequencyFortable: Object[] = [
    {
      label: '1 min',
      value: '1 min'
    },
    {
      label: '2 min',
      value: '2 min'
    },
    {
      label: '5 min',
      value: '5 min'
    },
    {
      label: '10 min',
      value: '10 min'
    },
    {
      label: '15 min',
      value: '15 min'
    },
    {
      label: '30 min',
      value: '30 min'
    },
    {
      label: '1 hour',
      value: '1 hour'
    },
    {
      label: 'Daily',
      value: 'daily'
    },
    {
      label: 'Monthly',
      value: 'monthly'
    },
    {
      label: 'Yearly',
      value: 'yearly'
    }
  ];
  public frequencyFortableForRaw: Object[] = [
    {
      label: 'Real Time',
      value: 'Real Time'
    },
    {
      label: '1 min',
      value: '1 min'
    },
    {
      label: '2 min',
      value: '2 min'
    },
    {
      label: '5 min',
      value: '5 min'
    },
    {
      label: '10 min',
      value: '10 min'
    },
    {
      label: '15 min',
      value: '15 min'
    },
    {
      label: '30 min',
      value: '30 min'
    },
    {
      label: '1 hour',
      value: '1 hour'
    },
    {
      label: '2 hour',
      value: '2 hour'
    },
    {
      label: '3 hour',
      value: '3 hour'
    },
    {
      label: '6 hour',
      value: '6 hour'
    },
    {
      label: 'Daily',
      value: 'daily'
    }
  ];
  deviceIdAndNameMap = {};
  modbus = false;
  constructor(public _toastLoad: ToastrService) {}
  ngOnInit() {
    this.virtualDevices = this.items = this.deviceGroup_config.name;
    if (this.deviceGroup_config.hasOwnProperty('name')) {
      for (
        let index = 0;
        index < this.deviceGroup_config['name'].length;
        index++
      ) {
        const element = this.deviceGroup_config['name'][index];
        this.deviceIdAndNameMap[element['device_instance_id']] =
          element['name'];
      }
    }
    if (this.protocolCategory === 'protocol_category_103') {
      this.modbus = true;
      this.eachBlockDataTemplete = {
        blockNumber: '',
        modBusFc: null,
        startAddress: '',
        noOfRegister: '',
        device_instance_id: null,
        tagsData: [
          {
            data_Type: null,
            reg_Address: '',
            tag_id: null,
            mFactor: 'multiplication_factor_115',
            mFactorValue: '1',
            device_instance_id: null,
            aggregationRules: [
              {
                name: 'Raw',
                frequency: 'Real Time',
                isSelected: true
              },
              {
                name: 'Delta Sum',
                frequency: []
              },
              {
                name: 'Min',
                frequency: []
              },
              {
                name: 'Max',
                frequency: []
              },
              {
                name: 'Average',
                frequency: []
              },
              {
                name: 'Count',
                frequency: []
              }
            ]
          }
        ]
      };
      this.isBlockExpanded = true;
    } else {
      this.modbus = false;
      this.eachBlockDataTemplete = {
        blockNumber: '',
        modBusFc: null,
        device_instance_id: null,
        tagsData: [
          {
            data_Type: null,
            reg_Address: '',
            tag_id: null,
            mFactor: 'multiplication_factor_115',
            mFactorValue: '1',
            device_instance_id: null,
            aggregationRules: [
              {
                name: 'Raw',
                frequency: 'Real Time',
                isSelected: true
              },
              {
                name: 'Delta Sum',
                frequency: []
              },
              {
                name: 'Min',
                frequency: []
              },
              {
                name: 'Max',
                frequency: []
              },
              {
                name: 'Average',
                frequency: []
              },
              {
                name: 'Count',
                frequency: []
              }
            ]
          }
        ]
      };
      this.isBlockExpanded = true;
    }
  }
  ngAfterViewInit() {
    //this has to be set programmatically because the [virtualScroll] attribute is provided by more than one component
    this.myNgSelectComponent.virtualScroll = true;
  }
  deleteBlock(blockIndex) {
    this.eachBlockData.splice(blockIndex, 1);
    if (this.eachBlockData.length === 0) {
      this.addBlocks();
    }
  }
  /**
   * add a Block to the Table
   */
  addBlocks() {
    this.eachBlockData.unshift(
      JSON.parse(JSON.stringify(this.eachBlockDataTemplete))
    );
  }
  toggleTagExpandCollepseImg(BlockIndex: number) {
    this.eachBlockData[BlockIndex].isTagExpanded = !this.eachBlockData[
      BlockIndex
    ].isTagExpanded;
  }
  addTag(blockIndex) {
    const objFortag = {
      data_Type: null,
      reg_Address: '',
      tag_id: null,
      mFactor: 'multiplication_factor_115',
      mFactorValue: '1',
      device_instance_id: null,
      aggregationRules: [
        {
          name: 'Raw',
          frequency: 'Real Time',
          isSelected: true
        },
        {
          name: 'Delta Sum',
          frequency: []
        },
        {
          name: 'Min',
          frequency: []
        },
        {
          name: 'Max',
          frequency: []
        },
        {
          name: 'Average',
          frequency: []
        },
        {
          name: 'Count',
          frequency: []
        }
      ]
    };
    this.eachBlockData[blockIndex].tagsData.unshift(objFortag);
  }
  deleteTag(blockIndex, tagIndex) {
    this.eachBlockData[blockIndex].tagsData.splice(tagIndex, 1);
    if (this.eachBlockData[blockIndex].tagsData.length === 0) {
      this.addTag(blockIndex);
    }
  }
  getExponentialForm(val: any) {
    return Number(val).toExponential();
  }
  cloneTag(blockIndex, tagData: any) {
    tagData = JSON.parse(JSON.stringify(tagData));
    tagData['tag_id'] = null;
    tagData['reg_Address'] = '';
    this.eachBlockData[blockIndex].tagsData.splice(0, 0, tagData);
  }
  toggleExpandCollepseImg() {
    this.isBlockExpanded = !this.isBlockExpanded;
  }
  virtualDevice(data) {
    data.device_instance_id = null;
  }

  setVirtualDevice(blocknumber, blockIndex, id) {
    for (let index = 0; index < this.eachBlockData.length; index++) {
      const element = this.eachBlockData[index];
      if (element.blockNumber === blocknumber) {
        for (let j = 0; j < element.tagsData.length; j++) {
          if (element.tagsData[j].hasOwnProperty('device_instance_id')) {
            element.tagsData[j]['device_instance_id'] = id;
            // arrBlockData[i].tagsData[j]['device_instance_id']
          } else {
            element.tagsData[j]['device_instance_id'] = id;
          }
          // else {
          //   if (this.protocolValue !== undefined) {
          //     arrBlockData[i].tagsData[j]['device_instance_id'] = this.protocolValue;
          //   }
          // }       I
        }
      }
    }
    // this.virtualDevices = this.items;
  }
  // openVirtualField() {
  //   this.virtualDevices = this.items;
  // }
  // closeVirtualField() {
  //   this.virtualDevices = [];
  // }
  AssignVirtualDevices() {
    if (this.temporaryCheckedTagsHolder.length > 0) {
      for (
        let index = 0;
        index < this.temporaryCheckedTagsHolder.length;
        index++
      ) {
        const tag = this.temporaryCheckedTagsHolder[index].tag;
        tag['device_instance_id'] = this.selectedVirtualDevice;
        this.eachBlockData[
          this.temporaryCheckedTagsHolder[index].blockIndex
        ].device_instance_id = null;
      }
      this.close.nativeElement.click();
      this.temporaryCheckedTagsHolder = [];
      const checkboxes = document.getElementsByName('virtualDeviceCheckBox');
      for (let i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i]['type'] == 'checkbox') {
          checkboxes[i]['checked'] = false;
        }
      }
    } else {
      this._toastLoad.toast('error', 'Error', 'No Checkboxes Selected', true);
    }

    // for (let index = 0; index < this.eachBlockData.length; index++) {
    //   const element = this.eachBlockData[index];
    //   // if (element.blockNumber === blocknumber) {
    //   for (let j = 0; j < element.tagsData.length; j++) {
    //     if (element.tagsData[j].hasOwnProperty('device_instance_id')) {
    //       element.tagsData[j]['device_instance_id'] = this.selectedVirtualDevice;
    //       // arrBlockData[i].tagsData[j]['device_instance_id']
    //     } else {
    //       element.tagsData[j]['device_instance_id'] = this.selectedVirtualDevice;
    //     }
    //     // else {
    //     //   if (this.protocolValue !== undefined) {
    //     //     arrBlockData[i].tagsData[j]['device_instance_id'] = this.protocolValue;
    //     //   }
    //     // }       I

    //   }
    //   //      }

    // }
  }
  setDisplayValue(e, tag, BlockIndex) {
    const actualData = { tag: tag, blockIndex: BlockIndex };
    if (e) {
      this.temporaryCheckedTagsHolder.push(actualData);
    } else {
      for (
        let index = 0;
        index < this.temporaryCheckedTagsHolder.length;
        index++
      ) {
        const element = this.temporaryCheckedTagsHolder[index];
        if (JSON.stringify(element) === JSON.stringify(actualData)) {
          this.temporaryCheckedTagsHolder.splice(index, 1);
        }
      }
    }
  }
  clearField(tag, BlockIndex) {
    const actualData = { tag: tag, blockIndex: BlockIndex };
    this.temporaryCheckedTagsHolder.push(actualData);
    this.selectedVirtualDevice = null;
  }
  closePopUP() {
    this.temporaryCheckedTagsHolder = [];
    const checkboxes = document.getElementsByName('virtualDeviceCheckBox');
    for (let i = 0; i < checkboxes.length; i++) {
      if (checkboxes[i]['type'] == 'checkbox') {
        checkboxes[i]['checked'] = false;
      }
    }
  }
}
