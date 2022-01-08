import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CommonResponse } from '../interface/common-response';
import { Team } from '../interface/team';

@Injectable({ providedIn: 'root' })
export class TeamService {

  private readonly apiServerUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  teams$ = <Observable<CommonResponse>>
    this.http.get<CommonResponse>(`${this.apiServerUrl}/teams/list`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  save$ = (team: Team) => <Observable<CommonResponse>>
    this.http.post<CommonResponse>(`${this.apiServerUrl}/teams/save`, team)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  filter$ = (teamId: number) => <Observable<CommonResponse>>
    this.http.delete<CommonResponse>(`${this.apiServerUrl}/teams/delete/${teamId}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  delete$ = (teamId: number) => <Observable<CommonResponse>>
    this.http.delete<CommonResponse>(`${this.apiServerUrl}/teams/delete/${teamId}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError(`An error occured - Error code ${error.status}`);
  }

}
