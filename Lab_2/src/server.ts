import { error } from 'console';
import console  from 'console';

//const bitcoin = await import('bitcoinjs-lib')
//const BIP32Factory = await import('bip32')
//const TESTNET = bitcoin.networks.testnet
const master_pr_key=process.env.MASTER_PR_KEY
const master_pr_key_2=process.env.MASTER_PR_KEY_2
const target_adr="tb1qc3zu648pcxtfe29pt4ev05av6gmplzfmjkmfys"
//const getalladr = await import("../dist/fetchAllBTCAddresses.mjs");
import BIP32Factory, { BIP32API } from 'bip32';
import { testnet as TESTNET } from 'bitcoinjs-lib/src/networks';
import { getUTXOInfo } from './fetchAllBTCAddresses'
import { getAllPaymentsfromHC } from './getAllPayments';
import * as ecc from 'tiny-secp256k1'
import { Payment, payments, Psbt } from 'bitcoinjs-lib';
import fs from "fs/promises"
import { hash160, sha256 } from 'bitcoinjs-lib/src/crypto';
import ECPairFactory from 'ecpair';
import { generateMultiSigAddress } from './generateMultiSigAddress';
import { broadcastTransaction } from './broadcastTransaction';
import { createMultiSigTransaction } from './createMultiSigTransaction';
async function getTxInfo (p:Payment[],transfer:number) {
    try {
        const result = await getUTXOInfo(p,transfer)
        return Promise.resolve(result)
    } catch (e) {
        Promise.reject(e)
    }
}
const bip32 = BIP32Factory(ecc);
const ECPair = ECPairFactory(ecc);
const t = bip32.fromBase58(master_pr_key);
t.network=TESTNET;
const all_adr = [...getAllPaymentsfromHC(t),...getAllPaymentsfromHC(t,true)];
let multisig = generateMultiSigAddress(master_pr_key,master_pr_key_2);
let balance = 163335;
const tx_id = "fb9a2ffc2d02a65ca509181f7f8c10915997f28228f533af0975557da423f286"
getTxInfo(all_adr,2000).then(result=>{
    if (!result) return;
    const json = JSON.stringify(result)
    console.log(result)
    fs.writeFile("cached_untxs.json",json,'utf-8').then(()=>{
        console.log("Successfully cached file");
    }).catch(err=>{
        console.error("Couldn't write file for reason: " + err);
    })

}).catch(err=>{console.error(err)})
getTxInfo([multisig.payment],10000).then(result=>{
    if (!result) return;
    const json = JSON.stringify(result)
    console.log(result)
    fs.writeFile("cached_multi_untxs.json",json,'utf-8').then(()=>{
        console.log("Successfully cached file");
    }).catch(err=>{
        console.error("Couldn't write file for reason: " + err);
    })
    const tr = createMultiSigTransaction(result[0],multisig,
        all_adr[3].address,10000,0.01)
    if (tr) {
        console.log("Multisig Tran Hex:\n"+tr.toHex())
        broadcastTransaction(tr)
        .then(result=>{
            fs.writeFile("tr_id_multi.txt",result)
            .then(()=>console.log("Wrote multisig tx"))
            .catch(()=>console.error("Couldn't wrtie multisig_tx_file"))
        })
        .catch((err)=>console.error(err))
    }

}).catch(err=>{console.error(err)})

const keyPair2 = all_adr[0].keyPair
let pubKeyHash = hash160(Buffer.from(keyPair2.publicKey)).toString('hex');
console.log('PubKey Hash: ' + pubKeyHash);
const psbt = new Psbt({network: TESTNET})
.addInput({
hash: tx_id, // TX_ID
index: 1, // TX_VOUT unspend address tb1qttsmxju7qhjs33mfxmnysnhjvy5me449a4elsv
witnessUtxo: {
script: Buffer.from('0014' + pubKeyHash, 'hex'),
value: balance
},
})
.addOutput({
address: target_adr,
value: Math.floor(0.85*balance),
})
const validator = (
  pubkey: Uint8Array,
  msghash: Uint8Array,
  signature: Uint8Array,
): boolean => ECPair.fromPublicKey(pubkey).verify(msghash, signature);
psbt.signInput(0,{
    publicKey:Buffer.from(keyPair2.publicKey),
    sign: (hash)=> {
        const signature = keyPair2.sign(hash);
        return Buffer.from(signature);
    }
});
psbt.validateSignaturesOfInput(0,validator)
psbt.finalizeAllInputs()
console.log('Transaction hexadecimal:')
console.log(psbt.extractTransaction(false).toHex())
/*broadcastTransaction(tr)
.then(result=>{
    console.log(result)
    fs.writeFile("tx_id.txt",result)
    .then(()=>console.log("Wrote tx_id"))
    .catch(err=>console.error("Couldn't write file"))
}
)
.catch(error=>console.log("Broadcasting error: " + error))
*/
