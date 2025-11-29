import { Address, toNano } from '@ton/core';
import { NFTCollection as NftCollection, NftCollectionConfig, nftContentToCell } from '../wrappers/NFTCollection';
import { compile, NetworkProvider } from '@ton/blueprint';

const addr = "kQBH0K8Exq-ly1sGh9f1GmN3UZUl55aExULeHRrPLxgeN4ed"
const contractAddress=Address.parse(addr)
export async function run(provider: NetworkProvider) {
    const NFTCollection = provider.open(NftCollection.createFromAddress(contractAddress))


    const nftItemContentCell = nftContentToCell({
            uri: 'https://example.com/nft1.json',
    });
    const initialData = await NFTCollection.getCollectionData();
    let itemIndex = initialData.nextItemIndex;
    let itemAddress = await NFTCollection.getNftAddressByIndex(itemIndex);
    console.log('Next item index:', initialData.nextItemIndex, ' address:', itemAddress.toString());

    if (await provider.isContractDeployed(itemAddress)) {
        throw Error('Already deployed');
    }
    const mintResult = await NFTCollection.sendMint(provider.sender(), {
        value: toNano('0.5'),
        queryId: 0,
        nftItemContent: nftItemContentCell,
        itemIndex: initialData.nextItemIndex,
        amount: toNano('0.1')
    });
    await provider.waitForLastTransaction();

    console.log(mintResult);


}