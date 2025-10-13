import { sha256 } from "bitcoinjs-lib/src/crypto";
import { UXTO } from "./fetchAllBTCAddresses";
import { generateMultiSigAddress, MultiAddress } from "./generateMultiSigAddress";
import { Psbt, Transaction
 } from "bitcoinjs-lib";
import { testnet as TESTNET } from "bitcoinjs-lib/src/networks";
import ECPairFactory, { Signer } from "ecpair";
import * as ecc from 'tiny-secp256k1'

export function createMultiSigTransaction(UXTOs:UXTO[],multisig:MultiAddress,
    target_adr:string,to_send:number,fee:number=0.1):Transaction|void{
    let pubKeyHash = sha256(multisig.payment.redeem.output).toString("hex");
    const psbt = new Psbt({network: TESTNET})
    let risidue = to_send;
    for (let UXTO of UXTOs){
        psbt.addInput(
            {
                hash:UXTO.txid,
                index:UXTO.vout,
                witnessUtxo: {
                    script: Buffer.from('0020'+pubKeyHash,'hex'),
                    value:UXTO.value
                },
                witnessScript:multisig.payment.redeem.output
            }
        )
        risidue-=UXTO.value;
        if (risidue <= 0) break;
    }
    if (risidue > 0) {
        console.error("Insufficent funds");
        return;
    } 
    const change = -risidue;
    const changeAddr = generateMultiSigAddress(process.env.MASTER_PR_KEY,
        process.env.MASTER_PR_KEY_2,true);
    psbt.addOutput({
        address: target_adr,
        value: Math.floor((1-fee)*to_send),
    })
    psbt.addOutput({
        address:changeAddr.payment.address,
        value:Math.floor((1-fee)*change)
    })
    const ECPair = ECPairFactory(ecc)
    const validator = (
      pubkey: Uint8Array,
      msghash: Uint8Array,
      signature: Uint8Array,
    ): boolean => ECPair.fromPublicKey(pubkey).verify(msghash, signature);
    let signers=[]
    for (let cur_pair of multisig.keys){
        let signer = {
        publicKey:Buffer.from(cur_pair.publicKey),
        sign: (hash)=> {
            const signature = cur_pair.sign(hash);
            return Buffer.from(signature);
        }
        }
        signers.push(signer);
    }
    for (let i = 0; i < UXTOs.length;i++){
        for (let signer of signers) {
            try {
                psbt.signInput(i,signer)
            } catch (err){
                console.error("Error signing transaction:" + err);
                return;
            }
        }
        psbt.validateSignaturesOfInput(i,validator)
    }
    psbt.finalizeAllInputs()
    console.log('Transaction hexadecimal:')
    const tr = psbt.extractTransaction(false);
    return tr;

}