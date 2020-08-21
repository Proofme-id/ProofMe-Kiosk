import { Component, OnInit, NgZone } from '@angular/core';;
import { networkInterfaces } from "os";
import { ThemePalette } from "@angular/material/core";
import { ProgressSpinnerMode } from "@angular/material/progress-spinner";
import * as wifi from "node-wifi";

@Component({
    selector: 'network-config',
    templateUrl: './networkconfig.component.html',
    styleUrls: ['./networkconfig.component.scss']
})
export class NetworkConfigComponent implements OnInit {

    private panelOpenState = false;
    private networkConnections = [];
    private wifiNetworks = [];
    private showSSID = true;
    private showPassword = false;

    // spinnner
    color: ThemePalette = 'primary';
    mode: ProgressSpinnerMode = 'indeterminate';
    value = 50;

    showLoader = false;
    connectionSuccess = false;
    connectionError = false;
    SSID = null;
    PASSWORD = 'WIFI Password';

    constructor(
        private ngZone: NgZone
    ) {
    }


    async ngOnInit(): Promise<void> {

    }

    getNetworkInterfaces() {
        this.showLoader = true;
        const nets = networkInterfaces();
        const results = []; // or just '{}', an empty object

        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
                if (net.family === 'IPv4' && !net.internal) {
                    results.push({ name: name, address: net.address });
                }
            }
        }
        console.log("Network Interfaces:" + JSON.stringify(results));
        this.ngZone.run(() => {
            this.showLoader = false;
            this.networkConnections = results;
        });
    }

    getWifiNetworks() {
        this.showLoader = true;
        this.connectionSuccess = false
        this.connectionError = false
        wifi.init({
            iface: null // network interface, choose a random wifi interface if set to null
        });

        // Scan networks
        wifi.scan((err, networks) => {
            if (err) {
                console.log(err);
                this.ngZone.run(() => {
                    this.showLoader = false;
                });
            } else {
                this.ngZone.run(() => {
                    this.wifiNetworks = networks;
                    this.showLoader = false;
                });
                console.log(networks);
                /*
                    networks = [
                        {
                          ssid: '...',
                          bssid: '...',
                          mac: '...', // equals to bssid (for retrocompatibility)
                          channel: <number>,
                          frequency: <number>, // in MHz
                          signal_level: <number>, // in dB
                          quality: <number>, // same as signal level but in %
                          security: 'WPA WPA2' // format depending on locale for open networks in Windows
                          security_flags: '...' // encryption protocols (format currently depending of the OS)
                          mode: '...' // network mode like Infra (format currently depending of the OS)
                        },
                        ...
                    ];
                    */
            }
        });
    }

    connect(ssid) {
        this.ngZone.run(() => {
            this.SSID = ssid;
            this.showSSID = false;
            this.showPassword = true;
        });
    }

    connectToSSID() {
        this.ngZone.run(() => {
            this.wifiNetworks = [];
            this.showLoader = true;
            this.showSSID = true;
            this.showPassword = false;
        });


        wifi.connect({ ssid: this.SSID, password: this.PASSWORD }, (err) => {
            this.connectionError = false;
            this.connectionSuccess = false;
            if (err) {
                console.log(err);
                this.ngZone.run(() => {
                    this.showLoader = false;
                    this.connectionError = true;
                });
            } else {
                this.ngZone.run(() => {
                    this.showLoader = false;
                    this.connectionSuccess = true;
                });
                console.log("Connected");
            }
        });
    }

}
