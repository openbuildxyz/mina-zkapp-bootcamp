import {
    SmartContract,
    Field,
    State,
    state,
    method,
    Poseidon,
    MerkleTree,
    MerkleWitness,
    UInt32,
    Circuit,
    PrivateKey,
    Mina,
  } from 'o1js';
  
  // 定义 Merkle Tree 见证类
  export class TeamMerkleWitness extends MerkleWitness(8) {}
  
  // 定义投票结果的密文（支持同态加密）
  export class VoteCipher extends Field {
    static encrypt(vote: Field, random: Field): VoteCipher {
      return Poseidon.hash([Field(vote), random]);
    }
  
    static decrypt(cipher: VoteCipher, random: Field): Field {
      // 实际解密会需要更多处理
      return cipher.sub(random);
    }
  }
  
  // 投票统计合约
  export class Vote extends SmartContract {
    @state(Field) merkleRoot = State<Field>(); // Merkle Tree 根
    @state(Field) yesCount = State<Field>(); // 赞成票加密累积
    @state(Field) noCount = State<Field>(); // 反对票加密累积
  
    @method async initialize(root: Field) {
      this.merkleRoot.set(root);
      this.yesCount.set(Field(0));
      this.noCount.set(Field(0));
    }
  
    @method async vote(
      voteCipher: VoteCipher,
      witness: TeamMerkleWitness,
      voteType: Field,
      random: Field
    ) {
      // 验证投票者是否在团队中
      let root = this.merkleRoot.get();

      this.merkleRoot.requireEquals(root);
  
      // we check that the account is within the committed Merkle Tree
      witness.calculateRoot(Poseidon.hash([voteCipher])).assertEquals(root);
  
      // 累加票数
      let yesCount = this.yesCount.get();
      let noCount = this.noCount.get();
      this.yesCount.requireEquals(yesCount);
      this.noCount.requireEquals(noCount);
  
      // 将 voteType 转换为 BigInt
      let encryptedVote = VoteCipher.encrypt(voteType, random);
      if (voteType.equals(Field(1)).toBoolean()) {
        this.yesCount.set(yesCount.add(encryptedVote));
      } else {
        this.noCount.set(noCount.add(encryptedVote));
      }
    }
  }
  
  // 初始化合约
  const Tree = new MerkleTree(8);
  // ... existing code ...
  const teamMembers = ['Alice', 'Bob', 'Charlie'].map(member => 
    Poseidon.hash([Field(member)])
  );
  // ... existing code ...
  teamMembers.forEach((member, index) => {
    Tree.setLeaf(BigInt(index), member);
  });
  
  const contract = new Vote(Mina.TestPublicKey.random());
  await contract.initialize(Tree.getRoot());
  
  // 示例投票
  const voterIndex = 1; // Bob
  const voterWitness = new TeamMerkleWitness(Tree.getWitness(BigInt(voterIndex)));
  
  const random = Field.random();
  console.log("random:{}", random);
  await contract.vote(VoteCipher.encrypt(Field(1), random), voterWitness, Field(1), random); // Bob 投赞成票

  console.log("赞成票累计:{}", contract.yesCount);
  console.log("拒绝票累计:{}", contract.noCount);
  