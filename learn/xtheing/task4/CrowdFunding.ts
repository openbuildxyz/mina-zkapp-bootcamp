import { AccountUpdate, method, Permissions, Provable, PublicKey, SmartContract, state, State, UInt32, UInt64, type DeployArgs } from 'o1js';

// 定义所需的区块槽数
const SlotsRequired = 200;

// 定义众筹合约类，继承自SmartContract
export class CrowdFunding extends SmartContract {
	// 定义事件，用于记录付款人、接收人和金额
	events = {
		"payer": PublicKey,
		"receiver": PublicKey,
		"amount": UInt64
	}

	@state(UInt64) hardcap = State<UInt64>();
	@state(UInt32) endtime = State<UInt32>();
	@state(PublicKey) receiver = State<PublicKey>();

	// 检查前置条件
	private preCond() {
		const hardcap = this.hardcap.getAndRequireEquals();
		const endtime = this.endtime.getAndRequireEquals();
		const receiver = this.receiver.getAndRequireEquals();
		const curBalance = this.account.balance.getAndRequireEquals();
		const curTime = this.network.blockchainLength.getAndRequireEquals();

		curTime.greaterThan(endtime).assertFalse("crowdfunding end...");
		curBalance.greaterThan(hardcap).assertFalse("crowdfunding hardcap reached...");

		return {
			hardcap,
			endtime,
			receiver,
			curBalance,
		}
	}

	// 私有方法：计算实际可筹集的资金
	private preCalcFund(amount: UInt64) {
		const hardcap = this.hardcap.getAndRequireEquals();
		const curBalance = this.account.balance.getAndRequireEquals();

		const fund = curBalance.add(amount);
		const realfund = Provable.if(
			fund.greaterThanOrEqual(hardcap),
			hardcap.sub(curBalance),
			amount
		);

		return { realfund }
	}

	// 设置资金的时间安排
	private sendTiming(curBalance: UInt64, acc: PublicKey) {
		const accUpdate = AccountUpdate.createSigned(acc);
		const linearAmount = curBalance.div(10);  // 线性分配金额
		const t = curBalance.div(5);  // 发送部分资金
		this.send({ to: accUpdate, amount: t })
		accUpdate.account.timing.set({  // 设置账户的时间安排
			initialMinimumBalance: curBalance.sub(t),
			cliffTime: UInt32.from(0),
			cliffAmount: UInt64.from(0),
			vestingPeriod: UInt32.from(SlotsRequired),
			vestingIncrement: linearAmount,
		})
	}

	async deploy(args: DeployArgs & {
		receiver: PublicKey,
		hardcap: UInt64,
		endtime: UInt32
	}) {
		await super.deploy(args);

		// 设置账户权限
		this.account.permissions.set({
			...Permissions.default(),
			send: Permissions.proof(),
			setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
			setPermissions: Permissions.impossible(),
		})

		this.receiver.set(args.receiver);
		this.hardcap.set(args.hardcap);
		this.endtime.set(args.endtime);
	}

	// 处理资金的捐赠
	@method async fund(amount: UInt64) {
		this.preCond();
		const { realfund } = this.preCalcFund(amount);
		const senderAcc = this.sender.getAndRequireSignature();
		const senderUpdate = AccountUpdate.createSigned(senderAcc);
		senderUpdate.send({ to: this, amount: realfund })
		this.emitEvent("payer", senderAcc);  // 监听并记录事件
		this.emitEvent("amount", realfund);
	}

	// 处理资金的提取
	@method async withdraw() {
		const { receiver, curBalance } = this.preCond();
		this.sender.getAndRequireSignature().assertEquals(receiver); // 确保提取者是接收人
		this.sendTiming(curBalance, receiver); // 设置资金的时间安排
		this.emitEvent("receiver", receiver); // 记录事件
		this.emitEvent("amount", curBalance);
	}
}
