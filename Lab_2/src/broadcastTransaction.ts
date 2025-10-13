import { Transaction } from "bitcoinjs-lib";

export async function broadcastTransaction(tr:Transaction){
    const raw = tr.toHex()
    try {
        const response = await fetch("https://mempool.space/testnet4/api/tx", {
            method:"POST",
            body:raw
        })
        const txt = await response.text()
        if (!response.ok){
            throw new Error("There was an error:" + txt);
        }
        return Promise.resolve(txt);
    }
    catch (error){
        Promise.reject(error)
    }

}