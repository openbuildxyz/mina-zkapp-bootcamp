import { MerkleMapWitness, SmartContract, Field, Bool, state, State, method, Poseidon, PublicKey, Signature, Provable } from 'o1js';

export class task2 extends SmartContract {
    // 存储支持票和反对票的计数
    @state(Field) supportVotes = State<Field>();
    @state(Field) opposeVotes = State<Field>();

    // 存储用户身份的哈希树根（通过梅克尔树存储）
    @state(Field) userHashTreeRoot = State<Field>();

    /**
     * 初始化智能合约状态
     * 
     * 该方法将根据提供的用户哈希树根值初始化状态。
     * 
     * @param userRoot 可选参数，用于初始化用户哈希树根
     */
    init(userRoot?: Field) {
        super.init();

        if (userRoot) {
            // 初始化支持票计数为 0
            this.supportVotes.set(Field(0));
            // 初始化反对票计数为 0
            this.opposeVotes.set(Field(0));
            // 设置用户身份哈希树根
            this.userHashTreeRoot.set(userRoot);
        }
    }

    /**
     * 提交投票
     * 
     * 该方法用于接收投票并执行验证。它会验证投票者的身份、签名并根据投票内容更新票数。
     * 
     * @param userPublicKey 投票者的公钥，用于验证签名和确认投票者身份
     * @param vote 投票内容，布尔值，true 表示支持，false 表示反对
     * @param userSignature 投票者的签名，用于验证投票的合法性
     * @param userHashWitness 用户哈希树的见证，用于确认投票者是否为有效成员
     */
    @method async castVote(userPublicKey: PublicKey, vote: Bool, userSignature: Signature, userHashWitness: MerkleMapWitness) {
        // 验证签名的有效性
        const voteMessage = vote.toField();
        userSignature.verify(userPublicKey, [voteMessage]).assertEquals(true, 'Signature verification failed');

        // 验证投票者是否是有效用户
        const expectedRoot = this.userHashTreeRoot.get();  // 获取用户哈希树根
        const [calculatedRoot] = userHashWitness.computeRootAndKey(Poseidon.hash(userPublicKey.toFields()));  // 计算投票者的哈希
        calculatedRoot.assertEquals(expectedRoot, '新韭菜你没资格投票！'); // 若不匹配则投票失败

        this.supportVotes.requireEquals(this.supportVotes.get());
        this.opposeVotes.requireEquals(this.opposeVotes.get());
        this.userHashTreeRoot.requireEquals(this.userHashTreeRoot.get());


        // 获取当前的支持票和反对票计数
        const currentSupportVotes = this.supportVotes.get();
        const currentOpposeVotes = this.opposeVotes.get();

        // 更新支持票和反对票计数
        this.supportVotes.set(
            Provable.if(vote,
                currentSupportVotes.add(1),  // 如果投的是支持票，则增加支持票
                currentSupportVotes
            )
        );

        this.opposeVotes.set(
            Provable.if(vote.not(),
                currentOpposeVotes.add(1),  // 如果投的是反对票，则增加反对票
                currentOpposeVotes
            )
        );
    }

    /**
     * 获取当前投票结果
     * 
     * 该方法返回当前的支持票和反对票数量
     * 
     * @returns {Promise<Object>} 返回一个包含当前支持票和反对票数量的对象
     */
    @method.returns(Object({ support: Field, oppose: Field })) async getCurrentResults(): Promise<{ support: Field; oppose: Field }> {
        // 确保当前支持票和反对票数是正确的
        this.supportVotes.requireEquals(this.supportVotes.get());
        this.opposeVotes.requireEquals(this.opposeVotes.get());

        // 返回当前的支持票和反对票数
        return {
            support: this.supportVotes.get(),
            oppose: this.opposeVotes.get()
        };
    }
}