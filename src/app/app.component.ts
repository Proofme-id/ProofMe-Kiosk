import { Component } from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { Config } from 'electron';
import { ConfigProvider } from './providers/configProvider';
import { StorageService } from './storage/storage.service';
import { Web3Provider } from './providers/web3Provider';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    constructor(
        private electronService: ElectronService,
        private translate: TranslateService,
        private configProvider: ConfigProvider,
        private storageService: StorageService,
        private web3Provider: Web3Provider
    ) {
        this.translate.setDefaultLang('en');
        console.log('AppConfig', AppConfig);

        if (electronService.isElectron) {
            console.log(process.env);
            console.log('Run in electron');
            console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
            console.log('NodeJS childProcess', this.electronService.childProcess);
        } else {
            console.log('Run in browser');
        }
        this.web3Provider.initializeWebSocket();
    }
}
