const SRC = artifacts.require("SRC");
const SRCLib = artifacts.require("SRCLib");
const SRCPosition = artifacts.require("SRCPosition")

contract('SRC', (accounts) => {

  //NOTE: ENSURE THAT BOTH ACCOUNTS ARE UNLOCKED DURING LIVE DEPLOYMENT TESTING TO PREVENT ERRORS
  const main = accounts[0];
  const backup = accounts[1];
  const extra = accounts[2];

  it('Contract Deployment Speed', async() => {
    const SRCInstance = await SRC.new();
  });

  it('Contract Destruction Speed', async() => {
    const SRCInstance = await SRC.new();
    SRCInstance.dismantleSRC();
  });

  it('student should be able to append a vote for a position', async() =>{

    const SRCInstance = await SRC.new();

    await SRCInstance.addPosition("position", 1);

    await SRCInstance.addStudent("Pepin", "Carolingian", 1, 1, main);
    await SRCInstance.addStudent("Augustus", "Caesar", 2, 1, backup);

    await SRCInstance.addCandidate("position");
    await SRCInstance.addCandidate("position", {from: backup});

    await SRCInstance.addVote("position", [main, backup], {from: main});

    const position = await SRCInstance.getPositionAddress("position");
    const posInstance = await SRCPosition.at(position);
    const candidates = await posInstance.getSelectedCandidates(main);
    const getVote = await posInstance.getTotalVoteCount();
    const getVoteCandidates = await posInstance.getVote(0);

    assert.equal(getVoteCandidates.length, 2, "students vote doenst contain both candidates");
    assert.equal(getVote, 1, "vote isnt contained within list");
    assert.equal(candidates.length, 2, "student's vote doesn't contain both candidates");
    assert.equal(candidates[1], backup, "incorrect candidate address for 2nd preference");
    assert.equal(candidates[0], main, "incorrect candidate address for 1st preference");

  });

  it('student should be able to deduct from a vote for a position', async() =>{

    const SRCInstance = await SRC.new();

    await SRCInstance.addPosition("position", 1);

    await SRCInstance.addStudent("Pepin", "Carolingian", 1, 1, main);
    await SRCInstance.addStudent("Augustus", "Caesar", 2, 1, backup);

    await SRCInstance.addCandidate("position");
    await SRCInstance.addCandidate("position", {from: backup});

    await SRCInstance.addVote("position", [main, backup], {from: main});
    await SRCInstance.removeVote("position", {from: main});


    const position = await SRCInstance.getPositionAddress("position");
    const posInstance = await SRCPosition.at(position);
    const candidates = await posInstance.getSelectedCandidates(main);

    assert.equal(candidates.length, 0, "student candidate list not empty");
  });

  it('admin should be able to add a new student to the student body (Single Student)', async () => {
    const SRCInstance = await SRC.new();

    await SRCInstance.addStudent("Pepin", "Carolingian", 1, 1, main);

    const student = await SRCInstance.getStudent(main);
    const studentCount = await SRCInstance.getStudentArr();

    assert.equal(student._fname, "Pepin", "Student first name is incorrect");
    assert.equal(student._lname, "Carolingian", "Student last name is incorrect");
    assert.equal(studentCount.length, 1, "student address array isn't the correct length");
    assert.equal(student._sch, 1, "Student matriculation is incorrect");
  });

  it('admin should be able to add a new student to the student body (Multiple Students)', async () => {
    const SRCInstance = await SRC.new();

    await SRCInstance.addStudent("Pepin", "Carolingian", 1, 1, main);
    await SRCInstance.addStudent("Augustus", "Caesar", 2, 1, backup);

    const student = await SRCInstance.getStudent(main);
    const student2 = await SRCInstance.getStudent(backup);

    const studentArr = await SRCInstance.getStudentArr();
    const studentCount = studentArr.length;

    assert.equal(student._fname, "Pepin", "Student1 first name is incorrect");
    assert.equal(student._lname, "Carolingian", "Student1 last name is incorrect");

    assert.equal(student2._fname, "Augustus", "Student1 first name is incorrect");
    assert.equal(student2._lname, "Caesar", "Student1 last name is incorrect");

    assert.equal(studentCount, 2, "student address array isn't the correct length");
    assert.equal(student._sch, 1, "Student matriculation is incorrect");
  });

  it('admin should be able to remove a student from the student body (Single Student)', async() => {
    const SRCInstance = await SRC.new();

    await SRCInstance.addStudent("Pepin", "Carolingian", 1, 1, main);
    await SRCInstance.removeStudent(1);

    const student = await SRCInstance.getStudent(main);

    const studentArr = await SRCInstance.getStudentArr();
    const studentCount = studentArr.length;

    assert.equal(student._fname, "", "Student has a first name");
    assert.equal(student._lname, "", "Student has a last name");
    assert.equal(student._sch, 0, "Student is associated with a school");
    assert.equal(studentCount, 0, "student address array contains an address value(s)");

  });

  it('admin should be able to remove a student from the student body (Multiple Students)', async() => {
    const SRCInstance = await SRC.new();

    await SRCInstance.addStudent("Pepin", "Carolingian", 1, 1, main);
    await SRCInstance.addStudent("Augustus", "Caesar", 2, 1, backup);
    await SRCInstance.addStudent("Alexander", "Nevsky", 3, 1, extra);

    await SRCInstance.removeStudent(2);
    await SRCInstance.removeStudent(3);
    await SRCInstance.removeStudent(1);

    const student = await SRCInstance.getStudent(main);
    const studentArr = await SRCInstance.getStudentArr();
    const studentCount = studentArr.length;

    assert.equal(student._fname, "", "Student has a first name");
    assert.equal(student._lname, "", "Student has a last name");
    assert.equal(student._sch, 0, "Student is associated with a school");
    assert.equal(studentCount, 0, "student address array contains an address value(s)");

  });

  it('admin should be able to add new position', async() => {
    const SRCInstance = await SRC.new();

    await SRCInstance.addPosition("position", 1);

    const position = await SRCInstance.getPositionAddress("position");
    const posInstance = await SRCPosition.at(position);
    const posInfo = await posInstance.getDetails();

    assert.equal(posInfo._tit, "position", "Position doesn't have correct name");
    assert.equal(posInfo._sch, 1, "Position has been assigned wrong school");

  });

  it('admin should be able to remove a position', async() => {
    const SRCInstance = await SRC.new();

    await SRCInstance.addPosition("position", 1);
    await SRCInstance.removePosition("position");

    const position = await SRCInstance.getPositionAddress("position");

    assert.equal(position, "0x0000000000000000000000000000000000000000", "Position stil has an address");


  });

  it('student should be able to become candidate for position', async() => {
    const SRCInstance = await SRC.new();

    await SRCInstance.addPosition("position", 1);
    await SRCInstance.addStudent("Pepin", "Carolingian", 1, 1, main);

    await SRCInstance.addCandidate("position", {from: main});

    const position = await SRCInstance.getPositionAddress("position");
    const posInstance = await SRCPosition.at(position);
    const candidates = await posInstance.getAllCandidates();

    assert.equal(candidates[0], main, "Student address has not been added to candidate list");

  });

  it('student should be able to end candidacy for position', async() => {
    const SRCInstance = await SRC.new();

    await SRCInstance.addPosition("position", 1);
    await SRCInstance.addStudent("Pepin", "Carolingian", 1, 1, main);

    await SRCInstance.addCandidate("position", {from: main});
    await SRCInstance.removeCandidate("position", {from: main});

    const position = await SRCInstance.getPositionAddress("position");
    const posInstance = await SRCPosition.at(position);
    const candidates = await posInstance.getAllCandidates();

    assert.equal(candidates.length, 0, "Candidacy contains addresses");

  });
});
