import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { SbtSingle } from '../wrappers/SbtSingle';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('SbtSingle', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('SbtSingle');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let sbtSingle: SandboxContract<SbtSingle>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        sbtSingle = blockchain.openContract(SbtSingle.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await sbtSingle.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: sbtSingle.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and sbtSingle are ready to use
    });
});
