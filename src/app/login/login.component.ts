import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="login-container">
      <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
        <h2>Login</h2>
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
            #passwordInput="ngModel"
          />
          <div *ngIf="passwordInput.invalid && passwordInput.touched" class="error">
            Password is required
          </div>
        </div>
        <button type="submit" [disabled]="!loginForm.form.valid">Login</button>
        <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>
        <div class="register-link">
          <a [routerLink]="['/register']">Don't have an account? Register here</a>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    button {
      width: 100%;
      padding: 10px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      margin-top: 10px;
    }
    button:disabled {
      background-color: #cccccc;
    }
    .error {
      color: red;
      font-size: 0.8em;
      margin-top: 5px;
    }
    .register-link {
      text-align: center;
      margin-top: 15px;
    }
    .register-link a {
      color: #007bff;
      text-decoration: none;
    }
    .register-link a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    console.log('Login attempt with:', { username: this.username, password: this.password });
    
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        if (response.success) {
          localStorage.setItem('token', response.token || '');
          localStorage.setItem('userId', response.userId?.toString() || '');
          this.router.navigate(['/time-tracking']);
        } else {
          this.errorMessage = response.message || 'Invalid username or password';
          console.error('Login failed:', response.message);
        }
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = 'An error occurred. Please try again.';
      }
    });
  }
} 