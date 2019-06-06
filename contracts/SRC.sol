pragma solidity ^0.5.0;

import "./SRCLib.sol";
import "./SRCPosition.sol";

contract SRC{

    using SRCLib for SRCLib.Student;
    using SRCLib for SRCLib.SchoolState;

    mapping(string => uint256) positionLookup;
    SRCPosition[] positions;

    mapping(address => SRCLib.Student) students;
    mapping(address => uint256) studentPos;
    address[] studentArr;

    mapping(uint256 => address) matricLookup;

    address admin;

    modifier isStudent{
        require(students[msg.sender].isStudent == true);
        _;
    }

    modifier isAdmin{
      require(msg.sender == admin);
      _;
    }


    constructor() public {
      admin = msg.sender;
    }

    /** @dev    Add an elective position to the SRC
      * @param  _tit  Title of position to add
      * @param  _sch  School associated with position
      */
    function addPosition(string memory _tit, SRCLib.SchoolState _sch) public isAdmin returns(bool success){

        require(positionLookup[_tit] == 0);     //Check if contract already exists

        SRCPosition newPos = new SRCPosition(_tit, address(this), admin, _sch);
        positions.push(newPos);
        positionLookup[_tit] = positions.length; //negate by one to get true position; 0 explicitly means null contract

        return true;

    }

    /** @dev    Remove an elective position from the SRC
      * @param  _tit  Title of position to remove
      */
    function removePosition(string memory _tit) public isAdmin returns (bool success){

        if(positionLookup[_tit] == 0 || positions.length == 0){
            return false;
        }

        if(positions.length == 1 || positionLookup[_tit] == positions.length){

            positions[positionLookup[_tit]-1].kill();
            positions.length = positions.length-1;
            positionLookup[_tit] = 0;

        } else {

            uint256 removePos = positionLookup[_tit];
            string memory replaceTitle = positions[positions.length-1].getTitle();

            //Get both Position contracts
            SRCPosition toRemove = positions[removePos-1];
            SRCPosition toSwap = positions[positions.length-1];

            //Replace contract-to-remove with end contract
            positions[removePos-1] = toSwap;
            positionLookup[replaceTitle] = removePos;

            //Replace end contract with contract-to-remove
            positions[positions.length-1] = toRemove;
            positionLookup[_tit] = 0;

            //Delete contract-to-remove
            toRemove.kill();
            positions.length = positions.length-1;

        }
        return true;
    }

    /** @dev    Change holder of SRC position
      * @param  _pos  Position to change
      * @param  _addr  new holder of the position
      */
    function changeHolder(string memory _pos, address _addr) public isAdmin{
        require(positionLookup[_pos] > 0);        //Ensure position exists
        SRCPosition pos = positions[positionLookup[_pos]-1];
        pos.setHolder(_addr);
    }

    /** @dev    Add a student's ballot to a position
      * @param  _pos  Position to add ballot to
      * @param  _addr Student ballot
      */
    function addVote(string memory _pos, address[] memory _addr) public isStudent returns (bool){


        if(positionLookup[_pos] == 0){ return false; }  //Ensure position exists

        SRCPosition pos = positions[positionLookup[_pos]-1];

        require(pos.checkCandidateArray(_addr));

        if(pos.checkIfHasVoted(msg.sender)){return false; }
        if(!pos.checkIfCanVote(students[msg.sender].school)){return false; }

        pos.addVote(msg.sender, _addr);

        return true;
    }

    /** @dev    Remove a student's vote
      * @param  _pos  Position to remove vote from
      */
    function removeVote(string memory _pos) public isStudent returns(bool){

        require(positionLookup[_pos] != 0);
        SRCPosition pos = positions[positionLookup[_pos]-1];
        pos.removeVote(msg.sender);
        return true;
    }

    /** @dev    Become a candidate for a SRC position
      * @param  _pos  Position title
      */
    function addCandidate(string memory _pos) public isStudent returns (bool success){
        SRCPosition pos = positions[positionLookup[_pos]-1];
        require(pos.checkIfCanVote(students[msg.sender].school));
        pos.addCandidate(msg.sender);
        return true;
    }

    /** @dev    End candidacy for a SRC position
      * @param  _pos  Position Title
      */
    function removeCandidate(string memory _pos) public isStudent returns (bool success){
        positions[positionLookup[_pos]-1].removeCandidate(msg.sender);
        return true;
    }

    /** @dev    Add a student to the SRC
      * @param  _fname  First name of student
      * @param  _lname  Last name of student
      * @param  _mat    natriculation number of student
      * @param  _sch    School association of student
      * @param  _addr   Ethereum address of student
      */
    function addStudent(string memory _fname, string memory _lname, uint256 _mat, SRCLib.SchoolState _sch, address _addr) public isAdmin returns (bool success){

        //Check if student already exists
        require(students[_addr].isStudent != true);
        require(matricLookup[_mat] == address(0));

        //Create student object
        SRCLib.Student memory s = students[_addr];
        s.fname = _fname;
        s.lname = _lname;
        s.matric = _mat;
        s.school = _sch;
        s.isStudent = true;

        //Deploy to contract
        students[_addr] = s;
        matricLookup[_mat] = _addr;

        //Add to student address list
        studentArr.push(_addr);
        studentPos[_addr] = studentArr.length;

        return true;
    }

    /** @dev    Remove a student from SRC
      * @param  _mat  matriculation of student
      */
    function removeStudent(uint256 _mat) public returns (bool success){

      address toDelete = matricLookup[_mat];

      require(students[msg.sender].matric == _mat || msg.sender == admin);  //must be student removing himself, or admin
      require(toDelete != address(0));          //address can't be null
      require(students[toDelete].isStudent);    //student must exist

      if(studentArr.length == 1 || studentArr[studentArr.length-1] == toDelete){
        studentArr.length = studentArr.length -1;
        studentPos[matricLookup[_mat]] = 0;

      }
      else{
        //get student to swap
        address toSwap = studentArr[studentArr.length-1];
        uint256 swapPos = studentPos[toDelete];

        studentPos[toSwap] = swapPos;
        studentPos[toDelete] = 0;
        studentArr[swapPos-1] = toSwap;
        studentArr.length = studentArr.length -1;
      }

      delete students[toDelete];
      students[toDelete].isStudent = false;     //frees up space without a lot of data manipulation
      matricLookup[_mat] = address(0);

      return true;
    }

    /** @dev    Destroy the SRC 
      */
    function dismantleSRC() public isAdmin{
      selfdestruct(msg.sender);
    }

    ///GETTERS & SETTERS ///
    function getStudent(address _addr) public view returns(string memory _fname, string memory _lname, uint8 _sch, uint256 _matric, address _outAddr){
        SRCLib.Student memory s = students[_addr];
        _fname = s.fname;
        _lname = s.lname;
        _sch = uint8(s.school);
        _matric = s.matric;
        _outAddr = _addr;
    }


    function getStudentArr() public view returns(address[] memory){
      return studentArr;
    }

    function getAdmin() public view returns(address){
      return admin;
    }

    function getPositions() public view returns(SRCPosition[] memory){
      return positions;
    }

    function getPositionAddress(string memory _posName) public view returns(address){
      if(positionLookup[_posName] != 0){
        return address(positions[positionLookup[_posName]-1]);
      }else{
        return address(0);
      }
    }

    function getPositionLength() public view returns(uint256){
      return positions.length;
    }

    function () external payable{

    }


}
