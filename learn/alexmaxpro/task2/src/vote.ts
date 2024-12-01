class VotingSystem {
  teamMembers: Set<string>;
  votes: { yes: number; no: number };
  votedMembers: Set<string>;
  constructor(teamMembers: string[]) {
    this.teamMembers = new Set(teamMembers);
    this.votes = {
      yes: 0,
      no: 0,
    };
    this.votedMembers = new Set();
  }

  addVote(voter: string, voteType: 'yes' | 'no') {
    if (!this.teamMembers.has(voter)) {
      throw new Error('Voter is not a member of the team.');
    }
    if (this.votedMembers.has(voter)) {
      throw new Error('This member has already voted.');
    }
    if (!['yes', 'no'].includes(voteType)) {
      throw new Error('Invalid vote type.');
    }

    this.votes[voteType]++;
    this.votedMembers.add(voter);
  }

  getResults() {
    return { ...this.votes };
  }
}

export {
  VotingSystem,
}