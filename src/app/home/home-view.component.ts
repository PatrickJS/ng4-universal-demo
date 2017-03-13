import { Component, OnInit } from '@angular/core';
import { TransferHttp } from '@angularclass/universal-transfer-state';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/first';

@Component({
  selector: 'home-view',
  template: `
    <h3>{{ data }}</h3>
  `
})
export class HomeView implements OnInit {
  public subs: Observable<string>;
  data;

  constructor(private http: TransferHttp) {}

  ngOnInit() {
    this.http.get('http://localhost:8000/data')
    .first()
    .map(data => {
      return `${ data.greeting } ${ data.name }`;
    })
    .subscribe(data => this.data = data);
  }
}
