import { Injectable, isDevMode } from '@angular/core';
import * as electron from 'electron';
import * as path from 'path';
import * as Smilo from '@smilo-platform/smilo-commons-js-web';
import { NodeStorageManager } from './NodeStorageManager';
import { IKioskProfile } from 'app/interface/kiosk-profile.interface';
import { IAdmin } from 'app/interface/admin.interface';

@Injectable()
export class StorageService {
    private storageManager: Smilo.IStorageManager;
    private currentProfile: IKioskProfile;

    constructor() {
        this.storageManager = new NodeStorageManager(
            path.join(
                this.getStorageBase(),
                '.data'
            )
        );
    }

    hasAdmins(): Promise<boolean> {
        return this.get().then(
            (profile) => {
                return profile.ADMINS.length > 0;
            },
            (error) => false
        );
    }

    async get(): Promise<IKioskProfile> {
        try {
            this.currentProfile = await this.storageManager.readJSON<IKioskProfile>('profile.json');
        } catch (error) {
            console.log('No config file yet! Creating an empty one');
            this.currentProfile = {
                ADMINS: []
            };
        }
        return this.currentProfile;
    }

    set(profile: IKioskProfile): Promise<void> {
        return this.storageManager.writeJSON('profile.json', profile);
    }

    async getAdmins(): Promise<IAdmin[]> {
        return (await this.storageManager.readJSON<IKioskProfile>('profile.json')).ADMINS
    }

    addAdmin(admin: IAdmin) {
        this.currentProfile.ADMINS.push(admin);
        return this.storageManager.writeJSON('profile.json', this.currentProfile);
    }

    removeAdmin(admin: IAdmin) {
        this.currentProfile.ADMINS = this.currentProfile.ADMINS.filter(x => x.publicKey !== admin.publicKey);
        return this.storageManager.writeJSON('profile.json', this.currentProfile);
    }

    getStorageBase(): string {
        if (isDevMode()) {
            return '.';
        } else {
            return electron.remote.app.getPath('userData');
        }
    }
}
