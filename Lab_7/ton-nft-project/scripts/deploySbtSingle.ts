import { toNano } from '@ton/core';
import { SbtSingle } from '../wrappers/SbtSingle';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const sbtSingle = provider.open(SbtSingle.createFromConfig({}, await compile('SbtSingle')));

    await sbtSingle.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(sbtSingle.address);

    // run methods on `sbtSingle`
}
