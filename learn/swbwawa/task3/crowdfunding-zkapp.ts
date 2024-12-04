import {
    Field,
    state,
    State,
    method,
    UInt64,
    PrivateKey,
    SmartContract,
    Mina,
    AccountUpdate,
    Bool,
    PublicKey,
    DeployArgs,
    Permissions
  } from 'o1js';
  import { getProfiler } from '../others/utils/profiler.js';
  
  
  const beforeGenesis = UInt64.from(Date.now());
  
  let initialState = Field(1);
  export class CrowdfundingZkapp extends SmartContract {
  
    @state(Field) x = State<Field>(initialState);
  
    async deploy(props?: DeployArgs) {
      await super.deploy(props)
  
      // 初始化合约状态
      this.x.set(initialState);
      
      // 初始化账户权限
      this.account.permissions.set({
        ...Permissions.default(),
        setVerificationKey: Permissions.VerificationKey.impossibleDuringCurrentVersion(),
        setPermissions: Permissions.impossible(),
      })
    }
  
    @method.returns(Field)
    async update(y: Field) {
      // check if has exec init()
      // this.account.provedState.requireEquals(Bool(true));
      // check if timestamp meets
      // this.network.timestamp.requireBetween(beforeGenesis, UInt64.MAXINT());
  
      // fetch onchain states
      // let x = this.x.getAndRequireEquals();
      let x = this.x.get();// x = 1
      this.x.requireEquals(x);// 
  
      let newX = x.add(y);
      this.x.set(newX);// updates
  
      return newX;
    }
  }
  
