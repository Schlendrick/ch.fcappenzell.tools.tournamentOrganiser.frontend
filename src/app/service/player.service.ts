import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CommonResponse } from '../interface/common-response';
import { Player } from '../interface/team';

@Injectable({ providedIn: 'root' })
export class PlayerService {

  private readonly apiServerUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  players$ = <Observable<CommonResponse>>
    this.http.get<CommonResponse>(`${this.apiServerUrl}/players/list`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  create$ = (player: Player) => <Observable<CommonResponse>>
    this.http.post<CommonResponse>(`${this.apiServerUrl}/players/create`, player)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  update$ = (player: Player) => <Observable<CommonResponse>>
    this.http.post<CommonResponse>(`${this.apiServerUrl}/players/update`, player)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  filter$ = (playerId: number) => <Observable<CommonResponse>>
    this.http.delete<CommonResponse>(`${this.apiServerUrl}/players/delete/${playerId}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  delete$ = (playerId: number) => <Observable<CommonResponse>>
    this.http.delete<CommonResponse>(`${this.apiServerUrl}/players/delete/${playerId}`)
      .pipe(
        tap(console.log),
        catchError(this.handleError)
      );

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.log(error);
    return throwError(`An error occured: Error message ${error.message},  Error code: ${error.status}`);
  }

}
