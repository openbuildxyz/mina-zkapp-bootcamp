
import { SmartContract, state, State, PublicKey, UInt64, DeployArgs, Permissions, method, UInt32, AccountUpdate, Struct, Field } from 'o1js';

export class AmberCrowdFunding extends SmartContract {
    // 众筹截止时间
    @state(UInt32) deadline = State<UInt32>();
    // 众筹目标金额
    @state(UInt64) hardCap = State<UInt64>();
    // 众筹发起者
    @state(PublicKey) owner = State<PublicKey>();
    //金额
    @state(UInt64) fixedPrice = State<UInt64>();
    //售出数量
    @state(UInt64) soldAmount = State<UInt64>();


    async deploy(args: DeployArgs & {
        owner: PublicKey,
        hardCap: UInt64,
        deadline: UInt32,
        fixedPrice: UInt64
    }) {
        super.deploy(args);

        // 设置合约权限
        this.account.permissions.set({
            ...Permissions.default(),
            setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
            setPermissions: Permissions.impossible(),
        })

        this.owner.set(args.owner);
        this.hardCap.set(args.hardCap);
        this.deadline.set(args.deadline);
        this.fixedPrice.set(args.fixedPrice);
        this.soldAmount.set(UInt64.from(0));
    }

    @method async contribute() {
        this.precondition();
        const sender = this.sender.getAndRequireSignature();

        const fixedPrice = this.fixedPrice.getAndRequireEquals();

        const soldAmount = this.soldAmount.getAndRequireEquals();
        this.soldAmount.set(soldAmount.add(fixedPrice));
    
        const senderUpdate = AccountUpdate.createSigned(sender);
        senderUpdate.send({ to: this.address, amount: fixedPrice });
    
        const receiverAcctUpt = this.send({ to: sender, amount: fixedPrice });
        receiverAcctUpt.body.mayUseToken = AccountUpdate.MayUseToken.InheritFromParent;// MUST ADD THIS!
      }

      @method async withdraw() {
        // 确保众筹已结束
        this.end();
        // 获取合约所有者的公钥
        const contractOwner = this.owner.getAndRequireEquals();
        // 获取调用者的公钥
        const sender = this.sender.getAndRequireSignature();

        // 验证调用者是否为合约所有者
        sender.equals(contractOwner).assertTrue("只有合约拥有者可以提现");
    
        const contractUpdate = AccountUpdate.createSigned(this.address);
        const amount = contractUpdate.account.balance.getAndRequireEquals();
        contractUpdate.send({ to: sender, amount: amount });
    
      }

      @method async withdrawToken() {
        // 确保众筹已结束
        this.end();
        // 获取合约所有者的公钥
        const contractOwner = this.owner.getAndRequireEquals();
        // 获取调用者的公钥
        const sender = this.sender.getAndRequireSignature();
        // 验证调用者是否为合约所有者
        sender.equals(contractOwner).assertTrue("只有合约拥有者可以提现");
    
        const amount = this.account.balance.getAndRequireEquals();
        const receiverAcctUpt = this.send({ to: sender, amount: amount });
        receiverAcctUpt.body.mayUseToken = AccountUpdate.MayUseToken.InheritFromParent;// MUST ADD THIS!
      }

      private end() {
        // 确保众筹已结束
        this.deadline.getAndRequireEquals();
        this.network.blockchainLength.getAndRequireEquals();
        this.network.blockchainLength.get().greaterThan(this.deadline.get()).assertTrue("众筹还未结束！");
    }

      private precondition() {
        // 确保众筹未结束
        this.deadline.getAndRequireEquals();
        this.network.blockchainLength.getAndRequireEquals();
        this.network.blockchainLength.get().lessThanOrEqual(this.deadline.get()).assertTrue("众筹已结束！");

        // 确保众筹金额未达到目标金额
        this.hardCap.getAndRequireEquals();
        this.soldAmount.getAndRequireEquals();
        this.soldAmount.get().lessThanOrEqual(this.hardCap.get()).assertTrue("众筹金额已达到目标金额！");
    }

    getBalance(tokenId?: Field) {
        const senderUpdate = AccountUpdate.create(this.address, tokenId);
        return senderUpdate.account.balance.get();
      }

}