import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';

@Injectable()
export class DataSharingService {
  private messageMenuDataSource = new BehaviorSubject('start');
  currentMenuData = this.messageMenuDataSource.asObservable();

  // user-management - Theme
  private userThemeDataSource = new BehaviorSubject('theme-default');
  currentUserTheme = this.userThemeDataSource.asObservable();

  // config-bread-crumb - Bread Crumb Title
  private breadCrumbTitleDataSource = new BehaviorSubject('');
  breadCrumbTitle = this.breadCrumbTitleDataSource.asObservable();

  // Custom-Multi-Select - Filtered Data Selected
  private isCustomMultiSelectFilteredDataSelectedDataSource = new BehaviorSubject(
    false
  );
  isCustomMultiSelectFilteredDataSelected = this.isCustomMultiSelectFilteredDataSelectedDataSource.asObservable();

  // Dashboard -Widget Counter
  private widgetCounterDataSource = new BehaviorSubject(1);
  widgetCount = this.widgetCounterDataSource.asObservable();

  // Emit an event to dashboard breadcrumb
  private pinFilterDataSource = new BehaviorSubject(false);
  getEventpinFilter = this.pinFilterDataSource.asObservable();

  constructor() {}

  change(message: any) {
    this.messageMenuDataSource.next(message);
  }

  // user-management - Theme
  userThemeDataSharing(userTheme: any) {
    this.userThemeDataSource.next(userTheme);
  }

  // config-bread-crumb - Bread Crumb Title
  breadCrumbTitleUpdate(currentPageInfo: any) {
    this.breadCrumbTitleDataSource.next(currentPageInfo);
  }

  // Custom-Multi-Select - Filtered Data Selected
  isFilteredDataSelectedChange(isSelected: boolean) {
    this.isCustomMultiSelectFilteredDataSelectedDataSource.next(isSelected);
  }

  // Dashboard -Widget Counter
  dashboardWidgetCount(count: number) {
    this.widgetCounterDataSource.next(count);
  }

  // Emit an event to dashboard breadcrumb
  sendEventpinFilter(applyClass: any) {
    this.pinFilterDataSource.next(applyClass);
  }
}
