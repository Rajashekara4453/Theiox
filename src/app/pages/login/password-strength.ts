import { Component, OnInit, Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

@Injectable()
export class PasswordStrength {

  constructor() { }


  public passwordValidator(control: AbstractControl): ValidationErrors {
    let password: string = control.value || '';
    if (!password) {
      return null
    }
    let upperCaseCharacters = /[A-Z]+/g
    let lowerCaseCharacters = /[a-z]+/g
    let numberCharacters = /[0-9]+/g
    let specialCharacters = /[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~]+/
    if (upperCaseCharacters.test(password) === false) {
      return { passwordStrength: `Must have at least 1 upper case characters` };
    }
    if (lowerCaseCharacters.test(password) === false) {
      return { passwordStrength: `Must have at least 1 lower case characters` };
    }
    if (numberCharacters.test(password) === false) {
      return { passwordStrength: `Must have at least 1 number characterse` };
    }
    if (specialCharacters.test(password) === false) {
      return { passwordStrength: `Must have at least 1 special character` };
    }
    return null;
  }

  public passordStrengthChecker(passed) {
    let content = '';
    let color = '';
    switch (passed) {
      case 0:
        content = "Weak";
        color = "darkred";
        return { content, color }
      case 1:
        content = "Average";
        color = "orangered"
        return { content, color }
      case 2:
        content = "Good";
        color = "orange"
        return { content, color }
      case 3:
        content = "Strong";
        color = "yellowgreen"
        return { content, color }
      case 4:
        content = "Very Strong";
        color = "green"
        return { content, color }
    }
  }

}
