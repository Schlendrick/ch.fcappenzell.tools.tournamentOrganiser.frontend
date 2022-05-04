import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BehaviorSubject, catchError, map, Observable, of, startWith } from 'rxjs';
import { TeamService } from '../service/team.service';
import { DataState } from '../enum/data-state.enum';
import { AppState } from '../interface/app-state';
import { CommonResponse } from '../interface/common-response';
import { Captain, Player, Team } from '../interface/team';
import { NotificationService } from '../service/notification.service';
import { faEdit, faFileImport, faTrash, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { readEml } from 'eml-parse-js';

@Component({
  selector: 'app-teams-dashboard',
  templateUrl: './teams-dashboard.component.html',
  styleUrls: ['./teams-dashboard.component.css']
})
export class TeamsDashboardComponent implements OnInit {

  // icons
  public faEdit = faEdit;
  public faTrash = faTrash;
  public faUserPlus = faUserPlus;
  public faFileImport = faFileImport;

  public draggedFiles: Array<File> = [];

  appState$!: Observable<AppState<CommonResponse>>;
  readonly DataState = DataState;
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();
  private dataSubject = new BehaviorSubject<CommonResponse>(null!);

  constructor(private teamService: TeamService, private notifier: NotificationService) { }

  public teams: Team[] | undefined;
  public editTeam: Team | undefined;
  public deleteTeam: Team | undefined;
  public validatedTeams: Team[] = [];

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


  public onFileChange(event: any) {
    if (event.target.files && event.target.files.length) {
      this.draggedFiles = Array.from(event.target.files);

      console.log(this.draggedFiles);

      this.draggedFiles.forEach(file => {
        file.text().then((eml: string) => {
          readEml(eml, (err, ReadedEmlJson) => {

            let text = ReadedEmlJson!.text

            if (text != null) {
              let team = new Team();
              team.name = this.regexer(/(?<=Mannschaftsname+[:]\s+)\S.*\S(?=\s*)/, text);
              team.category = this.regexer(/(?<=Kategorie:\s).*\S/, text);
              let comment = this.regexer(/(?<=allfällige Bemerkungen:\s).*\S/, text)
              if (comment) { team.comment = comment; }

              let captain = new Captain()
              captain.title = this.regexer(/(?<=Anrede+[:]\s*)\S.*\S(?=\s*(\r|\n))/, text);
              captain.firstName = this.regexer(/(?<=Captain:\s*\S.*\S\s*\s*\S.*\S\s*.*\S\s*Vorname:\s)\S.*\S/, text);
              captain.lastName = this.regexer(/(?<=Captain:\s*\S.*\S\s*\s*\S.*\S\s*.*\S\s*Name:\s)\S.*\S/, text);
              captain.street = this.regexer(/(?<=Strasse+[:]\s*)\S.*\S(?=\s*(\r|\n))/, text);
              //captain.plz = this.regexer(//, text);
              captain.plz = Number(this.regexer(/(?<=Ort+[:]\s*)\S.*\S(?=\s*(\r|\n))/, text).split(' ')[0]);
              captain.place = this.regexer(/(?<=Ort+[:]\s*)\S.*\S(?=\s*(\r|\n))/, text).split(' ')[1];
              captain.email = this.regexer(/(?<=E-Mail+[:]\s*)\S.*\S(?=\s*(\r|\n))/, text).split(' ')[0];
              captain.phone = this.regexer(/(?<=Telefon+[:]\s*)\S.*\S(?=\s*(\r|\n))/, text);
              team.captain = captain;

              team.players = [];
              let regExFirstName = new RegExp(/(?<=Spieler \d:\s*\S.*\S\s*Vorname:\s*)\S.*\S/, "g");
              let regExLastName = new RegExp(/(?<=Spieler \d:\s*Name:\s*)\S.*\S/, "g");
              let regExBirthday = new RegExp(/(?<=Spieler \d:\s*\S.*\S\s*\s*\S.*\S\s*Geburtsdatum:\s*)\S.*\S/, "g");
              let regExClubPlayer = new RegExp(/(?<=Spieler \d:\s*\S.*\S\s*\s*\S.*\S\s*.*\S\s*Fussballer:\s)\S.*\S/, "g");

              while (true) {
                let player = new Player();
                //player.title
                player.firstName = this.reggger(regExFirstName, text);
                if (player.firstName === undefined) break;
                player.lastName = this.reggger(regExLastName, text);
                player.clubPlayer = this.reggger(regExClubPlayer, text) == "ja";
                const [DD, MM, YYYY] = this.reggger(regExBirthday, text).split('.')
                player.birthday = new Date(YYYY + "-" + MM + "-" + DD);
                if (this.isValidDate(player.birthday) == false) {
                  player.birthday = new Date("2015-03-25");
                }
                team.players.push(player);
              }
              console.log(team);

              this.validatedTeams?.push(team);

            }
          })
        })
      })
    }
  }

  isValidDate(d: any) {
    return d instanceof Date && !isNaN(Number(d));
  }

  regexer(regex: RegExp, text: string): any {
    let result = new RegExp(regex, "g").exec(text!);
    if (result != null) {
      return result[0];
    }
  }

  reggger(regex: RegExp, text: string): any {
    let result = regex.exec(text!);
    if (result != null) {
      return result[0];
    }
  }

  public deleteFile(index: number) {
    this.draggedFiles.splice(index, 1);
    this.validatedTeams.splice(index, 1);
  }

  public onImportTeams() {
    this.appState$ = this.teamService.createTeams$(this.validatedTeams)
      .pipe(
        map(response => {
          response.data.teams?.forEach(team => {
            this.dataSubject.next(
              { ...response, data: { teams: [team!, ...this.dataSubject.value.data.teams!] } }
            );
          })
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


  public onUpdateTeam(f: NgForm) {
    var players = [];
    for (var prop in f.value) {
      if (prop.includes('player')) {
        players.push(f.value[prop]);
        delete f.value[prop];
      }
    }
    f.value["players"] = players;
    this.isLoading.next(true);
    this.appState$ = this.teamService.update$(f.value as Team)
      .pipe(
        map(response => {
          const index = this.dataSubject.value.data.teams?.findIndex(team => team.id === response.data.team?.id);
          this.dataSubject.value.data.teams![index as number] = response.data.team!;
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
            { ...response, data: { teams: this.dataSubject.value.data.teams!.filter(s => s.id !== team!.id) } }
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
    if (mode === 'import') {
      button.setAttribute('data-target', '#importTeamsModal');
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
