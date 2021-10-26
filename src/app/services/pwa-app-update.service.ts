import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaAppUpdateService {
  constructor(public updates: SwUpdate) {
    if (updates.isEnabled) {
      interval(60000).subscribe(() =>
        updates
          .checkForUpdate()
          .then(() => console.log('checking for updates..'))
      );
    }
  }

  public checkForUpdates(): void {
    this.updates.available.subscribe((event) => this.promptUser());
  }

  promptUser(): void {
    this.updates.activateUpdate().then(() => document.location.reload());
  }
}
