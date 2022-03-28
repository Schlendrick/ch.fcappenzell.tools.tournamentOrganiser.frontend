import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, } from 'rxjs';
import { DataState } from './enum/data-state.enum';
import { AppState } from './interface/app-state';
import { CommonResponse } from './interface/common-response';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  appState$!: Observable<AppState<CommonResponse>>;
  readonly DataState = DataState;
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();

  constructor() { }


  ngOnInit(): void {

  }


}

