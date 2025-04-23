import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TimeEntry } from '../models/time-entry.model';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TimeTrackingService {
  private apiUrl = 'http://localhost:3000/api/time-entries'; // Updated to point to the backend server

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    return this.authService.getAuthHeaders();
  }

  clockIn(userId: number): Observable<TimeEntry> {
    const timeEntry: Partial<TimeEntry> = {
      userId,
      date: new Date(),
      clockInTime: new Date()
    };
    return this.http.post<TimeEntry>(`${this.apiUrl}/clock-in`, timeEntry, {
      headers: this.getHeaders()
    });
  }

  clockOut(timeEntryId: number): Observable<TimeEntry> {
    return this.http.patch<TimeEntry>(`${this.apiUrl}/${timeEntryId}/clock-out`, {
      clockOutTime: new Date()
    }, {
      headers: this.getHeaders()
    });
  }

  getTimeEntries(userId: number): Observable<TimeEntry[]> {
    return this.http.get<TimeEntry[]>(`${this.apiUrl}?userId=${userId}`, {
      headers: this.getHeaders()
    });
  }
} 