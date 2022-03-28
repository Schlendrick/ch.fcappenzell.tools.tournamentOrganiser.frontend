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

@NgModule({
  declarations: [
    AppComponent,
    TeamsDashboardComponent,
    MailImporterComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    NotificationModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
