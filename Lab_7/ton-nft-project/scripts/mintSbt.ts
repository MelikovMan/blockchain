import { Address, toNano } from '@ton/core';
import { NFTCollection as NftCollection, NftCollectionConfig, nftContentToCell } from '../wrappers/NFTCollection';
import { compile, NetworkProvider } from '@ton/blueprint';

const addr = "kQBH0K8Exq-ly1sGh9f1GmN3UZUl55aExULeHRrPLxgeN4ed"
const contractAddress=Address.parse(addr)
export async function run(provider: NetworkProvider) {
    const collection = provider.open(NftCollection.createFromAddress(contractAddress))

    const ownerAddress = provider.sender().address!;
    const authorityAddress = ownerAddress;
    if (!(await provider.isContractDeployed(collection.address))) {
        throw new Error('Collection not deployed');
    }

    let collData = await collection.getCollectionData();
    console.log('Next item ID:', collData.nextItemIndex);

    let itemIndex = collData.nextItemIndex;
    let itemAddress = await collection.getNftAddressByIndex(itemIndex);
    console.log('Next item index:', collData.nextItemIndex, ' address:', itemAddress.toString());

    if (await provider.isContractDeployed(itemAddress)) {
        throw Error('Already deployed');
    }

    let res = await collection.sendSbt(provider.sender(), {
        value:toNano('0.2'),
        passAmount: toNano('0.1'),
        itemIndex: itemIndex,
        itemOwnerAddress: ownerAddress,
        // '%d.json' % itemIndex
        itemContent: `${itemIndex}/${itemIndex}.json`,
        itemAuthority: authorityAddress
    })
    console.log('Sent collection mint request');

    await provider.waitForDeploy(itemAddress);
    console.log('Item deployed: ', itemAddress);


}