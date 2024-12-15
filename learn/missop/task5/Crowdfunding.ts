import { DeployArgs, method, PublicKey, SmartContract, state, State, UInt32, UInt64, Permissions, Provable, assert, Mina, AccountUpdate } from "o1js";
import { FungibleToken } from "./FungibleToken";

interface CrowdfundingDeployProps extends Exclude<DeployArgs, undefined> {
    hardcap: UInt64;
    endTime: UInt32;
}

export class Crowdfunding extends SmartContract {
    @state(UInt64) hardcap = State<UInt64>();
    @state(UInt32) endTime = State<UInt32>();
    @state(PublicKey) fungibleToken = State<PublicKey>();

    static FungibleTokenContract: new (...args: any) => FungibleToken = FungibleToken;

    async deploy(props: CrowdfundingDeployProps) {
        await super.deploy(props);
        this.hardcap.set(props.hardcap);
        this.endTime.set(props.endTime);

        this.account.permissions.set({
            ...Permissions.default(),
            setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
            setPermissions: Permissions.impossible(),
            access: Permissions.proof(),
        })
    }

    /**
     * 部署FungibleToken合约之后执行该方法
     * @param fungibleToken 把FungibleToken合约的地址传进来
     */
    @method async initialize(fungibleToken: PublicKey) {
        this.fungibleToken.set(fungibleToken);
    }

    /**
     * buy fungible token 1:1 ratio
     * @param amount 
     */
    @method async buyFungiableToken(seller: PublicKey, buyer: PublicKey, amount: UInt64) {
        this.validate(seller, buyer, amount);

        const fungibleTokenContract = await this.getFungibleToken();
        await fungibleTokenContract.transfer(seller, buyer, amount);
        // buyer支付给 seller MINA
        const senderUpdate = AccountUpdate.createSigned(buyer);
        senderUpdate.send({ to: seller, amount })
    }

    private async validate(from: PublicKey, to: PublicKey, amount: UInt64) {
        // first，validate whether the crowdfunding has ended or not
        const endTime = this.endTime.getAndRequireEquals();
        const currentTime = this.network.blockchainLength.getAndRequireEquals();
        currentTime.assertGreaterThan(endTime, "Crowdfunding has not started yet");
        // second，validate the balance of to is enough to pay MINA token
        // const recipientBalance = Mina.getBalance(to);
        // recipientBalance.assertGreaterThanOrEqual(amount, "Not enough balance to buy fungible token");
        // third,validate the balance of fungible token is enough to buy
        const fungibleTokenContract = await this.getFungibleToken();
        const fromBalance = await fungibleTokenContract.getBalanceOf(from);
        fromBalance.assertGreaterThanOrEqual(amount, "Not enough balance to sell fungible token");
        from.equals(to).assertFalse(
            'from equals to'
        );
        // amount not greater than hardcap
        amount.assertLessThanOrEqual(this.hardcap.getAndRequireEquals());
    }

    public async getFungibleToken(): Promise<FungibleToken> {
        const _fungibleToken = await Provable.witnessAsync(PublicKey, async () => {
            let pk = await this.fungibleToken.fetch()
            assert(pk !== undefined, "fungible token not found")
            return pk
        });
        this.fungibleToken.requireEquals(_fungibleToken);
        return (new Crowdfunding.FungibleTokenContract(_fungibleToken));
    }
}