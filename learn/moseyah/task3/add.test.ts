import { AccountUpdate, Mina, PrivateKey, PublicKey, UInt64, type UInt32 } from 'o1js';
import { Add } from './add';
import { Logger } from 'tslog'; 

const logger = new Logger({
  name: 'AddContractTest',
  type: 'pretty',
  prettyLogTemplate: '{{logLevelName}} | {{dateIso}} | {{fileName}}:{{fileLineNumber}} | '
});

type PromiseUnwrap<T> = T extends Promise<infer U> 
  ? U 
  : never;

const MINA_CONVERSION_FACTOR = 1e9;
const HARDTOP_SLOT_AMOUNT = UInt64.from(20 * MINA_CONVERSION_FACTOR);

let isProofsEnabled = false;

describe('Add Contract Tests', () => {
    let deployerTestAccount: Mina.TestPublicKey,
        deployerPrivateKey: PrivateKey,
        senderTestAccount: Mina.TestPublicKey,
        senderPrivateKey: PrivateKey,
        contractAddress: PublicKey,
        contractPrivateKey: PrivateKey,
        addContract: Add,
        contractEndTimeSlot: UInt32,
        localBlockchain: PromiseUnwrap<ReturnType<typeof Mina.LocalBlockchain>>;

    beforeAll(async () => {
        logger.info('Starting test suite setup');
        if (isProofsEnabled) {
            logger.debug('Compiling Add contract');
            await Add.compile();
        }
    });

    beforeEach(async () => {
        logger.info('Setting up test environment');
        const LocalBlockchain = await Mina.LocalBlockchain({ proofsEnabled: isProofsEnabled });
        Mina.setActiveInstance(LocalBlockchain);

        [deployerTestAccount, senderTestAccount] = LocalBlockchain.testAccounts;
        deployerPrivateKey = deployerTestAccount.key;
        senderPrivateKey = senderTestAccount.key;

        contractPrivateKey = PrivateKey.random();
        contractAddress = contractPrivateKey.toPublicKey();
        addContract = new Add(contractAddress);

        contractEndTimeSlot = LocalBlockchain.getNetworkState().globalSlotSinceGenesis.add(30);
        localBlockchain = LocalBlockchain;

        logger.debug('Test environment setup complete');
    });

  async function deployContractLocally() {
    logger.info('Deploying contract locally');
    const deployTransaction = await Mina.transaction(deployerTestAccount, async () => {
      AccountUpdate.fundNewAccount(deployerTestAccount);
      await addContract.deploy({ 
        receiver: deployerTestAccount, 
        hardtop: HARDTOP_SLOT_AMOUNT, 
        endtime: contractEndTimeSlot 
      });
    });
    await deployTransaction.prove();
    logger.debug('Contract deployment transaction signed and sent');
    await (deployTransaction.sign([deployerPrivateKey, contractPrivateKey]).send());
  }

  it('Deploy Contract', async () => {
    logger.info('Starting contract deployment test');
    await deployContractLocally();
    const targetFundingAmount = addContract.hardcapAmount.get();
    logger.debug(`Current hardtop amount: ${targetFundingAmount}`);
    expect(targetFundingAmount).toEqual(UInt64.from(HARDTOP_SLOT_AMOUNT));
    
    const currentContractBalance = addContract.account.balance.getAndRequireEquals();
    logger.debug(`Current contract balance: ${currentContractBalance}`);
  });

  it('Normal Investment Operation', async () => {
    logger.info('Testing normal investment scenario');
    // Investment amount less than maximum allowed
    await deployContractLocally();
    
    // Transfer 10 MINA
    const fundingTransaction = await Mina.transaction(senderTestAccount, async () => {
      await addContract.fund(UInt64.from(10 * MINA_CONVERSION_FACTOR));
    });
    await fundingTransaction.prove();
    await fundingTransaction.sign([senderPrivateKey]).send();
    
    const finalContractBalance = addContract.account.balance.getAndRequireEquals();
    logger.debug(`Contract balance after funding: ${finalContractBalance}`);
    
    // Balance should equal investment amount
    expect(finalContractBalance).toEqual(UInt64.from(10 * MINA_CONVERSION_FACTOR));
  });

  it('Exceeding Hardtop Investment Handling', async () => {
    logger.info('Testing investment exceeding hardtop');
    // Investment amount exceeding maximum allowed
    await deployContractLocally();
    
    const fundingTransaction = await Mina.transaction(senderTestAccount, async () => {
      await addContract.fund(UInt64.from(20 * MINA_CONVERSION_FACTOR));
    });
    await fundingTransaction.prove();
    await fundingTransaction.sign([senderPrivateKey]).send();
    
    const finalContractBalance = addContract.account.balance.getAndRequireEquals();
    logger.debug(`Contract balance after exceeding hardtop: ${finalContractBalance}`);
    
    // Balance should equal hardtop amount
    expect(finalContractBalance).toEqual(UInt64.from(20 * MINA_CONVERSION_FACTOR));
  });

  it('Withdrawal Before Maturity Fails', async () => {
    logger.info('Testing premature withdrawal');
    await deployContractLocally();
    
    const withdrawalTransaction = await Mina.transaction(deployerTestAccount, async () => {
      await addContract.withdraw();
    });
    await withdrawalTransaction.prove();
    await withdrawalTransaction.sign([deployerPrivateKey]).send();

    const receiverBalanceChange = AccountUpdate.create(senderTestAccount).balanceChange.equals(20 * MINA_CONVERSION_FACTOR);
    logger.debug(`Receiver balance change status: ${receiverBalanceChange}`);
    
    expect(receiverBalanceChange).toBeTruthy();
  });

  it('Normal Withdrawal Operation', async () => {
    logger.info('Testing normal withdrawal after maturity');
    await deployContractLocally();
    
    // Simulate time passing
    localBlockchain.incrementGlobalSlot(50);
    const currentNetworkSlot = localBlockchain.getNetworkState().globalSlotSinceGenesis;
    logger.debug(`Current network slot: ${currentNetworkSlot}`);

    const withdrawalTransaction = await Mina.transaction(deployerTestAccount, async () => {
      await addContract.withdraw();
    });
    await withdrawalTransaction.prove();
    await withdrawalTransaction.sign([deployerPrivateKey]).send();

    const receiverBalanceChange = AccountUpdate.create(senderTestAccount).balanceChange.equals(20 * MINA_CONVERSION_FACTOR);
    logger.debug(`Receiver balance change status: ${receiverBalanceChange}`);
    
    expect(receiverBalanceChange).toBeTruthy();
  });

  it('Unauthorized Withdrawal Fails', async () => {
    logger.info('Testing unauthorized withdrawal');
    await deployContractLocally();
    
    await expect(
      Mina.transaction(senderTestAccount, async () => {
        await addContract.withdraw();
      })
    ).rejects.toThrow();
    
    logger.debug('Unauthorized withdrawal correctly rejected');
  });
});
