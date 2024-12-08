import { Field, SmartContract, state, State, method, DeployArgs, Permissions, Bool, PublicKey, PrivateKey, UInt32, Provable, UInt64, AccountUpdate} from 'o1js';

export class CrowdFunding extends SmartContract {
    // 众筹截止时间
    @state(UInt32) deadline = State<UInt32>();
    // 众筹目标金额
    @state(UInt64) hardCap = State<UInt64>();
    // 众筹发起者
    @state(PublicKey) owner = State<PublicKey>();

    async deploy(args: DeployArgs & {
        owner: PublicKey
    }) {
        super.deploy(args);

        // 设置合约权限
        this.account.permissions.set({
            ...Permissions.default(),
            setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
            setPermissions: Permissions.impossible(),
        })

    }

    @method async initState(hardCap: UInt64, deadline: UInt32) {
        //确保链上状态被加载到本地环境
        this.account.provedState.getAndRequireEquals();
        this.account.provedState.get().assertFalse("合约已被初始化！");

        //只允许合约拥有者初始化
        // const sender = this.sender.getUnconstrained();
        // const owner = this.owner.getAndRequireEquals();
        // this.owner.requireEquals(owner);
        // owner.equals(sender).assertTrue("只有合约拥有者可以初始化！");

        this.hardCap.set(hardCap);
        this.deadline.set(deadline);
    }

    private checkState() {
        // 确保合约已被初始化
        this.account.provedState.getAndRequireEquals();
        this.account.provedState.get().assertTrue("合约尚未被初始化或状态不对！");
    }

    private precondition() {
        // 确保合约已被初始化
        //this.checkState();

        // 确保众筹未结束
        this.deadline.getAndRequireEquals();
        this.network.blockchainLength.getAndRequireEquals();
        this.network.blockchainLength.get().lessThanOrEqual(this.deadline.get()).assertTrue("众筹已结束！");

        // 确保众筹金额未达到目标金额
        this.hardCap.getAndRequireEquals();
        this.account.balance.getAndRequireEquals();
        this.account.balance.get().lessThanOrEqual(this.hardCap.get()).assertTrue("众筹金额已达到目标金额！");
    }

    private end() {
        // 确保合约已被初始化
        //this.checkState();

        // 确保众筹已结束
        this.deadline.getAndRequireEquals();
        this.network.blockchainLength.getAndRequireEquals();
        this.network.blockchainLength.get().greaterThan(this.deadline.get()).assertTrue("众筹还未结束！");
    }

    // 贡献资金
    @method async contribute(amount: UInt64) {
        // 确保众筹条件满足
        this.precondition();

        // 贡献金额需大于0
        amount.greaterThan(UInt64.from(0)).assertTrue("贡献金额必须大于0");
        // 计算距离hardcap的值
        const remaining = this.hardCap.get().sub(this.account.balance.get());


        // 如果溢出，则只add remaining
        const addAmount = Provable.if(
            amount.lessThanOrEqual(remaining),
            amount,
            remaining
        );


        // // 将资金发送给合约所有者
        // const sender = this.sender.getAndRequireSignature();
        // AccountUpdate.createSigned(sender)
        //     .send({ to: this.address, amount: addAmount });
        this.send({to: this.owner.getAndRequireEquals(), amount: addAmount});

        const overflow = amount.sub(addAmount);
        if (overflow.greaterThan(UInt64.from(0))) {
            this.send({to: this.sender.getUnconstrained(), amount: overflow});
        }
    }

    // 账号拥有者提现
    @method async withdraw() {
        // 确保众筹已结束
        this.end();
        // 获取合约所有者的公钥
        const contractOwner = this.owner.getAndRequireEquals();
        // 获取调用者的公钥
        const sender = this.sender.getAndRequireSignature();


        // 验证调用者是否为合约所有者
        sender.equals(contractOwner).assertTrue("只有合约拥有者可以提现");
        this.send({to:sender, amount:this.account.balance.getAndRequireEquals()});
    }
}
