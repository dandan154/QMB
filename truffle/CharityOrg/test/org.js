const CharityOrg = artifacts.require("CharityOrg");
const SafeMath = artifacts.require("SafeMath");

contract('CharityOrg', (accounts) => {

  //NOTE: ENSURE THAT BOTH ACCOUNTS ARE UNLOCKED DURING LIVE DEPLOYMENT TESTING TO PREVENT ERRORS
  const main = accounts[0];
  const backup = accounts[1];
  const extra = accounts[2];

  it('Contract Deployment Speed', async() => {
    const OrgInstance = await CharityOrg.new("CharityCo");
  });

  it('Contract Destruction Speed', async() => {
    const OrgInstance = await CharityOrg.new("CharityCo");
    OrgInstance.kill();
  });

  it('President should be able to add new members to the organisation', async() =>{

    const OrgInstance = await CharityOrg.new("CharityCo");

    await OrgInstance.addMember(main, "Charles",  "De Gaulle");
    const member = await OrgInstance.getMember(main);

    assert.equal(member._fname, "Charles", "Member's first name is incorrect");
    assert.equal(member._lname, "De Gaulle", "Member's last name is incorrect");
    assert.equal(member._addr, main, "Member's address is incorrect");
  });

  it('President should be able to add remove members from the organisation', async() =>{

    const OrgInstance = await CharityOrg.new("CharityCo");

    await OrgInstance.addMember(backup, "Charles",  "De Gaulle");
    await OrgInstance.removeMember(backup);

    const member = await OrgInstance.getMember(backup);

    assert.equal(member._fname, "", "Member's first name is incorrect");
    assert.equal(member._lname, "", "Member's last name is incorrect");
    assert.equal(member._addr, "0x0000000000000000000000000000000000000000", "Member's address is incorrect");
  });

  it('Organisation member should be able to become candidate', async() =>{

    const OrgInstance = await CharityOrg.new("CharityCo");

    await OrgInstance.addMember(main, "Charles",  "De Gaulle");
    await OrgInstance.startCandidacy();

    const canArr = await OrgInstance.getCandidates();
    const member = await OrgInstance.getMember(main);


    assert.equal(member._fname, "Charles", "Member's first name is incorrect");
    assert.equal(member._lname, "De Gaulle", "Member's last name is incorrect");
    assert.equal(member._addr, main, "Member's address is incorrect");
    assert.equal(member._can, 1, "Member is not a candidate");
    assert.equal(canArr[0], main, "Member's address is not stored in candidate array");
  });


    it('Organisation member should be able to end their candidacy', async() =>{

      const OrgInstance = await CharityOrg.new("CharityCo");

      await OrgInstance.addMember(main, "Charles",  "De Gaulle");
      await OrgInstance.addMember(backup, "Claude",  "Monet");
      await OrgInstance.addMember(extra, "Steven",  "Gerrard");

      await OrgInstance.startCandidacy({from: main});
      await OrgInstance.startCandidacy({from: backup});
      await OrgInstance.startCandidacy({from: extra});

      await OrgInstance.endCandidacy({from: backup});

      const canArr = await OrgInstance.getCandidates();
      const member = await OrgInstance.getMember(backup);
      const member2 = await OrgInstance.getMember(extra);

      assert.equal(member._fname, "Claude", "Member's first name is incorrect");
      assert.equal(member._lname, "Monet", "Member's last name is incorrect");
      assert.equal(member._addr, backup, "Member's address is incorrect");
      assert.equal(member._can, 0, "Member is still a candidate");
      assert.equal(canArr.length, 2, "Candidate array has not been cleared");
      assert.equal(member2._can, 2, "Candidate's personal array position has not been set correctly");
      assert.equal(canArr[1], extra, "Candidate's position in array has not been set correctly");
    });

    it('Organisation member should be able to vote for a candidate', async() =>{

      const OrgInstance = await CharityOrg.new("CharityCo");

      await OrgInstance.addMember(main, "Charles",  "De Gaulle");
      await OrgInstance.addMember(backup, "Claude",  "Monet");

      await OrgInstance.startCandidacy({from: main});
      await OrgInstance.startCandidacy({from: backup});

      await OrgInstance.castVote(main, {from: main});
      await OrgInstance.castVote(main, {from: backup});

      const canArr = await OrgInstance.getCandidates();
      const member = await OrgInstance.getMember(main);

      assert.equal(member._fname, "Charles", "Member's first name is incorrect");
      assert.equal(member._lname, "De Gaulle", "Member's last name is incorrect");
      assert.equal(member._addr, main, "Member's address is incorrect");
      assert.equal(canArr.length, 2, "Candidate array contains wrong amount of candidates");
      assert.equal(member._totv, 2, "Candidate has not recieved the correct number of votes");

      //Testing with multiple votes -- vote redistribution
      await OrgInstance.castVote(backup, {from: main});
      const member2 = await OrgInstance.getMember(main);
      const member3 = await OrgInstance.getMember(backup);
      assert.equal(member2._totv, 1, "Primary candidate has not recieved the correct number of votes");
      assert.equal(member3._totv, 1, "Backup candidate has not recieved the correct number of votes");

      await OrgInstance.castVote(backup, {from: backup});
      const member4 = await OrgInstance.getMember(main);
      const member5 = await OrgInstance.getMember(backup);
      assert.equal(member4._totv, 0, "Primary candidate has not recieved the correct number of votes");
      assert.equal(member5._totv, 2, "Backup candidate has not recieved the correct number of votes");

    });

    it('Organisation member should be revoke a vote for a candidate', async() =>{

      const OrgInstance = await CharityOrg.new("CharityCo");

      await OrgInstance.addMember(main, "Charles",  "De Gaulle");
      await OrgInstance.addMember(backup, "Claude",  "Monet");

      await OrgInstance.startCandidacy({from: main});

      await OrgInstance.castVote(main, {from: main});
      await OrgInstance.castVote(main, {from: backup});

      await OrgInstance.revokeVote({from: main});
      await OrgInstance.revokeVote({from: backup});

      const canArr = await OrgInstance.getCandidates();
      const member = await OrgInstance.getMember(main);

      assert.equal(member._fname, "Charles", "Member's first name is incorrect");
      assert.equal(member._lname, "De Gaulle", "Member's last name is incorrect");
      assert.equal(member._addr, main, "Member's address is incorrect");
      assert.equal(canArr.length, 1, "Candidate array contains wrong amount of candidates");
      assert.equal(member._totv, 0, "Candidate has not recieved the correct number of votes");


    });


});
