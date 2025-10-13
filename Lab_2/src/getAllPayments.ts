import { BIP32Interface } from "bip32";
import console from "console"
import { testnet as TESTNET } from "bitcoinjs-lib/src/networks";
import ECPairFactory, { ECPairInterface } from "ecpair";
import * as ecc from 'tiny-secp256k1'
import {p2wpkh, Payment} from 'bitcoinjs-lib/src/payments'

interface PaymentsAndKeyPairs extends Payment {
    keyPair:ECPairInterface
}

export function getAllPaymentsfromHC(t:BIP32Interface,change:boolean=false,max_count:number=10):PaymentsAndKeyPairs[]{
    const ECPair = ECPairFactory(ecc)
    let payments:PaymentsAndKeyPairs[] = [];
    for(let i = 0; i < max_count; i++) {
        let derivedIndex = `m/44'/1'/0'/${change? "1" : "0"}/${i}`
        t.network=TESTNET
        let wifKey = t.derivePath(derivedIndex).toWIF();
        let keyPair = ECPair.fromWIF(wifKey,TESTNET);
        const payment = p2wpkh({ pubkey: Buffer.from(keyPair.publicKey),
        network: TESTNET});
        payments.push({...payment,keyPair:keyPair})
    }
    return payments
}
