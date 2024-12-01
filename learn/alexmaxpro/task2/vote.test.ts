// Jest test for VotingSystem
import { VotingSystem } from './vote';
describe('VotingSystem', () => {
  let votingSystem: VotingSystem;

  beforeEach(() => {
    const teamMembers = ['Alice', 'Bob', 'Charlie'];
    votingSystem = new VotingSystem(teamMembers);
  });

  test('should initialize votes to zero', () => {
    const results = votingSystem.getResults();
    expect(results.yes).toBe(0);
    expect(results.no).toBe(0);
  });

  test('should allow a valid team member to vote', () => {
    votingSystem.addVote('Alice', 'yes');
    const results = votingSystem.getResults();
    expect(results.yes).toBe(1);
    expect(results.no).toBe(0);
  });

  test('should not allow a non-team member to vote', () => {
    expect(() => votingSystem.addVote('Dave', 'yes')).toThrow(
      'Voter is not a member of the team.'
    );
  });

  test('should not allow a member to vote twice', () => {
    votingSystem.addVote('Bob', 'no');
    expect(() => votingSystem.addVote('Bob', 'yes')).toThrow(
      'This member has already voted.'
    );
  });

  test('should not allow invalid vote type', () => {
    expect(() => votingSystem.addVote('Charlie', 'maybe' as 'yes')).toThrow(
      'Invalid vote type.'
    );
  });
});
