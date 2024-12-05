/**
 * task2： 设计一个简单的投票统计器
 * 设计一个简单的投票统计器用于小团队内部投票，要求能累积统计出赞成票和反对票的票数
 * 考虑检查投票者属于团队成员，假设队员不会重复投票
 * 
 * 提示：通过 递归zkp来 累计 团队内每个人的投票(赞成票和反对票)。
 * 其中，"检查投票者属于团队成员", 有两种方式：
*   可以采用 MerkleTree的Inclusion Proof做成员证明,
     需查阅下：https://docs.minaprotocol.com/zkapps/o1js/merkle-tree 
*   或可以采用普通的三元表达式判断符(用于团队只有几个人的情况).
 */

import { Field, ZkProgram, SelfProof,MerkleMapWitness,  Struct, Bool, Provable } from 'o1js';

/**
 * 定义投票结果，这个投票结果是任意一个时刻的投票结果
 */

export class VoteResult extends Struct({
    yes:Field,
    no:Field,
    voter:Field
}){}

/**
 * 直接使用o1js 2.x版本进行演示，定义一个投票程序
 * 部分内容没有想明白
 * 
 */
export const VoteProgram = ZkProgram({
    name:"Vote",
    publicInput: VoteResult,
    methods:{
        init:{
            privateInputs:[],
            async method(init:VoteResult){
                init.yes.assertEquals(Field(0))
                init.yes.assertEquals(Field(0))
            }
        },
        vote:{
            privateInputs:[Bool,MerkleMapWitness,SelfProof],
            async method(
                publicInput:VoteResult,
                isYes:Bool,
                voterNode:MerkleMapWitness,
                earlierProof:SelfProof<Field,void>
            ){
                earlierProof.verify();
                // const earlierVoteResultYes = (earlierProof.publicInput as unknown as VoteResult).yes;
                // const earlierVoteResultNo =  (earlierProof.publicInput as unknown as VoteResult).no;

                const {yes,no,voter} = publicInput;

                const [root] = voterNode.computeRootAndKey(Field(1));
                // @ts-expect-error
                root.assertEquals(earlierProof.publicInput.voter)

                const earlier = Provable.if(isYes,yes,no);
                const current = Provable.if(isYes,yes,no);

                // 通过递归比较投票结果
                earlier.add(1).assertEquals(current);
                
            }
        }
    }
})