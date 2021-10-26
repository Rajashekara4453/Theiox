import { Injectable } from '@angular/core';
import { element } from '@angular/core/src/render3';

@Injectable()
export class EchartUtilityFunctions {


colors= [
  "#7DBE41",
  "#12496E",
  "#BBBE64",
  "#6360AC",
  "#713C7C",
  "#D0739D",
  "#FF9031",
  "#0ABDAE",
  "#24A148",
  "#FD4782"
  ]
  saveChartAsImage(option: Boolean) {
    if (option) {
      return {};
    } else {
      return null;
    }
  }

  getLegendOptions(legendOpt) {
    let legend = {
      show: false
    };
    if (legendOpt && legendOpt.show) {
      legend['show'] = true;
      legend['type'] = 'scroll';
      switch (legendOpt.position) {
        case 'top':
          legend['left'] = 'center';
          break;
        case 'bottom':
          legend['bottom'] = 0;
          break;
        case 'left':
          legend['left'] = 0;
          legend['top'] = 'center';
          legend['orient'] = 'vertical';
          break;
        case 'right':
          legend['right'] = 0;
          legend['top'] = 'center';
          legend['orient'] = 'vertical';
          break;
        default:
          legend['left'] = 'center';
      }
    }
    return legend;
  }

  getXaxisLabel(xaxisOpt) {
    let label = '';
    if (!xaxisOpt || !xaxisOpt.label) {
      return label;
    }
    label = xaxisOpt.label;
    return label;
  }

  updateColor(arrSeries,colors) {
    let colorMap = {
      "null":null
    }
    for (let i = 0; i < arrSeries.length; i++) {
      colors.forEach(element => {
        if(arrSeries[i].hasOwnProperty('colorReference') &&arrSeries[i]['colorReference'] == element['reference']) {
          arrSeries[i]['color'] = element['value']==="null"?colorMap[element['value']]:element['value'];
        }
      });
    }
    return arrSeries;
  }

  public getDateTimeFormatted(epochTime, format) {
    if (!epochTime) {
      return '';
    }
    let date = new Date(Number(epochTime));
    let tmpMonth = String(date.getMonth() + 1);
    let tmpDay = String(date.getDate());
    let year = String(date.getFullYear());
    if (tmpMonth.length < 2) {
      tmpMonth = `0${tmpMonth}`
    }
    if (tmpDay.length < 2) {
      tmpDay = `0${tmpDay}`
    }
    let hh = String(date.getHours());
    let mm = String(date.getMinutes());
    let ss = String(date.getSeconds());
    hh = hh.length < 2 ? `0${hh}` : hh;
    mm = mm.length < 2 ? `0${mm}` : mm;
    ss = ss.length < 2 ? `0${ss}` : ss;
    let texts: string = '', time: string = '';
    texts = [tmpDay, tmpMonth, year].join('/');
    time = [hh, mm, ss].join(':')
    let formatedDate = texts + ' ' + time;
    switch (format) {
      case 'dd/MM/yyyy HH:mm:ss':
        formatedDate = [tmpDay, tmpMonth, year].join('/') + ' ' + [hh, mm, ss].join(':');
        break;
      case 'dd-MM-yyyy HH:mm:ss':
        formatedDate = [tmpDay, tmpMonth, year].join('-') + ' ' + [hh, mm, ss].join(':');
        break;
      case 'yyyy/MM/dd HH:mm:ss':
        formatedDate = [year, tmpMonth, tmpDay].join('/') + ' ' + [hh, mm, ss].join(':');
        break;
      case 'yyyy-MM-dd HH:mm:ss':
        formatedDate = [year, tmpMonth, tmpDay].join('-') + ' ' + [hh, mm, ss].join(':');
        break;
      case 'yyyy/dd/MM HH:mm:ss':
        formatedDate = [year, tmpDay, tmpMonth].join('/') + ' ' + [hh, mm, ss].join(':');
        break;
      case 'yyyy-dd-MM HH:mm:ss':
        formatedDate = [year, tmpDay, tmpMonth].join('-') + ' ' + [hh, mm, ss].join(':');
        break;
      case 'yyyy-dd-MM':
        formatedDate = [year, tmpDay, tmpMonth].join('-');
        break;
      case 'dd-MM-yyyy':
        formatedDate = [tmpDay, tmpMonth, year].join('-');
        break;

    }
    return formatedDate;
  }

