import { address, beginCell, toNano, Address } from '@ton/core';
import { NFTCollection as NftCollection, NftCollectionConfig, nftContentToCell } from '../wrappers/NFTCollection';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {

           const collectionContentCell = nftContentToCell({
                uri: 'https://example.com/collection.json',
            });
            
            const address = provider.sender().address
            if (!address){
                throw("Invalid address!")
            }
            const nftCollectionCode = await compile('NFTCollection');
            const nftItemCode = await compile('NFTItem');
            const royaltyParams = beginCell()
                .storeUint(500, 16) // Example: 5% royalty fee
                .storeAddress(address) // Royalty recipient address
                .endCell();
    
            // Create the collection config
            const collectionConfig: NftCollectionConfig = {
                ownerAddress: address,
                nextItemIndex: 0n,
                nftItemCode: nftItemCode,
                collectionContent: collectionContentCell,
                royaltyParams: royaltyParams
            };
    
            // Create the collection contract instance
    const nftCollection = provider.open(NftCollection.createFromConfig(collectionConfig, await compile('NftCollection')));

    await nftCollection.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(nftCollection.address);

    // run methods on `nftCollection`
}
