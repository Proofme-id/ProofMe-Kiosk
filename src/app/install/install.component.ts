import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-install',
  templateUrl: './install.component.html',
  styleUrls: ['./install.component.scss']
})
export class InstallComponent implements OnInit {

  // Status
  // 0 = default
  // 1 = processing
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
