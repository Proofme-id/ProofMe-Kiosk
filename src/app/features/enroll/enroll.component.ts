import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'app-enroll',
    templateUrl: './enroll.component.html',
    styleUrls: ['./enroll.component.scss']
})
export class EnrollComponent implements OnInit {

    constructor(private router: Router) { }

    ngOnInit(): void {

    }

    goToHome() {
        this.router.navigate(['home']);
    }
}