    /**
   * Method for formating the date to the given formate
   * @param date date to convert
   * @param format date formate
   */
  getFormattedDateTime(date, format?): string {
    try {
      let dateVal = '';
      const day = (date.getDate() > 9) ? date.getDate() : ('0' + date.getDate());
      let month = date.getMonth() + 1;
      month = (month > 9) ? month : ('0' + month);
      const year = date.getFullYear();
      const HH = (date.getHours() > 9) ? date.getHours() : '0' + date.getHours();
      const MM = (date.getMinutes() > 9) ? date.getMinutes() : '0' + date.getMinutes();
      const SS = (date.getSeconds() > 9) ? date.getSeconds() : '0' + date.getSeconds();
      if (format) {
        switch (format) {
          case 'YYYY-MM-DD':
            dateVal = year + '-' + month + '-' + day;
            break;
          case 'YYYY/MM/DD':
            dateVal = year + '/' + month + '/' + day;
            break;
          case 'DD-MM-YYYY':
            dateVal = day + '-' + month + '-' + year;
            break;
          case 'DD/MM/YYYY':
            dateVal = day + '/' + month + '/' + year;
            break;
          case 'MM/DD/YYYY':
            dateVal = month + '/' + day + '/' + year;
            break;
          case 'DD-MM-YYYY HH:MM:SS':
            dateVal = day + '-' + month + '-' + year + ' ' + HH + ':' + MM + ':' + SS;
            break;
          case 'YYYY-MM-DD HH:MM:SS':
            dateVal = year + '-' + month + '-' + day + ' ' + HH + ':' + MM + ':' + SS;
            break;
          default:
            dateVal = year + '-' + month + '-' + day;
        }
      } else {
        dateVal = year + '-' + month + '-' + day;
      }
      return dateVal;
    } catch (error) {
      // console.log(error);
    }
  }

  getYaxisConfig(yaxisOpt, splitLineShow) {
    let showSplitLine = splitLineShow;
    if (splitLineShow) {
      showSplitLine = true;
    }
    
    let yaxisObj = {
      type: 'value',
      name: '',
      position: 'left',
      nameLocation: 'end',
      nameGap:15,
      nameRotate:20,
      offset:0,
      splitLine: {
        show: showSplitLine
      },
    }
    if(yaxisOpt[0]['isPf']) {
      yaxisObj['type'] = 'category';
      yaxisObj['data'] =[-0.1,-0.2,-0.3,-0.4,-0.5,-0.6,-0.7,-0.8,-0.9,1,0.9,0.8,0.7,0.6,0.5,0.4,0.3,0.2,0.1,0]
    }
    const offsetRange = 65;
    let yaxis = [];
    let yaxisIndex = {};
    if (!yaxisOpt) {
      return {
        yaxis: yaxisObj,
        yAxisIndex: yaxisIndex
      };
    }
    const yaxisPosData = {
      left: yaxisOpt.filter(el => el.position === 'left'),
      right: yaxisOpt.filter(el => el.position === 'right')
    }
    let j = 0;
    for (let pos in yaxisPosData) {
      const units = [];
      let i = 0;
      for (let axis of yaxisPosData[pos]) {
        if (units.indexOf(axis.unit) === -1 && axis['tag']!=null) {
          let obj = JSON.parse(JSON.stringify(yaxisObj));
          obj.name = axis.unit;
          obj.position = axis.position;
          obj.offset = offsetRange * i;
          const key = obj.position + '_' + obj.name;
          yaxisIndex[key] = j;
          i += 1;
          j += 1;
          yaxis.push(obj);
          units.push(axis.unit);
        }
         else 
           {
            let obj = {};
            yaxis.push(obj);
           }
      }
    }
    return {
      yaxis: yaxis,
      yAxisIndex: yaxisIndex
    };
  }

  getSeriesDataUpdatedWithYaxisIndex(series, yaxisIndex) {
    if (!series || !yaxisIndex || Object.keys(yaxisIndex).length < 1) {
      return series;
    }
    for (let eachSeries of series) {
      const key = eachSeries.position + '_' + eachSeries.unit;
      if (yaxisIndex[key] !== undefined) {
        eachSeries['yAxisIndex'] = yaxisIndex[key]
      }
    }
    return series;
  }

  //custom yaxisData for pf chart
  updateTreasholdAndBenchmarkToSeries(series,customyaxisdata?,isPf?) {
    if (!series) {
      return series;
    }
    for (let eachSeries of series) {
      if (!eachSeries.markLine) {
        eachSeries['markLine'] = {
          data: []
        }
      } else {
        if (!eachSeries.markLine.data) {
          eachSeries.markLine['data'] = [];
        }
      }
      if (eachSeries.threshold) {
        const thresholdLine = {
          yAxis: null,
          lineStyle: {
            type: 'dashed'
          },
          label: {
            position: 'middle',
            formatter: 'Threshold: ' + eachSeries.thresholdValue
          },
        };
        thresholdLine['yAxis']= !isPf?eachSeries.thresholdValue:customyaxisdata.indexOf(eachSeries.thresholdValue);
        eachSeries.markLine.data.push(thresholdLine)
      } 
      if (eachSeries.benchmark) {
        const benchmarkLine = {
          yAxis: null,
          lineStyle: {
            type: 'dotted'
          },
          label: {
            position: 'middle',
            formatter: 'Benchmark: ' + eachSeries.benchmarkValue
          },
        };
        benchmarkLine['yAxis']= !isPf?eachSeries.benchmarkValue:customyaxisdata.indexOf(eachSeries.benchmarkValue)
        eachSeries.markLine.data.push(benchmarkLine);
      }
    }         
    return series;
  }

