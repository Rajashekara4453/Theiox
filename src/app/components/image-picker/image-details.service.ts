import { Injectable } from '@angular/core';
import { AppService } from '../../services/app.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageDetailsService {
  constructor(private _appService: AppService) {}

  getAllImagesInfo(): Observable<any> {
    return this._appService.getAllImagesInfo({});
  }

  onUpload(fileList: any, allImgInfo: any): Observable<any> {
    const fd = new FormData();

    for (let i = 0; i < fileList.length; i++) {
      fd.append('file', fileList[i]);
    }
    fd.append('info', JSON.stringify(allImgInfo));

    return this._appService.uploadImagesAndData(fd);
  }
}
