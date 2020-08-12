import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { StorageService } from 'app/storage/storage.service';

@Injectable()
export class HasConfigGuard implements CanActivate {
    constructor(
        private storageService: StorageService,
        private router: Router
    ) {

    }

    async canActivate(): Promise<boolean> {
        return this.storageService.hasAdmins().then(hasWallet => {
            if (hasWallet) {
                return true;
            } else {
                this.router.navigate(['install']);
                return false;
            }
        });
    }
}