  getShareDataSet(chartData) {
    let obj: object = {};
    obj['source'] = [];

    if (chartData.hasOwnProperty('category') && chartData['category'].length > 0) {
      let arrTag: Array<string> = [];
      arrTag[0] = 'Tags';
      chartData['category'].forEach(element => {
        arrTag.push(String(element));
      });
      obj['source'].push(arrTag);
    }

    if (chartData.hasOwnProperty('series') && chartData['series'].length > 0) {
      chartData['series'].forEach(element => {
        let arrEachTag: Array<string> = [];
        arrEachTag[0] = element.hasOwnProperty('name') ? element.name : '';
        if (element.hasOwnProperty('data') && element.data.length > 0) {
          element.data.forEach(subElement => {
            arrEachTag.push(subElement.length > 0 ? subElement[1] : 0);
          });
        }
        obj['source'].push(arrEachTag);
      });
    }

    return obj;
  }

  getShareDataSetSeries(series) {
    let arrSeries: Array<object> = [];
    for (let eachSeries of series) {
      let obj: object = {};
      obj['smooth'] = true;
      obj['seriesLayoutBy'] = 'row';
      obj['type'] = eachSeries.type;
      arrSeries.push(obj);
    }
    let dimension: string = (series.length > 0 ? (series[0].hasOwnProperty('data') && series[0].data.length > 0 ? (series[0].data[0].length > 0 ? String(series[0].data[0][0]) : String(0)) : String(0)) : String(0));
    arrSeries.push({
      type: 'pie',
      id: 'pie',
      radius: '30%',
      center: ['50%', '25%'],
      label: {
        formatter: '{b}: {@' + dimension + '} ({d}%)'
      },
      encode: {
        itemName: 'Tags',
        value: dimension,
        tooltip: dimension,
      }
    });

    return arrSeries;
  }

  getMarkLineForVisualMap(series, visualMap) {
    let markLine: object = {};
    markLine['silent'] = true;
    markLine['data'] = [];
    if (visualMap != null && visualMap['pieces'].length > 0) {
      for (let piece of visualMap['pieces']) {
        if (piece.hasOwnProperty('lte')) {
          let obj = {};
          obj['yAxis'] = piece.lte;
          markLine['data'].push(obj);
        }
      }
    }
    if (!series) {
      return series;
    }
    for (let eachSeries of series) {
      if (!eachSeries.markLine) {
        eachSeries['markLine'] = markLine;
        eachSeries['type'] = 'line';
      }
    }
    return series;
  }

  getMarkPointSeries(series) {
    if (!series) {
      return series;
    }
    for (let eachSeries of series) {
      if (!eachSeries.markLine) {
        eachSeries['markLine'] = {
          data: []
        };
      } 
      if (!eachSeries.markPoint) {
        eachSeries['markPoint'] = {
          data: []
        };
      }
      if(eachSeries.hasOwnProperty('markPointData') && eachSeries.markPointData != null && eachSeries.markPointData.length > 0){
        eachSeries.markPointData.forEach(element => {
          if(element != 'avg'){
            let obj = {};
            obj['type'] = element;
            obj['name'] = element == 'max' ? 'Max' : 'Min';
            eachSeries['markPoint'].data.push(obj);
          }
          else {
            let obj = {};
            obj['type'] = 'average';
            obj['name'] = 'Average';
            eachSeries['markLine'].data.push(obj);
          }
          eachSeries['type'] = 'line';
        });
      }
    }
    return series;
  }

  assignColorOnlyComparsion(arrSeries) {
    for (let i = 0; i < arrSeries.length; i++) {
      if(arrSeries[i].color=="null" ) {arrSeries[i].color = null } 
      for (let j = i+1; j < arrSeries.length; j++) {
        if(arrSeries[i].selectedTag == arrSeries[j].selectedTag){
          arrSeries[j].color = this.shadeColor1(arrSeries[i].color,30);
        }
      }
    }
    return arrSeries;
  }

  shadeColor1(color, percent) {	// deprecated. See below.
    if(color!= null) {
      var num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
      return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
    }
}

}
