import { Injectable, isDevMode } from '@angular/core';
import * as electron from 'electron';
import * as path from 'path';
import * as Smilo from '@smilo-platform/smilo-commons-js-web';
import { NodeStorageManager } from './NodeStorageManager';
import { IKioskProfile } from 'app/interface/kiosk-profile';

@Injectable()
export class StorageService {
    private storageManager: Smilo.IStorageManager;

    constructor() {
        this.storageManager = new NodeStorageManager(
            path.join(
                this.getStorageBase(),
                '.data'
            )
        );
    }

    hasProfile(): Promise<boolean> {
        return this.get().then(
            (profile) => true,
            (error) => false
        );
    }

    get(): Promise<IKioskProfile> {
        return this.storageManager.readJSON<IKioskProfile>('profile.json');
    }

    set(profile: IKioskProfile): Promise<void> {
        return this.storageManager.writeJSON('profile.json', profile);
    }

    getStorageBase(): string {
        if (isDevMode()) {
            return '.';
        } else {
            return electron.remote.app.getPath('userData');
        }
    }
}
