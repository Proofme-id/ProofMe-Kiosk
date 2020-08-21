import { ipcRenderer } from 'electron';
import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigProvider } from 'app/providers/configProvider';
import { StorageService } from 'app/storage/storage.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DeleteAdminDialogComponent } from 'app/dialogs/delete-admin-dialog/delete-admin.dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import Web3 from '@smilo-platform/web3';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { IAdmin } from 'app/interface/admin.interface';
import { Web3Provider } from 'app/providers/web3Provider';
import * as crypto from 'crypto';
import * as QRCode from 'qrcode';
import { IAccessManagement } from 'app/interface/access-management.interface';
import { IAccessManagementUser } from 'app/interface/access-management-user.interface';
import { DeleteAccessDialogComponent } from 'app/dialogs/delete-access-dialog/delete-access.dialog';
import { EditAccessDialogComponent } from 'app/dialogs/edit-access-dialog/edit-access.dialog';
import { networkInterfaces, uptime } from "os";
import { width, height } from "screenz";

@Component({
    selector: 'app-config',
    templateUrl: './config.component.html',
    styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit {
    // Admin 
    displayedColumns: string[] = ['publickey', 'didContractAddress', 'deleteAction'];
    displayedColumnsAccess: string[] = ['identifier', 'value', 'access', 'editAccessAction', 'deleteAction']
    tableDataSource = new MatTableDataSource([]);
    tableDataSourceAccess = new MatTableDataSource([]);
    loggedIn = false;
    showNotAnAdminError = false;
    uuid: string = null;
    adminPublicKey: string;
    adminDidContractAddress: string;
    @ViewChild('paginatorAdmin', { static: true }) paginatorAdmin: MatPaginator;
    @ViewChild('paginatorAccess', { static: true }) paginatorAccess: MatPaginator;
    @ViewChild('qrCodeCanvas', { static: false })
    qrCodeCanvas: ElementRef;
    peerConnection = null;
    wsClient = null;
    dataChannel = null;
    did = null;
    authUrl = null;
    signalingWS = null;
    connectionSuccess = false;
    waitingMenu = false;
    kioskAdminChallenge = null;

    // System info
    networkInterfaces;
    relays = [];
    width = width;
    height = height;

    // Access management
    emailEnabled = false;
    biometricsEnabled = false;
    uptime: string;
    accessListIdentifier = [
        { value: 'PHONE_NUMBER', viewValue: 'Phone number' },
        { value: 'EMAIL', viewValue: 'Email' }
    ]
    identifierValue: string;
    identifierEnabled = false;
    identifierType = this.accessListIdentifier[0].value;

    constructor(
        private router: Router,
        private storageService: StorageService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar,
        private web3Provider: Web3Provider,
        private configProvider: ConfigProvider,
        private ngZone: NgZone
    ) {
        // For debugging only!! Enable this to skip admin login
        this.loggedIn = true;
        this.loadConfigJson();
        this.networkInterfaces = this.getNetworkInterfaces();
        this.uptime = this.getUptime();
    }

    phonenumberEnabled = false;

    accessManagement: IAccessManagement;

    async ngOnInit(): Promise<void> {
        this.tableDataSource.paginator = this.paginatorAdmin;
        this.tableDataSourceAccess.paginator = this.paginatorAccess;
        this.uuid = null;
        await this.setupAccessManagement();
        await this.configProvider.getConfig();
        this.authUrl = this.configProvider.getAuthUrl();
        this.signalingWS = this.configProvider.getSignalingWS();
        if (!this.loggedIn) {
            this.launchWebsocketClient();
        }
    }

    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.tableDataSourceAccess.filter = filterValue.trim().toLowerCase();

        if (this.tableDataSourceAccess.paginator) {
            this.tableDataSourceAccess.paginator.firstPage();
        }
    }

    async setupAccessManagement() {
        this.accessManagement = await this.storageService.getAccessManagement();
        if (this.accessManagement) {
            if (this.accessManagement.IDENTIFY_BY) {
                for (const identifyBy of this.accessManagement.IDENTIFY_BY) {
                    if (identifyBy === 'EMAIL') {
                        this.emailEnabled = true;
                    } else if (identifyBy === 'PHONE_NUMBER') {
                        this.phonenumberEnabled = true;
                    }
                }
            }
            this.biometricsEnabled = this.accessManagement.ENABLE_FACE_RECOGNITION;
            this.tableDataSourceAccess.data = this.accessManagement.ACCESS_LIST;
        }
    }

    getUptime() {
        const seconds = uptime();
        var d = Math.floor(seconds / (3600 * 24));
        var h = Math.floor(seconds % (3600 * 24) / 3600);
        var m = Math.floor(seconds % 3600 / 60);
        var s = Math.floor(seconds % 60);

        var dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : "";
        var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
        var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
        var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
        return dDisplay + hDisplay + mDisplay + sDisplay;
    }

    switchRelayOn(slot) {
        console.log(ipcRenderer.sendSync('activate', slot))
    }

    switchRelayOff(slot) {
        console.log(ipcRenderer.sendSync('deactivate', slot))
    }

    getRelays() {
        this.relays = ipcRenderer.sendSync('relays', '')
        console.log(this.relays)

    }

    goToHome() {
        this.router.navigate(['home']);
    }

    async loadConfigJson() {
        const admins = await this.storageService.getAdmins();
        console.log('admins:', admins);
        this.tableDataSource.data = admins;
    }

    removeAdmin(admin: IAdmin) {
        console.log('remove:', admin);
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.hasBackdrop = true;
        dialogConfig.data = admin;
        const dialogRef = this.dialog.open(DeleteAdminDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(async result => {
            if (result.accepted) {
                await this.storageService.removeAdmin(admin);
                this.tableDataSource.data = [...this.tableDataSource.data.filter(x => x !== admin)];
            }
        });
    }

    removeAccess(access: IAccessManagementUser) {
        console.log('remove:', access);
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.hasBackdrop = true;
        dialogConfig.data = access;
        const dialogRef = this.dialog.open(DeleteAccessDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(async result => {
            if (result.accepted) {
                await this.storageService.removeAccessManagementUser(access);
                this.tableDataSourceAccess.data = [...this.tableDataSourceAccess.data.filter(x => x !== access)];
            }
        });
    }

    editAccess(access: IAccessManagementUser) {
        console.log('edit:', access);
        const dialogConfig = new MatDialogConfig();
        dialogConfig.disableClose = true;
        dialogConfig.autoFocus = true;
        dialogConfig.hasBackdrop = true;
        dialogConfig.data = access;
        const dialogRef = this.dialog.open(EditAccessDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(async result => {
            if (result.accepted) {
                await this.storageService.updateAccessManagementUser(access);
                // this.tableDataSourceAccess.data = [...this.tableDataSourceAccess.data.find(x => x === access).];
                this.tableDataSourceAccess.data.find(x => x.value === access.value).access = !access.access;
            }
        });
    }

    async addAdmin() {
        if (!this.adminPublicKey) {
            this.makeToast(`Please fill in the public key`, 3000);
        } else if (!this.adminDidContractAddress) {
            this.makeToast(`Please fill in the DID contract address`, 3000);
        } else {
            const trimmedKey = this.adminPublicKey.trim();
            const trimmedDidKey = this.adminDidContractAddress.trim();
            console.log('adminPublicKey:',);
            console.log('this.tableDataSource.data:', this.tableDataSource.data);
            const hasKey = this.tableDataSource.data.filter(x => x.publicKey === trimmedKey).length > 0;
            if (!hasKey) {
                const web3 = new Web3();
                const publicKeyIsValidAddress = web3.utils.isAddress(trimmedKey);
                const didContractIsValidAddress = web3.utils.isAddress(trimmedDidKey);
                if (publicKeyIsValidAddress && didContractIsValidAddress) {
                    try {
                        const isOwner = await this.web3Provider.isOwnerOfDidContract(trimmedKey, trimmedDidKey);
                        if (isOwner) {
                            await this.storageService.addAdmin({
                                publicKey: trimmedKey,
                                didContractAddress: trimmedDidKey
                            });
                            this.tableDataSource.data = [...this.tableDataSource.data, {
                                publicKey: trimmedKey,
                                didContractAddress: trimmedDidKey
                            } as IAdmin];
                            this.adminPublicKey = null;
                            this.adminDidContractAddress = null;
                        } else {
                            this.makeToast(`The publickey ${trimmedKey} is not the owner of the DID contract address ${trimmedDidKey}`, 6000);
                        }
                    } catch (error) {
                        this.makeToast(`DID contract on address ${trimmedDidKey} does not exist`, 6000);
                    }
                } else if (!publicKeyIsValidAddress) {
                    this.makeToast(`Publickey ${trimmedKey} is not a valid public key`, 3000);
                } else if (!didContractIsValidAddress) {
                    this.makeToast(`DID contract address ${didContractIsValidAddress} is not a valid key`, 3000);
                }
            } else {
                this.makeToast(`Publickey ${trimmedKey} is already an admin!`, 3000);
            }
        }
    }

    identifyByChange() {
        const identifyBy = [];
        console.log('email:', this.emailEnabled);
        console.log('phone:', this.phonenumberEnabled);
        if (this.emailEnabled) {
            identifyBy.push('EMAIL');
        }
        if (this.phonenumberEnabled) {
            identifyBy.push('PHONE_NUMBER');
        }
        this.storageService.updateIdentifyBy(identifyBy);
    }

    biometricsChange() {
        this.storageService.updateBiometricsEnabled(this.biometricsEnabled);
    }

    getNetworkInterfaces() {
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
        return results;
    }

    addAccess() {
        console.log('Add access');
        if (!this.identifierValue) {
            this.makeToast(`Please provide a value`, 3000);
        } else {
            const trimmedIdentificationValue = this.identifierValue;
            const hasKey = this.tableDataSourceAccess.data.filter(x => x.value === trimmedIdentificationValue).length > 0;
            console.log('trimmedKeyValue:', trimmedIdentificationValue);
            if (!hasKey) {
                console.log('identifierValue:', trimmedIdentificationValue);
                console.log('identifierEnabled:', this.identifierEnabled);
                console.log('identifierType:', this.identifierType);
                this.storageService.addAccessManagementUser({
                    access: this.identifierEnabled,
                    identifier: this.identifierType,
                    value: trimmedIdentificationValue
                });
                this.tableDataSourceAccess.data = [...this.tableDataSourceAccess.data, {
                    access: this.identifierEnabled,
                    identifier: this.identifierType,
                    value: trimmedIdentificationValue
                } as IAccessManagementUser];
                this.identifierEnabled = false;
                this.identifierValue = null;
                this.identifierType = this.accessListIdentifier[0].value;
            } else {
                this.makeToast(`Identifier ${this.identifierValue} has already been added to the list`, 3000);
            }
        }
    }

    makeToast(message: string, duration: number) {
        this.snackBar.open(message, 'Close', {
            duration: duration,
            panelClass: 'snackbar'
        });
    }


    //////////////////////////////////////////////////
    ///////////////////// WEBRTC ///////////////////// 
    //////////////////////////////////////////////////



    async generateQRCode(uuid: string) {
        const canvas = this.qrCodeCanvas.nativeElement as HTMLCanvasElement;
        // tslint:disable-next-line: max-line-length
        QRCode.toCanvas(canvas, 'p2p:' + uuid, {
            width: 210
        });
        console.log('Challenge QR code displayed');
        // this.checkinData = null;
    }

    async disconnect() {
        // if (this.dataChannel.readyState === 'open') {
        //     this.dataChannel.send(JSON.stringify({screen: 'disconnect'}));
        // }
        this.ngZone.run(() => {
            this.connectionSuccess = false;
            this.uuid = null;
            this.waitingMenu = false;
            this.kioskAdminChallenge = null;
        });
        await this.wsClient.close();
        await this.peerConnection.close();
        await this.launchWebsocketClient();
    }

    generateChallenge(length: number) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    sendLoginKioskAdminRequest() {
        console.log('Request share checkin data');
        this.waitingMenu = true;
        this.did = null;
        this.kioskAdminChallenge = this.generateChallenge(64);
        this.dataChannel.send(JSON.stringify({ action: 'login-kiosk-admin', url: this.authUrl, kioskAdminChallenge: this.kioskAdminChallenge }));
    }

    async launchWebsocketClient() {
        const RTCSessionDescription = require('wrtc').RTCSessionDescription;
        const RTCIceCandidate = require('wrtc').RTCIceCandidate;

        const W3CWebSocket = require('websocket').w3cwebsocket;
        this.wsClient = await new W3CWebSocket(this.signalingWS);

        this.wsClient.onerror = (error => {
            console.log('Websocket error: ' + error.toString());
        });

        this.wsClient.onclose = (close => {
            console.log('Websocket connection closed...');
        });

        this.wsClient.onopen = (ws => {
            console.log('Websocket connection open...');
        });

        this.wsClient.onmessage = (async msg => {
            if (msg.data) {
                console.log('Websocket onmessage received: ' + msg.data);

                let data;

                // accepting only JSON messages
                try {
                    data = JSON.parse(msg.data);
                } catch (e) {
                    console.log('Websocket onmessage ERROR: Invalid JSON');
                    data = {};
                }
                const { type, message, success, host, uuid, offer, answer, candidate } = data;
                // console.log('================ INCOMING ==========');
                // console.log('Type: ', type);
                // console.log('message: ', message);
                // console.log('success: ', success);
                // console.log('host: ', host);
                // console.log('uuid: ', uuid);
                // console.log('offer: ', offer);
                // console.log('answer: ', answer);
                // console.log('candidate: ', candidate);
                // console.log('================ LET\'S PARSE ==========');

                switch (type) {
                    case 'error':
                        // On an error
                        console.log('Websocket onmessage error: ', message);
                        break;
                    case 'connect':
                        // When connected to the Signaling service
                        if (!success) {
                            console.error('Websocket onmessage connect no success');
                        } else {
                            //
                            console.log('Websocket onmessage connect success');
                            await setupHost(this.wsClient);
                        }
                        break;
                    case 'connected':
                        // When a Client connects to an host
                        if (!success) {
                            console.error('Websocket onmessage connected no success');
                        } else {
                            //
                            console.log('Websocket onmessage connected success with client uuid:', uuid);
                            this.uuid = uuid;
                            await sendOffer(this.peerConnection, this.wsClient);
                        }
                        break;
                    case 'offer':
                        // On receiving an response from my offer
                        if (!success) {
                            console.error('Websocket onmessage offer no success');
                        } else {
                            //
                            console.log('Websocket onmessage offer success');
                        }
                        break;
                    case 'host':
                        // Response when switching from client to host
                        if (!success) {
                            console.error('Websocket onmessage host no success');
                        } else {
                            //
                            console.log('Websocket onmessage host');
                            console.log('Websocket onmessage host uuid: ' + uuid);
                            console.log('Websocket onmessage host waiting for user to connect to ' + uuid);
                            await this.generateQRCode(uuid);
                            // this.mobileLoginUrl = 'diduxio://didux.io/p2p?uuid=' + uuid;
                            await this.setupPeerconnection(this.wsClient, uuid);
                        }
                        break;
                    case 'leave':
                        // Response when switching from client to host
                        console.log('Websocket onmessage leave');
                        console.log('Websocket onmessage leave host uuid: ' + uuid);
                        console.log('Websocket onmessage leave waiting for user to connect to ' + uuid);
                        await this.generateQRCode(uuid);
                        // this.mobileLoginUrl = 'diduxio://didux.io/p2p?uuid=' + uuid;
                        await this.setupPeerconnection(this.wsClient, uuid);
                        break;
                    case 'answer':
                        // On receiving an response from my answer
                        if (!success) {
                            console.error('Websocket onmessage answer no success');
                        } else {
                            //
                            console.log('Websocket onmessage answer success');
                            await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                        }
                        break;
                    case 'candidate':
                        // On receiving an candidate from the client
                        if (!success) {
                            console.error('Websocket onmessage candidate no success');
                        } else {
                            //
                            console.log('Websocket onmessage candidate success');
                            const clientCandidate = new RTCIceCandidate(candidate);
                            await this.peerConnection.addIceCandidate(clientCandidate);
                        }
                        break;
                    default:
                        // The default
                        console.error('Websocket onmessage default');
                        break;
                }
            }
        });

        async function setupHost(wsClient) {
            // Switching from Client to Host
            wsClient.send(JSON.stringify({ type: 'host' }));
        }

        async function sendOffer(peerConnection, wsClient) {
            // Start to generate an offer
            console.log('Generate + sending offer.');

            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);
            console.log('Offer: ', offer);

            wsClient.send(JSON.stringify({
                type: 'offer',
                offer
            }));
        }
    }

    async setupPeerconnection(ws, uuid) {
        const RTCPeerConnection = require('wrtc').RTCPeerConnection;
        this.peerConnection = new RTCPeerConnection(this.getRTCConfig());
        this.dataChannel = await this.peerConnection.createDataChannel(uuid);

        this.peerConnection.addEventListener('datachannel', event => {
            event.channel.onmessage = (async eventMessage => {
                console.log('peerConnection dataChannel event:', eventMessage.data);

                let data: any;

                // accepting only JSON messages
                try {
                    data = JSON.parse(eventMessage.data);
                } catch (e) {
                    console.log('peerConnection ERROR: Invalid JSON');
                    data = {};
                }
                const { action, didContractAddress, kioskAdminSignature } = data;

                switch (action) {
                    // when a user tries to login
                    case 'disconnect':
                        // On errors
                        console.log('peerConnection disconnect');
                        this.disconnect();
                        break;
                    case 'login-kiosk-admin':
                        console.log('peerConnection didContractAddress:', didContractAddress);
                        console.log('kioskAdminSignature:', kioskAdminSignature);
                        const recoveredAddress = this.web3Provider.getPublicKeyFromSignature(this.kioskAdminChallenge, kioskAdminSignature);
                        const isOwner = await this.web3Provider.isOwnerOfDidContract(recoveredAddress, didContractAddress);
                        if (isOwner) {
                            console.log('YES valid');
                            this.ngZone.run(() => {
                                this.loadConfigJson();
                                this.loggedIn = true;
                            })
                        } else {
                            console.log('NOT valid');
                            this.ngZone.run(() => {
                                this.showNotAnAdminError = true;
                                setTimeout(() => {
                                    this.disconnect();
                                    this.showNotAnAdminError = false;
                                    this.connectionSuccess = false;
                                }, 10000);
                            });
                        }
                        break;
                    default:
                        console.log('peerConnection unknown screen: ' + action);
                }
            });

            event.channel.onopen = (eventMessage: any) => {
                console.log('peerConnection dataChannel open');
                this.ngZone.run(() => {
                    this.connectionSuccess = true;
                    this.sendLoginKioskAdminRequest();
                });
            };
        });

        this.peerConnection.addEventListener('connectionstatechange', event => {
            console.log('peerConnection event listener connectionstatechange');
            console.log('**************** Connection state changed!!!');
            console.log('**************** Connection state: ', this.peerConnection.connectionState);
            if (this.peerConnection.connectionState === 'connected') {
                console.log('**************** Connected');
            }
        });

        this.peerConnection.addEventListener('icecandidate', async event => {
            console.log('peerConnection event listener icecandidate');
            if (event.candidate) {
                console.log('**************** Received candidate over peer, sending to signaller');
                console.log('Candidate', event.candidate);
                try {
                    const candidate = new RTCIceCandidate(event.candidate);
                    await this.peerConnection.addIceCandidate(candidate);
                    console.log('addIceCandidate YES');
                } catch (e) {
                    console.log('addIceCandidate NO');
                    console.log('ooops', e);
                }

                ws.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
            }
        });

        this.peerConnection.addEventListener('iceconnectionstatechange', event => {
            console.log('peerConnection event listener iceconnectionstatechange');
            console.log('**************** IceConnection state changed!!!');
            console.log('**************** IceConnection state: ', this.peerConnection.iceConnectionState);
            if (this.peerConnection.iceConnectionState === 'disconnected') {
                ws.send(JSON.stringify({ type: 'leave' }));
            }
        });
    }

    getRTCConfig() {
        const secret = 'proofme.id';
        const time = Math.floor(Date.now() / 1000);
        const expiration = 8400;
        const username = time + expiration;
        console.log('Username: ' + username);
        const credential = crypto.createHmac('sha1', secret).update(username.toString()).digest('base64');
        // console.log('Password: ', credential);
        return {
            iceServers: [{
                urls: ['turn:51.89.104.5:3478'],
                credential,
                username
            }]
        };
    }

    resetKiosk() {
        // remove config and restart
        this.storageService.resetConfig().then((result) => {
          if (result) {
              this.router.navigate(['install']);
          } else {
              console.log('Could not delete config');
          }
        })
    }
}
