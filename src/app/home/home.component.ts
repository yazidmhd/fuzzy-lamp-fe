import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  userId: string = '';

  constructor(private router: Router) {}

  onLogin(): void {
    if (this.userId.trim()) {
      this.router.navigate(['/landing'], { queryParams: { userId: this.userId.trim() } });
    }
  }
}
