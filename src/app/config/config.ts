const config = '';
const mainUrl = window.location.href;
const domain = window.location.host;
const baseUrlString = '';
export class Config {
  /**
   * Production Base Points
   */
  public static get BASE_POINT_API2(): String {
    return '/app2/';
  }
  public static get BASE_POINT_JSON(): String {
    return 'assets/static-data/';
  }
  public static get COLOR_LIST(): any {
    return this.ColorCodesList;
  } // getting the color list for editor
  /**
   * End Points Extension after Base Points
   */
  public static API: any = {};
  public static API_EL: any = {};

  // Json Base Points
  public static JSON: any = {};

  // Keys we need to use accross application. For logics and etc
  public static CONSTANTS: any = {
    SUCCESS: 'success',
    GAUGEMIN: 0,
    GAUGEMAX: 100000,
    MQTT: {
      ip: domain,
      port: '8083',
      userName: '',
      password: '',
      useSSL: false
    }
  };

  public static ColorCodesList: any = []; // color list valiable

  // Alert messages to show in Application
  public static ALERT_MESSAGES: any = {};
  /**
   * Method for generating random 1000 colors
   */
  public static setColorCodes() {
    if (this.ColorCodesList.length > 0) {
      return;
    }
    this.ColorCodesList = [];
    while (this.ColorCodesList.length <= 1000) {
      let color = this.getRandomColor();
      while (this.ColorCodesList.indexOf(color) > 0 || color.length !== 6) {
        color = this.getRandomColor();
      }
      this.ColorCodesList.push(color);
    }
  }

  public static getRandomColor() {
    return Math.floor(Math.random() * 16777215).toString(16);
    // return 'FF0000';
  }
}
