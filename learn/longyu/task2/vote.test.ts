import { AccountUpdate, Bool, Field, Mina, PrivateKey, Proof, PublicKey } from 'o1js';
import { VoterClass, VoterProgram } from './Add';
let proofsEnabled = false;

describe('Add', () => {
    let Voter = new VoterClass({
        approve: Field(0),
        against: Field(0)
    });

    let proof: Proof<VoterClass, void>;

    beforeAll(async () => {
        const { verificationKey } = await VoterProgram.compile();
        const base = await VoterProgram.baseVoter(Voter);
        proof = base.proof;
    });


    async function localDeploy(field: Field, tick: Bool) {
        VoterProgram.voter(Voter, field, tick, proof)
    }

    it('generates field1 and approve', async () => {
        await localDeploy(Field(1), Bool(true));
        expect(Voter.approve).toEqual(Field(1));
    });

    it('generates field1 and agg', async () => {
        await localDeploy(Field(2), Bool(false));
        expect(Voter.against).toEqual(Field(1));
    });
});
