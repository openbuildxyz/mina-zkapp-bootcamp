import {
  state,
  DeployArgs,
  Field,
  SmartContract,
  State,
  UInt64,
  Permissions,
  method,
} from "o1js";

let initialState = Field(1);

export class CrowdfundContract extends SmartContract {
  @state(Field) x = State<Field>(initialState);
  async deploy(props?: DeployArgs) {
    await super.deploy(props);

    this.x.set(initialState);
    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey:
        Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible(),
    });
  }

  @method.returns(Field)
  async update(y: Field) {
    let x = this.x.get();
    this.x.requireEquals(x);

    let newX = x.add(y);
    this.x.set(newX);

    return newX;
  }
}
