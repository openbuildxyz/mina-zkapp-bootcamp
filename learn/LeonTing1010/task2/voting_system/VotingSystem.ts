import { Field, SmartContract, state, State, method, Bool, PublicKey, Poseidon, MerkleWitness, Provable } from 'o1js';

const TREE_HEIGHT = 8; // 默克尔树的高度
// creates the corresponding MerkleWitness class that is circuit-compatible
class MemberMerkleWitness extends MerkleWitness(TREE_HEIGHT) { }

export class VotingSystem extends SmartContract {
    // 存储赞成票和反对票的数量
    @state(Field) approveCount = State<Field>();
    @state(Field) rejectCount = State<Field>();
    // 存储团队成员的默克尔树根
    @state(Field) teamMembersMerkleRoot = State<Field>();

    // 初始化合约
    init() {
        super.init();

        // 初始投票数为0
        this.approveCount.set(Field(0));
        this.rejectCount.set(Field(0));

        // 默克尔树根初始化为0
        this.teamMembersMerkleRoot.set(Field(0));
    }

    // 预设团队成员的默克尔树根
    @method async initTeamMembersMerkleRoot(merkleRoot: Field) {
        // 计算并保存默克尔树根
        this.teamMembersMerkleRoot.set(merkleRoot);
    }


    // 验证投票者是否是团队成员
    isTeamMember(voterPK: PublicKey, path: MemberMerkleWitness): Bool {
        // 获取 Merkle 根
        let merkleRoot = this.teamMembersMerkleRoot.get();
        // 断言 merkleRoot 一致性
        this.teamMembersMerkleRoot.requireEquals(merkleRoot);

        // 使用 MerkleWitness 来验证投票者的证明路径
        // 计算投票者公钥的哈希值（使用 Poseidon 哈希）
        let voterHash = Poseidon.hash(voterPK.toFields());

        // 使用 MerkleWitness 验证投票者是否为团队成员
        return path.calculateRoot(voterHash).equals(merkleRoot);
    }

    // 投票方法
    @method async vote(voterPK: PublicKey, isApprove: Bool, path: MemberMerkleWitness) {
        // 验证投票者是否为团队成员
        const isMember = await this.isTeamMember(voterPK, path);

        // 确保投票者是团队成员
        isMember.assertTrue('投票者不是团队成员，无法投票');


        // 获取当前的投票状态
        const currentApproveCount = this.approveCount.get();
        const currentRejectCount = this.rejectCount.get();

        this.approveCount.requireEquals(currentApproveCount);
        this.rejectCount.requireEquals(currentRejectCount);

        // 根据投票结果更新票数
        this.approveCount.set(currentApproveCount.add(Provable.if(
            isApprove,
            Field(1),
            Field(0)
        )));
        this.rejectCount.set(currentRejectCount.add(Provable.if(
            isApprove,
            Field(0),
            Field(1)
        )));
    }
    // 查询当前投票结果（赞成票和反对票）
    @method async getVotesCount() {
        // 获取当前投票数据
        const approve = this.approveCount.get();
        const reject = this.rejectCount.get();
        this.approveCount.requireEquals(approve);
        this.rejectCount.requireEquals(reject);
        Provable.asProver(() => {
            // 触发事件，将赞成票和反对票返回给前端
            this.emitEvent('VotingResult', {
                approveCount: approve.toJSON(),  // 通过 `toJSON()` 转换为可传递的格式
                rejectCount: reject.toJSON(),
            });
            // 也可以选择记录到日志中（调试目的）
            console.log(`Approve count: ${approve.toString()}`);
            console.log(`Reject count: ${reject.toString()}`);
        });
        return;
    }
}
