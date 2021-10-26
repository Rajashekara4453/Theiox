import * as CryptoJS from 'crypto-js';
import { Injectable } from '@angular/core';
import { Config } from '../config/config';
@Injectable()
export class UtilityFunctions {
  constructor() {}

  sessionValue: String = '';
  intialSessionId: any;
  currentSessionId: any = '';
  isSessionTimeOut: boolean = false;
  //  key = CryptoJS.enc.Hex.parse('36ebe205bcdfc499a25e6923f4450fa8');
  //  iv  = CryptoJS.enc.Hex.parse('be410fea41df7162a679875ec131cf2c');

  tokenFromUI: string = '0123456789123456';

  domainAddress: string;
  domainIP: string;
  protocol: string;
  currAppMode: string;

  public set serverAddress(address: string) {
    this.domainAddress = address;
  }

  public get serverAddress() {
    return this.domainAddress;
  }

  public set serverIP(address: string) {
    this.domainIP = address;
  }

  public get serverIP() {
    return this.domainIP;
  }

  public set transferProtocol(protocol: string) {
    this.protocol = protocol;
  }

  public get transferProtocol() {
    return this.protocol;
  }

  public set appMode(appMode: string) {
    this.currAppMode = appMode;
  }

  public get appMode() {
    return this.currAppMode;
  }

  getSessionKey() {
    return 'ninjasecret88';
  }

  encrypt(encData) {
    const key = this.getSessionKey();
    encData = JSON.stringify(encData);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(encData, key, {
      iv: iv
    });
    return iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
  }

  encryptIntially(encData) {
    // encrypting Intially to check session time out
    this.isSessionTimeOut = false;
    // this.setIntialCokkiesIntialy();
    const key = this.getSessionKey();
    encData = JSON.stringify(encData);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(encData, key, {
      iv: iv
    });
    return iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
  }

