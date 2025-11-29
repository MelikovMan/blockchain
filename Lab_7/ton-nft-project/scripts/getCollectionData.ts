import { Address } from '@ton/core';
import { NFTCollection as NftCollection, NftCollectionConfig, nftContentToCell } from '../wrappers/NFTCollection';
import { compile, NetworkProvider } from '@ton/blueprint';

const addr = "kQBH0K8Exq-ly1sGh9f1GmN3UZUl55aExULeHRrPLxgeN4ed"
const contractAddress=Address.parse(addr)
export async function run(provider: NetworkProvider) {
    const NFTCollection = provider.open(NftCollection.createFromAddress(contractAddress))

    const data = await NFTCollection.getCollectionData();

    console.log(data);
}