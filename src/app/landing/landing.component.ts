import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  userId: string = '';

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.queryParams['userId'] || '';

    if (!this.userId) {
      this.router.navigate(['/']);
      return;
    }
  }

  onFormCardClick(): void {
    this.router.navigate(['/form'], { queryParams: { userId: this.userId } });
  }
}
