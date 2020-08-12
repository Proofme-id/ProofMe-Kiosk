import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';
import Web3 from '@smilo-platform/web3';
import ClaimHolder from '../contracts/ClaimHolder';

@Injectable()
export class Web3Provider {
    web3: Web3;

    constructor() {
        this.web3 = new Web3('https://api-eu.didux.network/');
    }

    async isOwnerOfDidContract(publicKey: string, didContractAddress: string): Promise<boolean> {
        const sha3Key = this.web3.utils.keccak256(publicKey);
        console.log('didContractAddress:', didContractAddress);
        console.log('sha3Key:', sha3Key);
        const keyManagerContract = new this.web3.eth.Contract(
            ClaimHolder.abi,
            didContractAddress
        );
        const key = await keyManagerContract.methods.getKey(sha3Key).call();
        console.log('key:', key);
        return parseInt(key.keyType, 10) === 1;
    }

    getPublicKeyFromSignature(message: string, signature: string) {
        return this.web3.eth.accounts.recover(message, signature);
    }
    
    /**
     * This method will get all available biometrics and sync it when someone shares his information
     */
    initializeWebSocket() {
        console.log('Initialize web3 websocket!');
        const nodeAddr = 'wss://ws-eu.didux.network';
        const wsPort = 443;
        const web3Socket = new Web3(new Web3.providers.WebsocketProvider(`${nodeAddr}:${wsPort}`));
        console.log('web3Socket:', web3Socket);
    }

}
