import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import { faUpload, faFile, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { RTFJS } from "rtf.js";
import { DataState } from '../enum/data-state.enum';
import { BehaviorSubject, catchError, from, map, Observable, of, pipe, startWith } from "rxjs";
import { AppState } from "../interface/app-state";
import { CommonResponse } from "../interface/common-response";
import { Captain, Player, Team } from "../interface/team";
import { NotificationService } from "../service/notification.service";
import { faEdit, faTrash, faUserPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-mail-importer',
  templateUrl: './mail-importer.component.html',
  styleUrls: ['./mail-importer.component.scss']
})
export class MailImporterComponent implements OnInit {

  appState$!: Observable<AppState<CommonResponse>>;
  readonly DataState = DataState;
  private isLoading = new BehaviorSubject<boolean>(false);
  isLoading$ = this.isLoading.asObservable();
  private dataSubject = new BehaviorSubject<CommonResponse>(null!);

  public faFile = faFile;
  public faUpload = faUpload;
  public faTrashCan = faTrashCan;
  public faUserPlus = faUserPlus;

  constructor(private notifier: NotificationService) { }

  ngOnInit(): void {

  }

  @ViewChild("fileDropRef", { static: false })
  fileDropEl!: ElementRef;

  files: any[] = [];
  teams: any[] = [];

  /**
   * on file drop handler
   */
  onFileDropped($event: any[]) {
    this.prepareFilesList($event);
  }

  /**
   * handle file from browsing
   */
  fileBrowseHandler(files: any[]) {
    this.prepareFilesList(files);
  }

  /**
   * Delete file from files list
   * @param index (File index)
   */
  deleteFile(index: number) {
    if (this.files[index].progress < 100) {
      console.log("Upload in progress.");
      return;
    }
    this.files.splice(index, 1);
  }

  /**
   * Simulate the upload process
   */
  uploadFilesSimulator(index: number) {
    if (index === this.files.length) {
      return;
    } else {


      this.files[index].text("UTF-8").then((rtf: any) => {
        const blob = this.stringToArrayBuffer(rtf);
        RTFJS.loggingEnabled(false);
        const doc = new RTFJS.Document(blob, rtf);
        const meta = doc.metadata();
        doc.render()
          .then(htmlElements => this.parseHtmlElementsAsTeam(htmlElements))
          .then(team => this.teams.push(team))
          .catch((error: any) => console.error(error))
      });

      this.uploadFilesSimulator(index + 1);

    }
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.sizeFormatted = this.formatBytes(item.size);
      this.files.push(item);
    }
    this.fileDropEl.nativeElement.value = "";
    this.uploadFilesSimulator(0);
  }


  /**
   * format bytes
   * @param bytes (File size in bytes)
   * @param decimals (Decimals point)
   */
  formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) {
      return "0 Bytes";
    }
    const k = 1024;
    const dm = decimals <= 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  }

  stringToArrayBuffer(string: string) {
    const buffer = new ArrayBuffer(string.length);
    const bufferView = new Uint8Array(buffer);
    for (let i = 0; i < string.length; i++) {
      bufferView[i] = string.charCodeAt(i);
    }
    return buffer;
  }

  async parseHtmlElementsAsTeam(htmlElements: HTMLElement[]) {
    var team: Team = new Team();
    team.players = new Array<Player>();

    htmlElements.forEach((a, index) => {
      for (let i = 1; i <= 8; i++) {

        /*
        Mannschaftsname: contreva
        */
        if (a.textContent!.includes('Mannschaftsname: ')) {
          team.name = htmlElements[index].innerText.replace('Mannschaftsname: ', '');
        }

        /*
        Kategorie: FB
        */
        if (a.textContent!.includes('Kategorie: ')) {
          team.category = htmlElements[index].innerText.replace('Kategorie: ', '');
        }

        /*
        Captain:
        Anrede: Herr
        Name: Hörler
        Vorname: Bruno
        Strasse: Pöppelstrasse 20
        PLZ / Ort: 9050 Appenzell Steinegg
        Telefon: 071 788 10 70
        E-Mail: bruno.hoerler@contreva.ai
          */
        if (a.textContent!.includes('Captain:')) {
          team.captain = new Captain();
          team.captain.title = htmlElements[index + 1].innerText.replace('Anrede: ', '');
          team.captain.firstName = htmlElements[index + 2].innerText.replace('Name: ', '');
          team.captain.lastName = htmlElements[index + 3].innerText.replace('Vorname: ', '');
          team.captain.street = htmlElements[index + 4].innerText.replace('Strasse: ', '');
          const [first, ...rest] = htmlElements[index + 5].innerText.replace('PLZ / Ort: ', '').split(' ');
          team.captain.plz = parseInt(first);
          team.captain.place = rest.join(' ');
          team.captain.phone = htmlElements[index + 6].innerText.replace('Telefon: ', '');
          team.captain.email = htmlElements[index + 7].innerText.replace('E-Mail: ', '');
        }

        /*
        Spieler 3:
        Name: Müller
        Vorname: Tamara
        Geburtsdatum: 02.06.1995
        Fussballer: ja
          */
        if (a.textContent!.includes("Spieler " + i + ":")) {
          var player: Player = new Player();
          player.firstName = htmlElements[index + 1].innerText.replace('Name: ', '');
          player.lastName = htmlElements[index + 2].innerText.replace('Vorname: ', '');
          const [DD, MM, YYYY] = htmlElements[index + 3].innerText.replace('Geburtsdatum: ', '').split('.')
          player.birthday = new Date(YYYY + "-" + MM + "-" + DD);
          player.clubPlayer = htmlElements[index + 4].innerText.replace('Fussballer: ', '') == "ja";
          team.players.push(player);
        }

      }
    })
    console.log(team);
    return team;
  }
}