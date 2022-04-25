import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of, startWith } from 'rxjs';
import { PlayerService } from '../service/player.service';
import { DataState } from '../enum/data-state.enum';
import { AppState } from '../interface/app-state';
import { CommonResponse } from '../interface/common-response';
import { NotificationService } from '../service/notification.service';
import { NgForm } from '@angular/forms';
import { Player } from '../interface/team';

@Component({
  selector: 'app-players-dashboard',
  templateUrl: './players-dashboard.component.html',
  styleUrls: ['./players-dashboard.component.css']
})
export class PlayersDashboardComponent implements OnInit {

  appState$!: Observable<AppState<CommonResponse>>;
  readonly DataState = DataState;
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();
  private dataSubject = new BehaviorSubject<CommonResponse>(null!);

  constructor(private playerService: PlayerService, private notifier: NotificationService) { }

  public createPlayer: Player = new Player();
  public editPlayer: Player = new Player();
  public deletePlayer: Player = new Player();

  ngOnInit(): void {
    this.getPlayers();
  }

  public getPlayers(): void {
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

  public onAddPlayer(addForm: NgForm): void {
    document.getElementById('add-player-form')!.click();
    this.isLoading.next(true);
    this.appState$ = this.playerService.create$(addForm.value as Player)
      .pipe(
        map(response => {
          this.dataSubject.next(
            { ...response, data: { players: [response.data.player!, ...this.dataSubject.value.data.players!] } }
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

  public onUpdatePlayer(player: Player): void {
    this.isLoading.next(true);
    this.appState$ = this.playerService.update$(player)
      .pipe(
        map(response => {
          const index = this.dataSubject.value.data.players?.findIndex(player => player.id === response.data.player?.id);
          this.dataSubject.value.data.players![index as number] = response.data.player!;
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

  public onDeletePlayer(player: Player | undefined): void {
    this.appState$ = this.playerService.delete$(player!.id)
      .pipe(
        map(response => {
          this.dataSubject.next(
            {
              ...response, data:
                { players: this.dataSubject.value.data.players!.filter(s => s.id !== player!.id) }
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


  public searchPlayers(key: string): void {
    console.log(key);
    const results: Player[] = [];
    for (const player of this.dataSubject.value.data.players!) {
      if (
        player.title.toLowerCase().indexOf(key.toLowerCase()) !== -1
        || player.firstName.toLowerCase().indexOf(key.toLowerCase()) !== -1
        || player.lastName.toLowerCase().indexOf(key.toLowerCase()) !== -1) {
        results.push(player);
      }
    }
    this.dataSubject.value.data.players = results;
    if (results.length === 0 || !key) {
      this.getPlayers();
    }
  }

  public onOpenModal(player: Player | undefined, mode: string): void {
    const container = document.getElementById('main-container');
    const button = document.createElement('button');
    button.type = 'button';
    button.style.display = 'none';
    button.setAttribute('data-toggle', 'modal');
    if (mode === 'add') {
      button.setAttribute('data-target', '#addPlayerModal');
    }
    if (mode === 'edit') {
      this.editPlayer = player as Player;
      button.setAttribute('data-target', '#updatePlayerModal');
    }
    if (mode === 'delete') {
      this.deletePlayer = player as Player;
      button.setAttribute('data-target', '#deletePlayerModal');
    }
    container!.appendChild(button);
    button.click();
  }

}
