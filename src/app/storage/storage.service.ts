import { Injectable, isDevMode } from '@angular/core';
import * as electron from 'electron';
import * as path from 'path';
import * as Smilo from '@smilo-platform/smilo-commons-js-web';
import { NodeStorageManager } from './NodeStorageManager';
import { IKioskProfile } from 'app/interface/kiosk-profile.interface';
import { IAdmin } from 'app/interface/admin.interface';
import { IAccessManagement } from 'app/interface/access-management.interface';

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
        this.initializeCurrentProfile();
    }

    async initializeCurrentProfile() {
        this.currentProfile = await this.storageManager.readJSON<IKioskProfile>('profile.json')
    }

    hasAdmins(): Promise<boolean> {
        return this.getAdmins().then(
            (profile) => true,
            (error) => false
        );
    }

    async getAdmins(): Promise<IAdmin[]> {
        return (await this.storageManager.readJSON<IKioskProfile>('profile.json')).ADMINS
    }

    addAdmin(admin: IAdmin) {
        if (!this.currentProfile || !this.currentProfile.ADMINS) {
            this.currentProfile = {...this.currentProfile, ...{ADMINS: []}};
        }
        this.currentProfile.ADMINS.push(admin);
        return this.storageManager.writeJSON('profile.json', this.currentProfile);
    }

    removeAdmin(admin: IAdmin) {
        this.currentProfile.ADMINS = this.currentProfile.ADMINS.filter(x => x.publicKey !== admin.publicKey);
        return this.storageManager.writeJSON('profile.json', this.currentProfile);
    }

    updateIdentifyBy(identifyBy: string[]) {
        if (!this.currentProfile || !this.currentProfile.ACCESS_MANAGEMENT || !this.currentProfile.ACCESS_MANAGEMENT.IDENTIFY_BY) {
            this.currentProfile = {...this.currentProfile, ...{ACCESS_MANAGEMENT: {...this.currentProfile.ACCESS_MANAGEMENT, IDENTIFY_BY: []}}};
        }
        this.currentProfile.ACCESS_MANAGEMENT.IDENTIFY_BY = identifyBy;
        return this.storageManager.writeJSON('profile.json', this.currentProfile);
    }

    async getAccessManagement(): Promise<IAccessManagement> {
        return (await this.storageManager.readJSON<IKioskProfile>('profile.json')).ACCESS_MANAGEMENT;
    }

    updateBiometricsEnabled(enabled: boolean) {
        if (!this.currentProfile || !this.currentProfile.ACCESS_MANAGEMENT || !this.currentProfile.ACCESS_MANAGEMENT.ENABLE_FACE_RECOGNITION) {
            this.currentProfile = {...this.currentProfile, ...{ACCESS_MANAGEMENT: {...this.currentProfile.ACCESS_MANAGEMENT, ENABLE_FACE_RECOGNITION: false}}};
        }
        this.currentProfile.ACCESS_MANAGEMENT.ENABLE_FACE_RECOGNITION = enabled;
        return this.storageManager.writeJSON('profile.json', this.currentProfile);
    }

    // async getAccessManagement(): Promise<IAccessManagement> {
    //     return (await this.storageManager.readJSON<IKioskProfile>('profile.json')).ACCESS_MANAGEMENT
    // }

    // addAccessManagementUser(accessmanagementUser: IAccessManagement) {
    //     if (!this.currentProfile || !this.currentProfile.ACCESS_MANAGEMENT) {
    //         this.currentProfile = {
    //             ...this.currentProfile,
    //             ...{
    //                 ACCESS_MANAGEMENT: {
    //                     ACCESS_LIST: []
    //                 }
    //             }
    //         };
    //     }
    //     this.currentProfile.ACCESS_MANAGEMENT.push(accessmanagementUser);
    //     return this.storageManager.writeJSON('profile.json', this.currentProfile);
    // }

    // removeAccessManagementUser(accessmanagementUser: IAccessManagement) {
    //     this.currentProfile.ACCESS_MANAGEMENT.ACCESS_LIST = this.currentProfile.ACCESS_MANAGEMENT.ACCESS_LIST.filter(x => x.value !== accessmanagementUser.);
    //     return this.storageManager.writeJSON('profile.json', this.currentProfile);
    // }

    private getStorageBase(): string {
        if (isDevMode()) {
            return '.';
        } else {
            return electron.remote.app.getPath('userData');
        }
    }
}
