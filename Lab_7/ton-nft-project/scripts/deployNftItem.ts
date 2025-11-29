import { Address, toNano } from '@ton/core';
import { NFTItem as NftItem, type NftItemConfig } from '../wrappers/NFTItem';
import { compile, NetworkProvider } from '@ton/blueprint';
import { NFTCollection, nftContentToCell } from '../wrappers/NFTCollection';
const addr = "kQBH0K8Exq-ly1sGh9f1GmN3UZUl55aExULeHRrPLxgeN4ed"
const contractAddress=Address.parse(addr)
export async function run(provider: NetworkProvider) {
    const collection = provider.open(NFTCollection.createFromAddress(contractAddress))
    
    const data = await collection.getCollectionData();
    const nftItemContentCell = nftContentToCell({
                uri: 'https://example.com/nft2.json',
    });
    const itemConfig:NftItemConfig = {
        index:data.nextItemIndex,
        collectionAddress:contractAddress,
        ownerAddress:data.ownerAddress,
        content:nftItemContentCell

    }
    const nftItem = provider.open(NftItem.createFromConfig(itemConfig, await compile('NftItem')));

    await nftItem.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(nftItem.address);

    // run methods on `nftItem`
}
