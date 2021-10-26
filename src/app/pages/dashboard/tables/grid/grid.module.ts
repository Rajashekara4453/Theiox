import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ScrollingModule, ScrollDispatchModule } from '@angular/cdk/scrolling';
import { GridComponent } from './grid.component';
import { GridService } from './grid.service';
import { ColumnsearchPipe } from '../../../../utilities/pipes/columnsearch.pipe';

@NgModule({
  declarations: [GridComponent, ColumnsearchPipe],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ScrollingModule,
    ScrollDispatchModule,
  ],
  exports: [GridComponent],
  providers: [GridService],
})
export class GridModule { }
