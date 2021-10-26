import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { EditorMenuService } from '../../../../src/app/pages/webScada/editor/editor-services/editor-menu.service';
import { HandleGraphService } from '../../../../src/app/pages/webScada/editor/editor-services/handle-graph.service';

import { ToastrService } from '../../components/toastr/toastr.service';

@Component({
  selector: 'kl-scada-modals',
  templateUrl: './scada-modals.component.html',
  styleUrls: ['./scada-modals.component.scss']
})
export class ScadaModalsComponent implements OnInit {
  @ViewChild('importedFiles') importedFiles: ElementRef;
  @ViewChild('closeImportModal') closeImportModal: ElementRef;

  public exportfileName;
  public imageUploadSettings = {
    isUploadEnabled: true,
    isSingleSelection: false,
    isContentProjection: false
  };

  constructor(
    private _editorMenu: EditorMenuService,
    private _handleGraph: HandleGraphService,
    private _toastLoad: ToastrService
  ) {}

  ngOnInit() {}

  public textFile;
  importFilesIntoGraph(): void {
    const reader = new FileReader();
    if (this.importedFiles.nativeElement.value) {
      reader.onload = (e) => {
        const xml: any = e.target['result'];
        const doc = this._editorMenu.parseXmlToDoc(xml);
        this._handleGraph.graph.setSelectionCells(
          this._handleGraph.graph.importGraphModel(doc.documentElement)
        );
      };
      reader.onerror = (e) => {
        this._toastLoad.toast(
          'error',
          'Error',
          'Unable to read the file, please try again with a valid file.',
          true
        );
      };
      reader.readAsText(this.importedFiles.nativeElement.files[0]);
      this.closeDialog('import');
    } else {
      this._toastLoad.toast(
        'error',
        'Error',
        'Please select a file to import.',
        true
      );
    }
  }

  /**
   * Method to close modal
   * @param modalName Which modal need be closed.?
   */
  closeDialog(modalName): void {
    switch (modalName) {
      case 'import':
        this.closeImportModal.nativeElement.click();
        break;
    }
  }

  /**
   * Clear the choose file contents.
   */
  clearFileContent(): void {
    this.importedFiles.nativeElement.value = '';
  }

  /**
   * Clear the choose file contents.
   */
  clearExportFileName(): void {
    this.exportfileName = '';
  }

  exportFilesIntoGraph(): void {
    if (!this.exportfileName) {
      this._toastLoad.toast(
        'error',
        'Error',
        'Unable to export, please enter a valid Filename',
        true
      );
      return;
    }
    const dataForFile = this._editorMenu.getXmlForDownload();
    const data = new Blob([dataForFile], { type: 'text/xml' });
    const newLink = document.createElement('a');
    newLink.download = this.exportfileName;
    if (newLink.href !== null) {
      window.URL.revokeObjectURL(this.textFile);
    }
    newLink.href = window.URL.createObjectURL(data);
    newLink.click();
  }
}
