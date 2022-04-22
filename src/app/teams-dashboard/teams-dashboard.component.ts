import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BehaviorSubject, catchError, map, Observable, of, startWith } from 'rxjs';
import { TeamService } from '../service/team.service';
import { DataState } from '../enum/data-state.enum';
import { AppState } from '../interface/app-state';
import { CommonResponse } from '../interface/common-response';
import { Team } from '../interface/team';
import { NotificationService } from '../service/notification.service';

@Component({
  selector: 'app-teams-dashboard',
  templateUrl: './teams-dashboard.component.html',
  styleUrls: ['./teams-dashboard.component.css']
})
export class TeamsDashboardComponent implements OnInit {

  appState$!: Observable<AppState<CommonResponse>>;
  readonly DataState = DataState;
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();
  private dataSubject = new BehaviorSubject<CommonResponse>(null!);

  constructor(private teamService: TeamService, private notifier: NotificationService) { }

  public teams: Team[] | undefined;
  public editTeam: Team | undefined;
  public deleteTeam: Team | undefined;

  ngOnInit(): void {
    this.getTeams();
  }

  public getTeams(): void {
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

  public onAddTeam(addForm: NgForm): void {
    document.getElementById('add-team-form')!.click();
    this.isLoading.next(true);
    this.appState$ = this.teamService.create$(addForm.value as Team)
      .pipe(
        map(response => {
          this.dataSubject.next(
            { ...response, data: { teams: [response.data.team!, ...this.dataSubject.value.data.teams!] } }
          );
          this.notifier.onDefault(response.message);
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

  public onUpdateTeam(team: Team): void {
    this.isLoading.next(true);
    this.appState$ = this.teamService.update$(team)
      .pipe(
        map(response => {
          this.dataSubject.next(
            { ...response, data: { teams: [response.data.team!, ...this.dataSubject.value.data.teams!] } }
          );
          this.notifier.onDefault(response.message);
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

  public onDeleteTeam(team: Team | undefined): void {
    this.appState$ = this.teamService.delete$(team!.id)
      .pipe(
        map(response => {
          this.dataSubject.next(
            {
              ...response, data:
                { teams: this.dataSubject.value.data.teams!.filter(s => s.id !== team!.id) }
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

  public onOpenModal(team: Team | undefined, mode: string): void {
    const container = document.getElementById('main-container');
    const button = document.createElement('button');
    button.type = 'button';
    button.style.display = 'none';
    button.setAttribute('data-toggle', 'modal');
    if (mode === 'add') {
      button.setAttribute('data-target', '#addTeamModal');
    }
    if (mode === 'edit') {
      this.editTeam = team;
      button.setAttribute('data-target', '#updateTeamModal');
    }
    if (mode === 'delete') {
      this.deleteTeam = team;
      button.setAttribute('data-target', '#deleteTeamModal');
    }
    container!.appendChild(button);
    button.click();
  }

}
