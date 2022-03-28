import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MailImporterComponent } from './mail-importer/mail-importer.component';

const routes: Routes = [
  { path: 'emailImporter', component: MailImporterComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }