import { SmartContract, State, state, Field, method, Provable, DeployArgs, Permissions } from "o1js";

export class CrowdFunding extends SmartContract {
  @state(Field)
  x = State<Field>()
  @state(Field)
  endTime = State<Field>()
  async deploy(props?: DeployArgs): Promise<void> {
    super.deploy();
    this.x.set(Field(0));
    this.endTime.set(Field(Date.now() + 10000 * 24));
    this.account.permissions.set({
      ...Permissions.default(),
      setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
      setPermissions: Permissions.impossible()
    })
  }

  @method
  async update(increment: Field) {
    const x = this.x.get();
    this.x.requireEquals(x);
    const endTime = this.endTime.get();
    this.endTime.requireEquals(endTime);
    const now = Date.now();
    this.endTime.get().assertGreaterThanOrEqual(Field(now));
    const newState = x.add(increment)
    this.x.set(newState);
  }
}