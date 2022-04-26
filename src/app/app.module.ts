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
import { PlayersDashboardComponent } from './players-dashboard/players-dashboard.component'
import { CustomDatePipe } from './pipe/custom-date.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PlanerComponent } from './planer/planer.component';
import { DragDropModule } from '@angular/cdk/drag-drop';

@NgModule({
  declarations: [
    AppComponent,
    TeamsDashboardComponent,
    MailImporterComponent,
    DndDirective,
    PlayersDashboardComponent,
    CustomDatePipe,
    PlanerComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NotificationModule,
    FontAwesomeModule,
    DragDropModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
