import { TestPublicKey } from 'o1js/dist/node/lib/mina/local-blockchain';
import { CrowdfundingContract } from './Crowfunding';
import {
  Mina,
  PrivateKey,
  AccountUpdate,
  UInt64,
  UInt32,
  Provable,
} from 'o1js';

describe('CrowdfundingContract', () => {
  let Local: Awaited<ReturnType<typeof Mina.LocalBlockchain>>;
  let owner: TestPublicKey,
    beneficiary: TestPublicKey,
    participator1: TestPublicKey,
    participator2: TestPublicKey,
    zkPrivateKey: PrivateKey,
    contract: CrowdfundingContract;

  const FUDING_CAP = UInt64.from(10 * 1e9);
  const DEFAULT_FEE = 0.16 * 1e9;
  const FUNDING_DEADLINE = 100;

  // Helper functions
  async function sendTransaction(
    sender: TestPublicKey,
    action: () => Promise<void>,
    options: { fee?: number; memo?: string } = {}
  ) {
    const tx = await Mina.transaction(
      {
        sender,
        fee: options.fee ?? DEFAULT_FEE,
        memo: options.memo,
      },
      action
    );
    await tx.prove();
    await tx.sign([zkPrivateKey, sender.key]).send();
    return tx;
  }

  function getContractBalance(): string {
    let balance = '';
    Provable.asProver(() => {
      balance = Mina.getBalance(contract.address).toString();
    });
    return balance;
  }

  // Test setup
  beforeAll(async () => {
    await CrowdfundingContract.compile();
  });

  beforeEach(async () => {
    // Initialize local blockchain
    Local = await Mina.LocalBlockchain({ proofsEnabled: true });
    Mina.setActiveInstance(Local);
    [owner, beneficiary, participator1, participator2] = Local.testAccounts;

    // Deploy contract
    zkPrivateKey = PrivateKey.random();
    contract = new CrowdfundingContract(zkPrivateKey.toPublicKey());
    const currentSlot = Local.getNetworkState().globalSlotSinceGenesis;

    await sendTransaction(
      owner,
      async () => {
        AccountUpdate.fundNewAccount(owner);
        await contract.deploy({
          verificationKey: undefined,
          beneficiary: beneficiary,
          fundingCap: FUDING_CAP,
          deadline: UInt32.from(currentSlot.add(FUNDING_DEADLINE)),
        });
      },
      { memo: 'Deploy Funding Contract' }
    );
  });

  describe('participate()', () => {
    it('should allow investment within window and below hard cap', async () => {
      const amount = UInt64.from(100);
      await sendTransaction(
        participator1,
        async () => await contract.participate(amount),
        { memo: 'Normal investment' }
      );
      expect(getContractBalance()).toBe('100');
    });

    it('should fail when investment amount is zero', async () => {
      await expect(
        sendTransaction(
          participator1,
          async () => await contract.participate(UInt64.from(0)),
          { memo: 'Zero investment' }
        )
      ).rejects.toThrow();
    });

    it('should fail when exceeding hard cap', async () => {
      // First invest to reach hard cap
      await sendTransaction(
        participator1,
        async () => await contract.participate(FUDING_CAP),
        { memo: 'Reach hard cap' }
      );

      // Next investment should fail
      await expect(
        sendTransaction(
          participator1,
          async () => await contract.participate(UInt64.from(1)),
          { memo: 'Exceed hard cap' }
        )
      ).rejects.toThrow();
    });

    it('should fail when past deadline', async () => {
      Local.setBlockchainLength(UInt32.from(FUNDING_DEADLINE + 1));

      await expect(
        sendTransaction(
          participator1,
          async () => await contract.participate(UInt64.from(100)),
          { memo: 'Past deadline investment' }
        )
      ).rejects.toThrow();
    });
  });

  describe('withdraw()', () => {
    it('should allow beneficiary to withdraw when hard cap is reached', async () => {
      // Invest to reach hard cap
      await sendTransaction(
        participator1,
        async () => await contract.participate(FUDING_CAP),
        { memo: 'Invest to hard cap' }
      );

      // Beneficiary withdraws
      await sendTransaction(
        beneficiary,
        async () => await contract.withdraw(),
        {
          memo: 'Hard cap withdrawal',
        }
      );

      expect(getContractBalance()).toBe('0');
    });

    it('should allow beneficiary to withdraw after deadline', async () => {
      // Initial investment
      await sendTransaction(
        participator1,
        async () => await contract.participate(UInt64.from(500)),
        { memo: 'Initial investment' }
      );

      Local.setBlockchainLength(UInt32.from(FUNDING_DEADLINE + 1));

      // Beneficiary withdraws
      await sendTransaction(
        beneficiary,
        async () => await contract.withdraw(),
        {
          memo: 'Deadline withdrawal',
        }
      );

      expect(getContractBalance()).toBe('0');
    });

    it('should not allow non-beneficiary to withdraw', async () => {
      await sendTransaction(
        participator1,
        async () => await contract.participate(UInt64.from(500)),
        { memo: 'Initial investment' }
      );

      Local.setBlockchainLength(UInt32.from(FUNDING_DEADLINE + 1));

      await expect(
        sendTransaction(participator1, async () => await contract.withdraw(), {
          memo: 'Non-beneficiary withdrawal',
        })
      ).rejects.toThrow();
    });

    it('should not allow withdrawal before deadline and below hard cap', async () => {
      await sendTransaction(
        participator1,
        async () => await contract.participate(UInt64.from(500)),
        { memo: 'Initial investment' }
      );

      await expect(
        sendTransaction(beneficiary, async () => await contract.withdraw(), {
          memo: 'Early withdrawal',
        })
      ).rejects.toThrow();
    });
  });
});
