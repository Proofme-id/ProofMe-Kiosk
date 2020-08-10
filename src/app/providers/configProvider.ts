import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';

@Injectable()
export class ConfigProvider {
    authUrl: string;
    signalingWS: string;

    constructor(private http: HttpClient) {

    }

    async getConfig(): Promise<void> {
        const config = await this.http.get<any>('/assets/config/config.json').pipe(take(1)).toPromise();
        this.signalingWS = config.signalingWS;
        this.authUrl = config.authUrl;
    }

    getAuthUrl(): string {
        return this.authUrl;
    }

    getSignalingWS(): string {
        return this.signalingWS;
    }
}
