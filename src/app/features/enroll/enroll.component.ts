import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
const { width, height } = require("screenz");

@Component({
    selector: 'app-enroll',
    templateUrl: './enroll.component.html',
    styleUrls: ['./enroll.component.scss']
})
export class EnrollComponent implements OnInit {

    qrCodeWidth: number;

    constructor(private router: Router) {
    }

    ngOnInit(): void {
        if (width > height) {
            this.qrCodeWidth = height / 2;
        } else {
            this.qrCodeWidth = width / 2;
        }
        console.log("QR code width:" + this.qrCodeWidth)
    }

    goToHome() {
        this.router.navigate(['home']);
    }
}
