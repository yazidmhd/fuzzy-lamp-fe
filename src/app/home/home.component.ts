import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  userId: string = '';
  isLoggedIn: boolean = false;
  loggedInUser: string = '';

  constructor(private router: Router) {}

  onLogin(): void {
    if (this.userId.trim()) {
      this.loggedInUser = this.userId.trim();
      this.isLoggedIn = true;
    }
  }

  onFormCardClick(): void {
    this.router.navigate(['/form'], { queryParams: { userId: this.loggedInUser } });
  }
}
