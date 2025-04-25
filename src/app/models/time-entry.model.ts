export interface TimeEntry {
  id?: number;
  userId: number;
  date: Date;
  clockInTime: Date;
  clockOutTime?: Date;
} 