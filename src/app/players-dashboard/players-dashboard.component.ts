import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, startWith } from 'rxjs';
import { PlayerService } from '../service/player.service';
import { DataState } from '../enum/data-state.enum';
import { AppState } from '../interface/app-state';
import { CommonResponse } from '../interface/common-response';
import { NotificationService } from '../service/notification.service';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { Player } from '../interface/team';

@Component({
  selector: 'app-players-dashboard',
  templateUrl: './players-dashboard.component.html',
  styleUrls: ['./players-dashboard.component.css']
})
export class PlayersDashboardComponent implements OnInit {

  appState$!: Observable<AppState<CommonResponse>>;
  readonly DataState = DataState;
  formValue !: FormGroup;
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();
  private dataSubject = new BehaviorSubject<CommonResponse>(null!);

  constructor(private playerService: PlayerService, private frombuilder: FormBuilder, private notifier: NotificationService) { }

  ngOnInit(): void {

    this.formValue = this.frombuilder.group({
      firstName: [''],
      lastName: [''],
      birthday: ['']
    })

    this.appState$ = this.playerService.players$
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

  onSubmit() {
    // TODO: Use EventEmitter with form value

  }

  createPlayer(playerForm: NgForm): void {
    this.isLoading.next(true);
    this.appState$ = this.playerService.create$(playerForm.value as Player)
      .pipe(
        map(response => {
          this.dataSubject.next(
            { ...response, data: { players: [response.data.player!, ...this.dataSubject.value.data.players!] } }
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

  onEditPlayer(player: Player): void {
    this.formValue.controls['First Name'].setValue(player.firstName);
    this.formValue.controls['Last Name'].setValue(player.lastName);
    this.formValue.controls['Birthday'].setValue(player.birthday);
    this.formValue.controls['Club Player'].setValue(player.clubPlayer);
  }

  updatePlayer(): void {
    this.isLoading.next(true);
    this.appState$ = this.playerService.update$(this.formValue.value as Player)
      .pipe(
        map(response => {
          this.dataSubject.next(
            { ...response, data: { players: [response.data.player!, ...this.dataSubject.value.data.players!] } }
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

  deletePlayer(player: Player): void {
    this.appState$ = this.playerService.delete$(player.id)
      .pipe(
        map(response => {
          this.dataSubject.next(
            {
              ...response, data:
                { players: this.dataSubject.value.data.players!.filter(s => s.id !== player.id) }
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
