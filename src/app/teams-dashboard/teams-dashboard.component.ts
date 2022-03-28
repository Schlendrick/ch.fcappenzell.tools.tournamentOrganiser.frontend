import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, NgForm } from '@angular/forms';
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
  formValue !: FormGroup;
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();
  private dataSubject = new BehaviorSubject<CommonResponse>(null!);

  constructor(private teamService: TeamService, private frombuilder: FormBuilder, private notifier: NotificationService) { }

  ngOnInit(): void {
    this.formValue = this.frombuilder.group({
      name: [''],
      category: [''],
      firstName: [''],
      lastName: [''],
      email: [''],
      mobile: [''],
      categroy: ['']
    })

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

  createTeam(teamForm: NgForm): void {
    this.isLoading.next(true);
    this.appState$ = this.teamService.create$(teamForm.value as Team)
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

  onEditTeam(team: Team): void {
    this.formValue.controls['name'].setValue(team.name);
    this.formValue.controls['category'].setValue(team.category);
    this.formValue.controls['firstName'].setValue(team.captain.firstName);
    this.formValue.controls['lastName'].setValue(team.captain.lastName);
  }

  updateTeam(): void {
    this.isLoading.next(true);
    this.appState$ = this.teamService.update$(this.formValue.value as Team)
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