  decrypt(ciphertextStr) {
    const key: any = this.getSessionKey();
    const ciphertext = CryptoJS.enc.Base64.parse(ciphertextStr);
    const iv = ciphertext.clone(); // split IV and ciphertext
    iv.sigBytes = 16;
    iv.clamp();
    ciphertext.words.splice(0, 4); // delete 4 words = 16 bytes
    ciphertext.sigBytes -= 16;
    const decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertext }, key, {
      iv: iv
    });
    console.log('utility', decrypted.toString(CryptoJS.enc.Utf8));
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  encryptThroughKey(encData, keyAccess: string) {
    encData = JSON.stringify(encData);
    const iv = CryptoJS.lib.WordArray.random(16);
    const encrypted = CryptoJS.AES.encrypt(encData, keyAccess, {
      iv: iv
    });
    return iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
  }

  decryptThroughKey(ciphertextStr, keyAccess: string) {
    const ciphertext = CryptoJS.enc.Base64.parse(ciphertextStr);
    const iv = ciphertext.clone();
    iv.sigBytes = 16;
    iv.clamp();
    ciphertext.words.splice(0, 4); // delete 4 words = 16 bytes
    ciphertext.sigBytes -= 16;
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: ciphertext },
      keyAccess,
      {
        iv: iv
      }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  }

  // sessionTImeCheck() {
  //   if( this.getCurrentSessionIdKey() ==''){
  //     this.isSessionTimeOut = true;

  //   }
  //   else if (this.getintialSessionIdKey() !== this.getCurrentSessionIdKey()) {
  //     this.isSessionTimeOut = true;
  //   } else {
  //     this.isSessionTimeOut = false;
  //   }
  // }

  private setCookie(name: string, value: string) {
    document.cookie = `${name}=${value}`;
  }

  // Encryption for password - Varsha
  encryptByHash(data: string, key: string) {
    // return CryptoJS.SHA1(data).toString();
    return CryptoJS.HmacSHA1(data, key).toString();
  }

  private deleteCookie(name: string) {
    document.cookie =
      name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
  encryptData(encData) {
    // encData = "hello"
    const _key = CryptoJS.enc.Utf8.parse(this.tokenFromUI);
    const _iv = CryptoJS.enc.Utf8.parse(this.tokenFromUI);
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(encData), _key, {
      keySize: 16,
      iv: _iv,
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    return encrypted
      .toString()
      .replace(/\+/g, 'xMl3Jk')
      .replace(/\//g, 'Por21Ld')
      .replace(/=/g, 'Ml32');
  }

  decryptData(decrypData) {
    if (decrypData !== undefined) {
      decrypData = decrypData
        .replace(/xMl3Jk/g, '+')
        .replace(/Por21Ld/g, '/')
        .replace(/Ml32/g, '=');
      const _key = CryptoJS.enc.Utf8.parse(this.tokenFromUI);
      const _iv = CryptoJS.enc.Utf8.parse(this.tokenFromUI);

      return CryptoJS.AES.decrypt(decrypData, _key, {
        keySize: 16,
        iv: _iv,
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      })
        .toString(CryptoJS.enc.Utf8)
        .replace(/"/g, '');
    } else {
      return;
    }
  }

  encodeStringBase64(data: string) {
    // var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    // encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/++[++^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}
    // let encodedString = Base64.encode(data);
    // let encodedString =  btoa(data);......
    // console.log(encodedString);
    // return encodedString;

    // return encodeURIComponent(data).replace(/[!'()*]/g, (c) => {
    //   return '%' + c.charCodeAt(0).toString(16)
    // })
    console.log(btoa(data));
    return btoa(data);
  }

  decodeStringBase64(data: string) {
    // let base64 = {_keyStr:'ZWxuZXQtN2J5ZWxtZWFzdXJl'};
    // var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    // encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/++[++^A-Za-z0-9+/=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

    // var decodedString = Base64.decode(data);
    // let decodedString = atob(data);..........
    // console.log(decodedString);
    // return decodedString;
    console.log(atob(data));
    return atob(data);
  }

  // Login - User profiles encryption methods - working

  encryptCryptoAES(data, key) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), key);
  }

  decryptCryptoAES(data: string, key: string) {
    return CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8);
  }

  mqttSettings(data) {
    if (data.hasOwnProperty('MQTT')) {
      // ALL MQTT SETTINGS START
      if (this.appMode === 'server') {
        Config.CONSTANTS.MQTT.ip = this.serverIP;
        if (this.transferProtocol === 'https') {
          Config.CONSTANTS.MQTT.useSSL = true;
        } else {
          Config.CONSTANTS.MQTT.useSSL = false;
        }
        console.log(
          'Server mode... Config.CONSTANTS.MQTT.ip',
          Config.CONSTANTS.MQTT.ip
        );
      } else {
        if (data['MQTT'].hasOwnProperty('ip') && data['MQTT']['ip'] !== '') {
          Config.CONSTANTS.MQTT.ip = data['MQTT'].ip;
          console.log('Config.CONSTANTS.MQTT.ip', Config.CONSTANTS.MQTT.ip);
        }
        if (
          data['MQTT'].hasOwnProperty('useSSL') &&
          data['MQTT']['useSSL'] !== ''
        ) {
          Config.CONSTANTS.MQTT.useSSL = data['MQTT'].useSSL;
        }
      }
      if (data['MQTT'].hasOwnProperty('port') && data['MQTT']['port'] !== '') {
        Config.CONSTANTS.MQTT.port = data['MQTT'].port;
      }
      if (
        data['MQTT'].hasOwnProperty('userName') &&
        data['MQTT']['userName'] !== ''
      ) {
        Config.CONSTANTS.MQTT.userName = data['MQTT'].userName;
      }
      if (
        data['MQTT'].hasOwnProperty('password') &&
        data['MQTT']['password'] !== ''
      ) {
        Config.CONSTANTS.MQTT.password = data['MQTT'].password;
      }
    }
  }
}
