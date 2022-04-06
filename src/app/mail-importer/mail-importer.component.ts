import { Component, ViewChild, ElementRef } from "@angular/core";
import { RTFJS } from "rtf.js";
import { Captain, Player, Team } from "../interface/team";
import { TeamsDashboardComponent } from "../teams-dashboard/teams-dashboard.component";

@Component({
  selector: 'app-mail-importer',
  templateUrl: './mail-importer.component.html',
  styleUrls: ['./mail-importer.component.scss']
})
export class MailImporterComponent {
  @ViewChild("fileDropRef", { static: false })
  fileDropEl!: ElementRef;

  files: any[] = [];

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
    setTimeout(() => {
      if (index === this.files.length) {
        return;
      } else {
        const progressInterval = setInterval(() => {
          if (this.files[index].progress === 100) {
            this.files[index].text("UTF-8").then((rtf: any) => {
              const blob = this.stringToArrayBuffer(rtf);
              RTFJS.loggingEnabled(false);
              const doc = new RTFJS.Document(blob, rtf);
              const meta = doc.metadata();
              doc.render().then(function (htmlElements) {
                console.log("Meta:");
                console.log(meta);
                console.log("Html:");
                htmlElements.forEach(ele => {
                  //console.log(ele.innerText);
                })

                var team: Team = new Team();
                team.players = new Array<Player>();

                htmlElements
                  .forEach((a, index) => {
                    for (let i = 1; i <= 8; i++) {
                      if (a.textContent!.includes("Spieler " + i + ":")) {
                        console.log("Spieler " + i + ":");

                        var player: Player = new Player();

                        if (i == 1) {
                          index -= 1;
                          console.log("Name: " + htmlElements[index + 1].innerText.replace(/\u2028/g, '').replace('Spieler 1:Name: ', ''));
                        } else {
                          console.log("Name: " + htmlElements[index + 1].innerText.replace('Name: ', ''));
                          player.firstName = htmlElements[index + 1].innerText.replace('Name: ', '');
                        }
                        console.log("Vorname: " + htmlElements[index + 2].innerText.replace('Vorname: ', ''))
                        player.lastName = htmlElements[index + 2].innerText.replace('Vorname: ', '');
                        console.log(player);
                        console.log("Geburtsdatum: " + htmlElements[index + 3].innerText.replace('Geburtsdatum: ', ''))
                        console.log("Fussballer: " + htmlElements[index + 4].innerText.replace('Fussballer:', '').trim())

                        team.players.push(player);

                      }

                    }
                  })
                console.log(team.players);
              }).catch((error: any) => console.error(error))
            });
            clearInterval(progressInterval);
            this.uploadFilesSimulator(index + 1);
          } else {
            this.files[index].progress += 5;
          }
        }, 200);
      }
    }, 10);
  }

  /**
   * Convert Files list to normal array list
   * @param files (Files List)
   */
  prepareFilesList(files: Array<any>) {
    for (const item of files) {
      item.progress = 0;
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
}