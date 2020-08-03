import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  // Status
  // 0 = default
  // 2 = error
  // 3 = success
  public status;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.status = 0;
  }

  setStatus(status) {
    this.status = status;
  }

}
