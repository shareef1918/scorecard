import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private url = 'http://jsonplaceholder.typicode.com/posts';
  public boundariesBanner: Subject<any> = new Subject();
  constructor(private httpClient: HttpClient) { }

  getPosts() {
    return this.httpClient.get(this.url);
  }
}
