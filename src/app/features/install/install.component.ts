import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from 'app/storage/storage.service';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { ConfigProvider } from 'app/providers/configProvider';
import { Web3Provider } from 'app/providers/web3Provider';
const { width, height } = require("screenz");

interface Country {
    value: string;
    viewValue: string;
}

@Component({
    selector: 'app-install',
    templateUrl: './install.component.html',
    styleUrls: ['./install.component.scss']
})
export class InstallComponent implements OnInit {
    uuid: string = null;
    selectedCountry: string;
    screen: string = "welcome";
    next: string = "selectCountry";
    title = "Installation";

    @ViewChild('qrCodeCanvas', {static: false})
    qrCodeCanvas: ElementRef;

    peerConnection = null;
    wsClient = null;
    dataChannel = null;
    did = null;
    authUrl = null; // Authentication server
    signalingWS = null; // Authentication server
    connectionSuccess = false;
    waitingMenu = false;
    kioskAdminChallenge = null;

    qrCodeWidth: number;

    constructor(
        private router: Router,
        private storageService: StorageService,
        private ngZone: NgZone,
        private configProvider: ConfigProvider,
        private web3Provider: Web3Provider
    ) {
        if (width > height) {
            this.qrCodeWidth = height / 2;
        } else {
            this.qrCodeWidth = width / 2;
        }

    }

    countries: Country[] = [
        {value: 'US', viewValue: 'United States'},
        {value: 'NL', viewValue: 'Netherlands'}
    ];

    async ngOnInit(): Promise<void> {
        this.uuid = null;
        await this.configProvider.getConfig();
        this.authUrl = this.configProvider.getAuthUrl();
        this.signalingWS = this.configProvider.getSignalingWS();
        this.launchWebsocketClient();
    }

    setScreen(next: string) {
        this.screen = next;
        if (next == 'selectCountry') {
            this.next = 'selectLanguage';
        }  else if (next == 'selectLanguage') {
            this.next = 'selectInternet';
        } else if (next == 'selectInternet') {
            this.next = 'selectType';
        } else if (next == 'selectType') {
            this.next = 'addAdmin';
        } else if (next == 'addAdmin') {
            this.next = null;
        } else {
            this.next = null;
        }

    }

    async generateQRCode(uuid: string) {
        const canvas = this.qrCodeCanvas.nativeElement as HTMLCanvasElement;
        QRCode.toCanvas(canvas, 'p2p:' + uuid, {
            width: this.qrCodeWidth
        });
        console.log('Challenge QR code displayed');
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
                const {type, message, success, host, uuid, offer, answer, candidate} = data;
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
            wsClient.send(JSON.stringify({type: 'host'}));
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
                    case 'share-kiosk-data':
                        console.log('peerConnection didContractAddress:', didContractAddress);
                        console.log('kioskAdminSignature:', kioskAdminSignature);
                        const recoveredAddress = this.web3Provider.getPublicKeyFromSignature(this.kioskAdminChallenge, kioskAdminSignature);
                        const isOwner = await this.web3Provider.isOwnerOfDidContract(recoveredAddress, didContractAddress);
                        if (isOwner) {
                            console.log('YES valid');
                            this.storageService.addAdmin({
                                publicKey: recoveredAddress,
                                didContractAddress
                            });
                            this.ngZone.run(() => {
                                this.setScreen('success')
                                setTimeout(() => {
                                    console.log('NAVIGATE');
                                    this.router.navigate(['home']);
                                }, 3000);
                            })
                        } else {
                            console.log('NOT valid');
                            this.ngZone.run(() => {
                                this.setScreen('failed');
                            })
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
                    this.doShareInstallationRequest();
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

                ws.send(JSON.stringify({type: 'candidate', candidate: event.candidate}));
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

    doShareInstallationRequest() {
        console.log('Request share checkin data');
        this.waitingMenu = true;
        this.did = null;
        this.kioskAdminChallenge = this.generateChallenge(64);
        this.dataChannel.send(JSON.stringify({action: 'share-kiosk-data', url: this.authUrl, kioskAdminChallenge: this.kioskAdminChallenge}));
        this.setScreen('addAdmin');
    }

    generateChallenge(length: number) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
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

    retry() {
        this.setScreen("welcome")
        this.disconnect();
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
}
