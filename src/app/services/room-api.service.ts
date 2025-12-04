// src/app/services/room-api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Room } from '../models/room';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoomApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  createRoom(): Observable<Room> {
    return this.http.post<Room>(`${this.baseUrl}/rooms`, {});
  }

  getRoom(code: string): Observable<Room> {
    return this.http.get<Room>(`${this.baseUrl}/rooms/${code}`).pipe(
      tap(room => console.log('Room response:', room)),
      tap(
        null,
        error => console.error('Error fetching room:', error)
      )
    );
  }
}
