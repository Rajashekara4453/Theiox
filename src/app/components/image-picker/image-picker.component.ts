import {
  Component,
  OnInit,
  ViewChild,
  Input,
  Output,
  EventEmitter,
  ContentChild,
  AfterContentInit,
  ElementRef,
  HostListener
} from '@angular/core';
import { ImagePickerClickListenerDirective } from './image-picker-click-listener.directive';
import { tap } from 'rxjs/operators';
import { ImageDetailsService } from './image-details.service';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from '../toastr/toastr.service';

@Component({
  selector: 'kl-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss']
})
export class ImagePickerComponent implements OnInit, AfterContentInit {
  @ContentChild(ImagePickerClickListenerDirective)
  modalTrigger: ImagePickerClickListenerDirective;
  @ViewChild('fileInput') fileInput: any;
  @ViewChild('closeBtnProxy') close: ElementRef;
  @ViewChild('uploadModal') uploadModal: ElementRef;
  @Input() isScadaTemplateView: any;
  @Input('settings')
  get defaultSettings(): any {
    return this._defaultSettings;
  }
  set defaultSettings(settings: any) {
    if (settings) {
      if (!settings.hasOwnProperty('isUploadEnabled')) {
        this._defaultSettings['isUploadEnabled'] = true;
      } else {
        this._defaultSettings['isUploadEnabled'] = settings.isUploadEnabled;
      }

      if (!settings.hasOwnProperty('isSingleSelection')) {
        this._defaultSettings['isSingleSelection'] = true;
      } else {
        this._defaultSettings['isSingleSelection'] = settings.isSingleSelection;
      }

      if (!settings.hasOwnProperty('isContentProjection')) {
        this._defaultSettings['isContentProjection'] = true;
      } else {
        this._defaultSettings['isContentProjection'] =
          settings.isContentProjection;
      }
    }
  }
  _defaultSettings = {};

  @Output() onSelect = new EventEmitter();
  @Output() onCancel = new EventEmitter();

  primaryActionLabel: string = 'Select';
  fileList: File[] = []; // Files only for BE
  imagePreview = []; // Only for preview
  allImagesInfo = []; // holds image info(name,fname,width,height,keywords) for BE
  tagSet = []; //for BE
  isImageNotSelected: boolean = true;
  libraryImages = []; //for showing all library images
  isLoading: boolean = false;
  sendImage: any;
  searchKeyword: string = '';
  isScadaView: boolean = false;
  activeTab: number = 1;
  private receiveParentMsg;
  @HostListener('window:message', ['$event'])
  onMessage(e) {
    if (e.data === 'close') {
      this.onModalClose();
    }
  }

  constructor(
    private imageService: ImageDetailsService,
    private route: ActivatedRoute,
    private _toaster: ToastrService
  ) {}

  ngOnInit() {
    this.getAllImagesInfo();
    this.route.queryParams.subscribe((params) => {
      if (params['view'] === 'scada') {
        this.isScadaView = true;
        if (params['upload'] === 'true') {
          this._defaultSettings['isUploadEnabled'] = true;
        }
        if (params['selection'] === '1') {
          this._defaultSettings['isSingleSelection'] = true;
        }
        if (params['selection'] === '2') {
          this._defaultSettings['isSingleSelection'] = false;
        }
      }
      if (this.isScadaTemplateView) {
        this.isScadaView = true;
      }
    });
  }

  ngAfterContentInit() {
    if (Object.keys(this._defaultSettings).length === 0) {
      this._defaultSettings = {
        isContentProjection: false,
        isSingleSelection: false,
        isUploadEnabled: false
      };
    }
    if (this._defaultSettings['isContentProjection']) {
      this.fileList = [];
      this.tagSet = [];
      this.imagePreview = [];
      this.allImagesInfo = [];
      this.modalTrigger.isModalTriggered
        .asObservable()
        .pipe(
          tap(() => {
            this.getAllImagesInfo();
          })
        )
        .subscribe((data) => {});
    }
  }

  //  resetModal() {
  //   this.libraryImages = [];
  //   this.imagePreview = [];
  //   this.fileList = [];
  //   this.tagSet = [];
  //   this.allImagesInfo = [];
  //  }

  getAllImagesInfo() {
    this.isLoading = true;
    this.isImageNotSelected = true;
    this.imageService.getAllImagesInfo().subscribe(
      (data) => {
        if (data['status'] === 'success') {
          const allDefaultImages = data['data']['images_info'];
          this.libraryImages = allDefaultImages.filter((item) => {
            return item['filename'].split('.').pop() === 'svg';
          });
          this.isLoading = false;
        }
      },
      (error) => {
        this.isLoading = false;
      }
    );
  }

