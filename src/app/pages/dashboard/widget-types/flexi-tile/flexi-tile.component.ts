import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'kl-flexi-tile',
  templateUrl: './flexi-tile.component.html',
  styleUrls: ['./flexi-tile.component.scss']
})
export class FlexiTileComponent implements OnInit {
  @Input() cData: object = {};
  @Input() blockData: Array<any> = [];
  @Input() noOfBlocksToSwapOnInterval: number;
  @Input() noOfTagsToSwapOnInterval: number;
  @Input() isShowUnit: boolean;
  @Input() isHeader:boolean;
  @Input() isShowControls: boolean;
  @Input() selectedTag: string = "";
  @Input() maxDecimalPoint: number;
  @Output() currentBlockData: EventEmitter<object> = new EventEmitter<object>();
  showData: Boolean = true;
  arrBlocks: Array<any> = [];
  startIndex: number;
  endIndex: number;
  isStart: boolean = true;
  arrSwapTileTags: Array<any> = [];
  currentBlockName: string = "";
  currentBlockIndex: number;
  isPlay: boolean = true;
  showPercent: boolean = true;

  progressTag=[];
  progressTagTitle: any;
  constructor() { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.hasOwnProperty('cData')) {
      this.currentBlockIndex = this.cData["index"];
      if (this.currentBlockIndex == undefined) {
        this.currentBlockIndex = 0;
        this.currentBlockData.emit({ index: this.currentBlockIndex, isClicked: true });
      }
      this.selectedTag != 'all' ? this.updateResponseToFormatForDevices() : this.updateResponseToFormatForAll();
      this.swapBlocksAndTags();
    }
  }

  swapBlocksAndTags() {
    if (this.isPlay) {
      this.currentBlockName = this.cData.hasOwnProperty('index') ? this.blockData[this.cData["index"]].name : "";
      if (this.arrBlocks.length > 0) {
        if (this.arrBlocks.length <= this.noOfBlocksToSwapOnInterval) {
          this.startIndex = 0;
          this.endIndex = this.arrBlocks.length;
        }
        else {
          this.startIndex = this.isStart ? 0 : this.startIndex + this.noOfBlocksToSwapOnInterval;
          this.endIndex = this.isStart ? this.noOfBlocksToSwapOnInterval - 1 : this.endIndex + this.noOfBlocksToSwapOnInterval;
          this.isStart = this.endIndex >= this.arrBlocks.length - 1 ? true : false;
        }

        for (let i = this.startIndex; i <=this.endIndex; i++) {
          if (typeof this.arrBlocks[i] !== "undefined" && this.arrBlocks[i].hasOwnProperty('tagsData') && this.arrBlocks[i]["tagsData"].length > 0) {
            if (this.arrBlocks[i]["tagsData"].length <= this.noOfTagsToSwapOnInterval) {
              if (typeof this.arrSwapTileTags[i] === 'undefined') {
                let obj = {};
                obj["isStart"] = true;
                obj["startIndex"] = 0;
                obj["endIndex"] = this.arrBlocks[i]["tagsData"].length;
                obj["isStart"] = obj["endIndex"] >= this.arrBlocks[i]["tagsData"].length - 1 ? true : false;
                this.arrSwapTileTags.splice(i, 0, obj);
              }
              else {
                this.arrSwapTileTags[i]["startIndex"] = 0;
                this.arrSwapTileTags[i]["endIndex"] = this.arrBlocks[i]["tagsData"].length;
                this.arrSwapTileTags[i]["isStart"] = this.arrSwapTileTags[i]["endIndex"] >= this.arrBlocks[i]["tagsData"].length - 1 ? true : false;
              }
            }
            else {
              if (typeof this.arrSwapTileTags[i] === 'undefined') {
                let obj = {};
                obj["isStart"] = true;
                obj["startIndex"] = obj["isStart"] ? 0 : obj["startIndex"] + this.noOfTagsToSwapOnInterval;
                obj["endIndex"] = obj["isStart"] ? this.noOfTagsToSwapOnInterval - 1 : obj["endIndex"] + this.noOfTagsToSwapOnInterval;
                obj["isStart"] = obj["endIndex"] >= this.arrBlocks[i]["tagsData"].length - 1 ? true : false;
                this.arrSwapTileTags.splice(i, 0, obj);
              }
              else {
                this.arrSwapTileTags[i]["startIndex"] = this.arrSwapTileTags[i]["isStart"] ? 0 : this.arrSwapTileTags[i]["startIndex"] + this.noOfTagsToSwapOnInterval;
                this.arrSwapTileTags[i]["endIndex"] = this.arrSwapTileTags[i]["isStart"] ? this.noOfTagsToSwapOnInterval - 1 : this.arrSwapTileTags[i]["endIndex"] + this.noOfTagsToSwapOnInterval;
                this.arrSwapTileTags[i]["isStart"] = this.arrSwapTileTags[i]["endIndex"] >= this.arrBlocks[i]["tagsData"].length - 1 ? true : false;
              }
            }
          }
          if (i == this.endIndex - 1 && this.endIndex >= this.arrBlocks.length-1 && this.arrSwapTileTags.length > 0 && this.arrSwapTileTags[i] != 'undefined' && this.arrSwapTileTags[i] != null && this.arrSwapTileTags[i].hasOwnProperty("isStart") && this.arrSwapTileTags[i]["isStart"] == true) {
            this.currentBlockIndex = this.currentBlockIndex + 1 >= this.blockData.length ? 0 : this.currentBlockIndex + 1;
            this.currentBlockData.emit({ index: this.currentBlockIndex, isClicked: false });
          }
        }
      }
    }
  }

  calculateValue(block: any) {
    block.differencedValue = block.previousValue - block.currentValue;
    if (block.differencedValue >= 0) {
      block.isPositive = true;
      block.percentageVal = ((block.differencedValue / block.previousValue) * 100).toFixed(this.maxDecimalPoint);
    } else {
      block.isPositive = false;
      block.percentageVal = (((block.differencedValue * -1) / block.currentValue) * 100).toFixed(this.maxDecimalPoint);
    }
    block.percentageVal = (block.percentageVal && block.percentageVal !== 'NaN') ? block.percentageVal : 0.0;
  }

  updateResponseToFormatForDevices() {
    this.arrBlocks = [];
    let arrTempBlocks = [];
    if (this.cData.hasOwnProperty('category') && this.cData["category"].length > 0) {
      this.cData["category"].forEach(element => {
        let objBlock = {};
        objBlock["name"] = element;
        objBlock["bgColor"] = "#ffffff"
        objBlock["tagsData"] = [];
        objBlock["hasTags"] = false;
        objBlock["comparisonCount"] = 0;
        objBlock["isShowProgressBar"] = this.blockData[this.currentBlockIndex].isShowProgressBar;
        objBlock["progressValue"] = 0;
        objBlock["progressBarColor"] = "";
        if (this.cData.hasOwnProperty('series') && this.cData["series"].length > 0) {
          this.cData["series"].forEach(tagElement => {
            if (!(tagElement.name.split('_').length > 0 && tagElement.name.split('_')[1] == 'compare')) {
              if(tagElement.tag.hasOwnProperty('isProgressTag')){
                let objTag: object = {};
                objTag = this.createTagObjForDevices(tagElement, objBlock, element);
                if(this.blockData[this.currentBlockIndex].selectedProgressTag.length ==2 && tagElement.tag.hasOwnProperty('isProgressTag')) {
                  objBlock["progressValue"] = this.getProgressBarValue(element);
                } else {
                  objBlock["progressValue"] = objTag["currentValue"] != '-' ? objTag["currentValue"] : 0;
                  this.progressTagTitle =this.blockData[this.currentBlockIndex].progressTag.label;
                }
                objBlock["progressBarColor"] = this.blockData[this.currentBlockIndex].selectedProgressTag[0].color;
                if(tagElement.tag.hasOwnProperty('isBlockTag')) objBlock["tagsData"].push(objTag);
              }
              else{
                objBlock["tagsData"].push(this.createTagObjForDevices(tagElement, objBlock, element));
              }
            }
            else {
              if (tagElement.hasOwnProperty('data') && tagElement.data.length > 0) {
                tagElement.data.forEach(dataElement => {
                  if (dataElement.length > 0 && dataElement[0] == element) {
                    objBlock["tagsData"].forEach(tags => {
                      if (tags.tag == tagElement.name.split('_')[0]) {
                        tags['previousValue'] = dataElement[1].toFixed(this.maxDecimalPoint);
                      }
                    });
                  }
                });
              }
            }
          });
        }
        objBlock["hasTags"] = objBlock["tagsData"].length > 0 ? true : false;
        arrTempBlocks.push(objBlock);
      });
    }
    this.arrBlocks = arrTempBlocks;
  }

  createTagObjForDevices(tagElement: any, objBlock: any, element: string): object{
    let objTag: object = {};
    objTag["tag"] = tagElement.name;
    objTag["unit"] = tagElement.unit;
    objTag["inverse"] = tagElement.isInverse;
    objTag["isComparisonRequired"] = tagElement.isComparisonRequired;
    if (tagElement.isComparisonRequired == true) objBlock["comparisonCount"]++;
    objTag["isPositive"] = false;
    objTag["currentValue"] = "";
    objTag["percentageVal"] = 0;
    if (tagElement.hasOwnProperty('data') && tagElement.data.length > 0) {
      tagElement.data.forEach(dataElement => {
        if (dataElement.length > 0 && dataElement[0] == element) {
          objTag["currentValue"] = dataElement[1].toFixed(this.maxDecimalPoint);
        }
      });
    }
    objTag["currentValue"] = objTag["currentValue"] == "" ? "-" : objTag["currentValue"];
    objTag["unit"] = objTag["currentValue"] == "-" ? "" : objTag["unit"];
    return objTag;
  }

  updateResponseToFormatForAll() {
    this.arrBlocks = [];
    let arrTempBlocks = [];
    this.blockData.forEach(element => {
      let objBlock = {};
      objBlock["name"] = element.name;
      objBlock["bgColor"] = "#ffffff"
      objBlock["tagsData"] = [];
      objBlock["hasTags"] = false;
      objBlock["comparisonCount"] = 0;
      element.tags.forEach(tagElement => {
        if (this.cData.hasOwnProperty('series') && this.cData["series"].length > 0) {
          this.cData["series"].forEach(seriesElement => {
            if (!(seriesElement.name.split('_').length > 0 && seriesElement.name.split('_')[1] == 'compare')) {
              if (tagElement.name == seriesElement.name) {
                let objTag = {};
                objTag["tag"] = seriesElement.name;
                objTag["unit"] = seriesElement.unit;
                objTag["inverse"] = seriesElement.isInverse;
                objTag["isComparisonRequired"] = seriesElement.isComparisonRequired;
                if (tagElement.isComparisonRequired == true) objBlock["comparisonCount"]++;
                objTag["isPositive"] = false;
                objTag["currentValue"] = "";
                objTag["percentageVal"] = 0;
                if (seriesElement.hasOwnProperty('data') && seriesElement.data.length > 0) {
                  seriesElement.data.forEach(dataElement => {
                    objTag["currentValue"] = objTag["currentValue"] == "" ? 0 + Number(dataElement[1]) : objTag["currentValue"] + Number(dataElement[1]);
                  });
                }
                objTag["currentValue"] = objTag["currentValue"] == "" ? "-" : objTag["currentValue"].toFixed(this.maxDecimalPoint);
                objTag["unit"] = objTag["currentValue"] == "-" ? "" : objTag["unit"];
                objBlock["tagsData"].push(objTag);
              }
            }
            else {
              if (tagElement.name == seriesElement.name.split('_')[0]) {
                let previousValue: any = "";
                if (seriesElement.hasOwnProperty('data') && seriesElement.data.length > 0) {
                  seriesElement.data.forEach(dataElement => {
                    previousValue = previousValue == "" ? 0 + Number(dataElement[1]) : previousValue + Number(dataElement[1]);
                  });
                }
                previousValue = previousValue == "" ? "-" : previousValue.toFixed(this.maxDecimalPoint);
                objBlock["tagsData"].forEach(tags => {
                  if (tags.tag == seriesElement.name.split('_')[0]) {
                    tags['previousValue'] = previousValue;
                  }
                });
              }
            }
          });
        }
      });
      objBlock["hasTags"] = objBlock["tagsData"].length > 0 ? true : false;
      arrTempBlocks.push(objBlock);
    });
    this.arrBlocks = arrTempBlocks;
  }

  handleBlockNameClicked(index: number) {
    this.isPlay = true;
    this.currentBlockIndex = index;
    this.currentBlockData.emit({ index: this.currentBlockIndex, isClicked: true });
  }

  getComparisonOfCountOne(block) {
    if (block["comparisonCount"] == 1) {
      block["tagsData"].forEach(tags => {
        if (tags["isComparisonRequired"] == true) {
          block["percentageVal"] = tags.percentageVal;
          block["inverse"] = tags.inverse;
          block["isPositive"] = tags.isPositive;
        }
      });
    }
  }

  getProgressBarValue(element) {
    let count =0;
    let progressTag1;
    let progressTag2;
    this.showPercent = false;
    const data = this.blockData[this.currentBlockIndex].selectedProgressTag;
    this.cData["series"].forEach(tagElement => {
      if(tagElement.tag.hasOwnProperty('isProgressTag') && !tagElement.name.includes("compare")){
        if(tagElement.tag.value==data[count].tag.value && progressTag1== undefined) {
          this.progressTagTitle = data[count].tag.label;
          tagElement.data.forEach(ele => {
            if(ele[0] == element) {
              progressTag1 = ele[1].toFixed(this.maxDecimalPoint);
            }
          });
          count++;
        }
        if(tagElement.hasOwnProperty("tag") && tagElement.tag.value == data[count].tag.value) {
          this.progressTagTitle = this.progressTagTitle + " / "+ data[count].tag.label;
          tagElement.data.forEach(ele => {
            if(ele[0] == element) {
              progressTag2 = ele[1].toFixed(this.maxDecimalPoint);
            }
          });
        }
      }
    });
        if(progressTag1!= 0 && progressTag1!=0) {return progressTag1 + "/" + progressTag1;}
        else {return 0;}
        
      }
    
  handlePlayPauseClick() {
    this.isPlay = !this.isPlay;
  }

  handleBackClick(){
    if(this.startIndex >= 0){
      this.startIndex-=this.noOfBlocksToSwapOnInterval;
      this.endIndex-=this.noOfBlocksToSwapOnInterval;
    }
  }

  handleForwardClick(){
    if(this.arrBlocks.length != this.endIndex){
      this.startIndex+= this.noOfBlocksToSwapOnInterval;
      this.endIndex+=this.noOfBlocksToSwapOnInterval;
    }
  }

}
