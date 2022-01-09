import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BehaviorSubject, catchError, map, Observable, of, startWith } from 'rxjs';
import { DataState } from './enum/data-state.enum';
import { AppState } from './interface/app-state';
import { CommonResponse } from './interface/common-response';
import { Team } from './interface/team';
import { NotificationService } from './service/notification.service';
import { TeamService } from './service/team.service';

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
  private dataSubject = new BehaviorSubject<CommonResponse>(null!);

  constructor(private teamService: TeamService, private notifier: NotificationService) { }


  ngOnInit(): void {
    this.appState$ = this.teamService.teams$
      .pipe(
        map(response => {
          this.notifier.onDefault(response.message);
          this.dataSubject.next(response);
          return { dataState: DataState.LOADED_STATE, appData: response }
        }),
        startWith({ dataState: DataState.LOADING_STATE }),
        catchError((error: string) => {
          this.notifier.onError(error);
          return of({ dataState: DataState.ERROR_STATE, error: error })
        })
      );
  }

  saveTeam(teamForm: NgForm): void {
    this.isLoading.next(true);
    this.appState$ = this.teamService.save$(teamForm.value as Team)
      .pipe(
        map(response => {
          this.dataSubject.next(
            { ...response, data: { teams: [response.data.team!, ...this.dataSubject.value.data.teams!] } }
          );
          this.notifier.onDefault(response.message);
          document.getElementById('closeModal')!.click();
          this.isLoading.next(false);
          return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
        }),
        startWith({ dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }),
        catchError((error: string) => {
          this.isLoading.next(false);
          this.notifier.onError(error);
          return of({ dataState: DataState.ERROR_STATE, error });
        })
      );
  }

  deleteTeam(team: Team): void {
    this.appState$ = this.teamService.delete$(team.id)
      .pipe(
        map(response => {
          this.dataSubject.next(
            {
              ...response, data:
                { teams: this.dataSubject.value.data.teams!.filter(s => s.id !== team.id) }
            }
          );
          this.notifier.onDefault(response.message);
          return { dataState: DataState.LOADED_STATE, appData: this.dataSubject.value }
        }),
        startWith({ dataState: DataState.LOADING_STATE }),
        catchError((error: string) => {
          this.notifier.onError(error);
          return of({ dataState: DataState.ERROR_STATE, error });
        })
      );
  }

}

