import BIP32Factory from "bip32";
import ECPairFactory, { ECPairInterface } from "ecpair";
import { testnet as TESTNET } from "bitcoinjs-lib/src/networks";
import * as ecc from 'tiny-secp256k1'
import { p2ms, p2wsh, Payment } from "bitcoinjs-lib/src/payments";

export interface MultiAddress {
    payment:Payment,
    keys:ECPairInterface[]
}

export function generateMultiSigAddress(mk1:string,mk2:string,change:boolean=false,index:number=0):MultiAddress{
    const bip32 = BIP32Factory(ecc);
    const ECPair = ECPairFactory(ecc);
    let t1 = bip32.fromBase58(mk1);
    let t2 = bip32.fromBase58(mk2);
    t1.network = TESTNET;
    t2.network = TESTNET;
    const derivedIndex = `m/44'/1'/0'/${change ? 1 : 0}/${index}`;
    const wifKey1 = t1.derivePath(derivedIndex).toWIF();
    const keyPair1 = ECPair.fromWIF(wifKey1, TESTNET);
    const wifKey2 = t2.derivePath(derivedIndex).toWIF();
    const keyPair2 = ECPair.fromWIF(wifKey2, TESTNET);
    const pubkeys = [
    Buffer.from(keyPair1.publicKey).toString('hex'),
    Buffer.from(keyPair2.publicKey).toString('hex'),
    ].map((hex) => Buffer.from(hex, 'hex'))

    const p2ms_str = p2ms({ m: 2, pubkeys, network:TESTNET });
    p2ms_str.network = TESTNET;
    // Getting p2sh multisig address
    const payment = p2wsh({
    redeem: p2ms_str, network:TESTNET
    })
    console.log(payment.address)
    return {payment:payment,keys:[keyPair1,keyPair2]}
    

}