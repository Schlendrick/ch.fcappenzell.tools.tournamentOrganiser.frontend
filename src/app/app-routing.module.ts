import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TeamsDashboardComponent } from './teams-dashboard/teams-dashboard.component';
import { MailImporterComponent } from './mail-importer/mail-importer.component';
import { PlayersDashboardComponent } from './players-dashboard/players-dashboard.component';
import { PlanerComponent } from './planer/planer.component';

const routes: Routes = [
  { path: 'manageTeams', component: TeamsDashboardComponent },
  { path: 'managePlayers', component: PlayersDashboardComponent },
  { path: 'emailImporter', component: MailImporterComponent },
  { path: 'planer', component: PlanerComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }