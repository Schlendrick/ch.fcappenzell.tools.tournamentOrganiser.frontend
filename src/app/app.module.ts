import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NotificationModule } from './notification/notification.module';
import { MailImporterComponent } from './mail-importer/mail-importer.component';
import { TeamsDashboardComponent } from './teams-dashboard/teams-dashboard.component';
import { DndDirective } from './direcitves/dnd.direcitves';
import { ProgressComponent } from './components/progress/progress.component';
import { PlayersDashboardComponent } from './players-dashboard/players-dashboard.component';
import { EditPlayerComponent } from './edit-player/edit-player.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  declarations: [
    AppComponent,
    TeamsDashboardComponent,
    MailImporterComponent,
    DndDirective,
    ProgressComponent,
    PlayersDashboardComponent,
    EditPlayerComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NotificationModule,
    NgbModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
