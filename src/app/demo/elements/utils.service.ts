import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { HOST_NAME } from './teams.interface';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {
  constructor() {}

  generateId(): string {
    return `LV-${this.generateTimeStamp()}`;
  }

  generateTimeStamp() {
    return moment().unix();
  }

  generateUrl(url: string) {
    return `${HOST_NAME}${url}`;
  }

  generateTimeFormat(time: number): string {
    return moment.unix(time).format('MMMM Do YYYY, h:mm A');
  }
}
