import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeTrackingService } from '../services/time-tracking.service';
import { TimeEntry } from '../models/time-entry.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-time-tracking',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="time-tracking-container">
      <h2>Time Tracking</h2>
      <div class="button-group">
        <button (click)="clockIn()" [disabled]="isClockedIn">Clock In</button>
        <button (click)="clockOut()" [disabled]="!isClockedIn">Clock Out</button>
      </div>
      
      <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>
      
      <div class="time-entries" *ngIf="timeEntries.length > 0">
        <h3>Today's Entries</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Clock In</th>
              <th>Clock Out</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let entry of timeEntries">
              <td>{{ entry.date | date:'shortDate' }}</td>
              <td>{{ entry.clockInTime | date:'shortTime' }}</td>
              <td>{{ entry.clockOutTime ? (entry.clockOutTime | date:'shortTime') : 'Not clocked out' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .time-tracking-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
    }
    .button-group {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }
    button {
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
    }
    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    .error {
      color: red;
      margin: 10px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f5f5f5;
    }
  `]
})
export class TimeTrackingComponent implements OnInit {
  timeEntries: TimeEntry[] = [];
  isClockedIn: boolean = false;
  errorMessage: string = '';
  currentUserId: number = 0;

  constructor(
    private timeTrackingService: TimeTrackingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Get the current user's ID from the auth service
    this.currentUserId = this.authService.getCurrentUserId();
    this.loadTimeEntries();
  }

  loadTimeEntries() {
    this.timeTrackingService.getTimeEntries(this.currentUserId).subscribe({
      next: (entries) => {
        this.timeEntries = entries;
        // Check if user is currently clocked in
        const lastEntry = entries[entries.length - 1];
        this.isClockedIn = lastEntry && !lastEntry.clockOutTime;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load time entries';
        console.error('Error loading time entries:', error);
      }
    });
  }

  clockIn() {
    this.timeTrackingService.clockIn(this.currentUserId).subscribe({
      next: (entry) => {
        this.timeEntries.push(entry);
        this.isClockedIn = true;
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = 'Failed to clock in';
        console.error('Error clocking in:', error);
      }
    });
  }

  clockOut() {
    const lastEntry = this.timeEntries[this.timeEntries.length - 1];
    if (lastEntry && lastEntry.id) {
      this.timeTrackingService.clockOut(lastEntry.id).subscribe({
        next: (updatedEntry) => {
          const index = this.timeEntries.findIndex(entry => entry.id === updatedEntry.id);
          if (index !== -1) {
            this.timeEntries[index] = updatedEntry;
          }
          this.isClockedIn = false;
          this.errorMessage = '';
        },
        error: (error) => {
          this.errorMessage = 'Failed to clock out';
          console.error('Error clocking out:', error);
        }
      });
    }
  }
} 