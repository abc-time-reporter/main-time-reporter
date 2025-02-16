import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent],
  template: '<app-header />',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'time';
}
