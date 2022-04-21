import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, startWith } from 'rxjs';
import { PlayerService } from '../service/player.service';
import { DataState } from '../enum/data-state.enum';
import { AppState } from '../interface/app-state';
import { CommonResponse } from '../interface/common-response';
import { NotificationService } from '../service/notification.service';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { Player } from '../interface/team';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EditPlayerComponent } from '../edit-player/edit-player.component';

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

  constructor(private playerService: PlayerService, private frombuilder: FormBuilder, private notifier: NotificationService, private modalService: NgbModal) { }

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

  editPlayer(userModel: Player) {
    // this.router.navigateByUrl(`EditUser/${userModel.id}`);

    const ref = this.modalService.open(EditPlayerComponent, { centered: true });
    ref.componentInstance.selectedUser = userModel;

    ref.result.then((yes) => {
      console.log("Yes Click");


    },
      (cancel) => {
        console.log("Cancel Click");

      })
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
