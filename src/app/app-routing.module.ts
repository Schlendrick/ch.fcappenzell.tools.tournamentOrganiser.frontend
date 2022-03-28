import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamsDashboardComponent } from './teams-dashboard/teams-dashboard.component';
import { MailImporterComponent } from './mail-importer/mail-importer.component';

const routes: Routes = [
  { path: 'manageTeams', component: TeamsDashboardComponent },
  { path: 'emailImporter', component: MailImporterComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }