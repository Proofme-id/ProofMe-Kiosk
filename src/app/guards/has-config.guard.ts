import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from 'app/storage/storage.service';

@Injectable()
export class HasConfigGuard implements CanActivate {
    constructor(
        private storageService: StorageService,
        private router: Router
    ) {
        console.log('1. HasConfigGuard');
    }

    async canActivate(): Promise<boolean> {
        console.log('2. HasConfigGuard');
        console.log('await this.storageService.hasProfile()', await this.storageService.hasProfile());
        return this.storageService.hasProfile().then(hasWallet => {
            if (hasWallet) {
                return true;
            } else {
                this.router.navigate(['install']);
                return false;
            }
        });
    }
}