  onTab(tab: any) {
    if (tab['id'] === 1) {
      this.primaryActionLabel = 'Select';
      this.activeTab = 1;
      // this.libraryImages = [];
    } else if (tab['id'] === 2) {
      this.fileList = [];
      this.tagSet = [];
      this.imagePreview = [];
      this.allImagesInfo = [];
      this.activeTab = 2;
      this.isImageNotSelected = true;
      this.primaryActionLabel = 'Submit';
    } else {
      return;
    }
  }

  onImageSelect(imageInfo: any) {
    this.sendImage = imageInfo;
    if (this.isImageNotSelected) {
      this.isImageNotSelected = false;
    }
  }

  /**
   * @event
   * Converts images to dataURL to show preview
   * Upload images to BE
   */
  onFileSelected(event: Event) {
    if ((event.target as HTMLInputElement).files) {
      for (
        let i = 0;
        i < (event.target as HTMLInputElement).files.length;
        i++
      ) {
        const singleimage = (event.target as HTMLInputElement).files[i];
        this.fileList.push(singleimage);
        const eachImageInfo = {
          width: 0,
          height: 0,
          private: false,
          keywords: this.tagSet,
          filename: '',
          name: ''
        };
        this.allImagesInfo.push(eachImageInfo);
        const length = this.allImagesInfo.length - 1;
        this.allImagesInfo[length]['name'] = singleimage.name.replace(
          /\.[^/.]+$/,
          ''
        );
        this.allImagesInfo[length]['filename'] = singleimage.name;
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imagePreview.push(reader.result as string); // For preview
          this.isImageNotSelected = false; // allow to upload
        };
        reader.onerror = () => {
          this._toaster.toast('error', 'Failed', "Can't read file", true);
        };
        reader.readAsDataURL((event.target as HTMLInputElement).files[i]);
      }
      this.fileInput.nativeElement.value = ''; // clear to re-preview/re-select the file which were selected then deleted
    }
  }

  emitImageInfo(imageInfo) {
    // this.searchKeyword = "";
    if (imageInfo) {
      this.onSelect.emit(imageInfo);
      // this.close.nativeElement.click();
      // this.libraryImages = [];
    }
  }

  removeSelectedFile(index) {
    this.fileList.splice(index, 1);
    this.imagePreview.splice(index, 1);
    this.allImagesInfo.splice(index, 1);

    if (this.fileList.length < 1) {
      this.isImageNotSelected = true;
      this.tagSet = [];
    }
  }

  onTagSet(allTags) {
    this.tagSet = allTags;
    if (this.allImagesInfo.length > 0) {
      for (const eachImage of this.allImagesInfo) {
        eachImage['keywords'] = this.tagSet;
      }
    }
  }

  onTagRemove(allTags) {
    this.onTagSet(allTags);
  }

  onTagRemoveAll(tags) {
    this.onTagSet(tags);
  }

  onSelectAllTags(allTags) {
    this.onTagSet(allTags);
  }

  onDeselectAllTags(tags) {
    this.onTagSet(tags);
  }

  verifyImageNamesExist(imagesInfo): boolean {
    for (const image of imagesInfo) {
      if (!image.name) {
        return false;
      }
    }
    return true;
  }

  onUpload(mode) {
    if (this.verifyImageNamesExist(this.allImagesInfo)) {
      this.isImageNotSelected = true;
      this.imageService.onUpload(this.fileList, this.allImagesInfo).subscribe(
        (data) => {
          this.isImageNotSelected = false;
          if (data['status'] === 'success') {
            this._toaster.toast('success', 'Success', data['message'], true);
            const response = data['data']['images_info'];
            if (mode === 'lib') {
              this.showRecentUploaded(response);
            }
            if (this.isScadaTemplateView) {
              document.getElementById('imgLibraryRefresh').click();
              this.uploadModal.nativeElement.click();
            }
            if (mode === 'scada') {
              parent.postMessage('success', '*');
            }
            this.clearUploadState();
            this.isImageNotSelected = true;
          } else if (data['status'] === 'error') {
            this._toaster.toast('error', 'Failed', data['message'], true);
          }
        },
        (error) => {
          this.isImageNotSelected = false;
          this._toaster.toast('error', 'Failed', 'Upload failed', true);
          if (mode === 'scada') {
            parent.postMessage('failed', '*');
          }
        }
      );
    } else {
      this._toaster.toast(
        'error',
        'Failed',
        'Image names cannot be empty.',
        true
      );
    }
  }

  clearUploadState() {
    this.fileList = [];
    this.tagSet = [];
    this.imagePreview = [];
    this.allImagesInfo = [];
  }

  onModalClose() {
    parent.postMessage('cancel', '*');
    this.clearUploadState();
    this.isImageNotSelected = true;
  }

  onGalleryClose() {
    this.onCancel.emit('cancel');
  }

  showRecentUploaded(response) {
    const uploadedImages = [];
    for (const eachImageInfo of response) {
      uploadedImages.push(eachImageInfo);
    }
    if (uploadedImages) {
      this.libraryImages = uploadedImages;
    }
  }
}
