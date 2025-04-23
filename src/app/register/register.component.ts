import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="register-container">
      <form (ngSubmit)="onSubmit()" #registerForm="ngForm">
        <h2>Register</h2>
        <div class="form-group"> 
          <label for="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            [(ngModel)]="username"
            required
            #usernameInput="ngModel"
          />
          <div *ngIf="usernameInput.invalid && usernameInput.touched" class="error">
            Username is required
          </div>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            [(ngModel)]="password"
            required
            minlength="6"
            #passwordInput="ngModel"
          />
          <div *ngIf="passwordInput.invalid && passwordInput.touched" class="error">
            Password must be at least 6 characters
          </div>
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            [(ngModel)]="confirmPassword"
            required
            #confirmPasswordInput="ngModel"
          />
          <div *ngIf="confirmPasswordInput.invalid && confirmPasswordInput.touched" class="error">
            Please confirm your password
          </div>
          <div *ngIf="password !== confirmPassword && confirmPasswordInput.touched" class="error">
            Passwords do not match
          </div>
        </div>
        <button type="submit" [disabled]="!registerForm.form.valid || password !== confirmPassword">Register</button>
        <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>
      </form>
    </div>
  `,
  styles: [`
    .register-container {
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
    }
    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    button {
      width: 100%;
      padding: 10px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:disabled {
      background-color: #cccccc;
    }
    .error {
      color: red;
      font-size: 0.8em;
      margin-top: 5px;
    }
  `]
})
export class RegisterComponent {
  username: string = '';
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.authService.register(this.username, this.password).subscribe({
      next: (response) => {
        if (response.success) {
          this.router.navigate(['/login']);
        } else {
          this.errorMessage = response.message || 'Registration failed';
        }
      },
      error: (error) => {
        this.errorMessage = 'An error occurred. Please try again.';
        console.error('Registration error:', error);
      }
    });
  }
} 