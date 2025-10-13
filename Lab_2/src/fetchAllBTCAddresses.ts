import { BIP32Interface } from "bip32";
import console from "console"
import { testnet as TESTNET } from "bitcoinjs-lib/src/networks";
import ECPairFactory, { ECPairInterface } from "ecpair";
import * as ecc from 'tiny-secp256k1'
import {p2wpkh, Payment} from 'bitcoinjs-lib/src/payments'

export interface TransactionStatus{
    confirmed:boolean,
    block_height?:number,
    block_hash?:string,
    block_time?:number,
}
export interface UXTO {
    txid:string,
    vout:number,
    status: TransactionStatus,
    value:number
}


export async function getUTXOInfo(p:Payment[],max_number: number):Promise<UXTO[][] | void>{
    let UTXOs:UXTO[][] = [];
    let remainder = max_number;
    for(let payment of p) {
        const address = payment.address
        try {
            const response = await fetch(`https://mempool.space/testnet4/api/address/${address}/utxo`);
            if (!response.ok){
                let msg = await response.text()
                //continue;
                throw new Error(`REQUEST ERROR with CODE ${response.status} + ${response.statusText}\n${msg}`);
            }
            const json:UXTO[] = await response.json();
            let interminnent:UXTO[]=[];
            for (let UTXO of json){
                interminnent.push(UTXO);
                remainder-=UTXO.value;
                if (remainder <= 0) break;
            }
            UTXOs.push(interminnent);
            if (remainder <= 0) break;
            await new Promise(resolve=>setTimeout(resolve,1000))
        } catch (e){
            return Promise.reject("There was an error" + e);
        }
    }
    if (remainder > 0) Promise.reject("Insufficent funds!")
    return Promise.resolve(UTXOs);
}
