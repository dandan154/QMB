pragma solidity ^0.5.0;

import "./SafeMath.sol";

contract CharityOrg{

  struct Member{
    string fname;
    string lname;
    address memAddress;
    address vote;
    bool isMember;
    uint256 canPos; //if 0, not candidate, deincrement by 1 to get real position
    uint256 totalVotes;
  }


  address president;
  string name;
  address[] candidates;
  mapping(address => Member) members;


  modifier isPresident(){
    require(msg.sender == president);
    _;
  }

  modifier isMember(){
    require(members[msg.sender].isMember == true);
    _;
  }

  constructor(string memory _n) public{
    president = msg.sender;
    name = _n;
  }

/** @dev    Add member to organisation
  * @param  _addr  Address of student
  * @param  _fname  First name of student
  * @param  _lname  Last name of student
  */
  function addMember(address _addr, string memory _fname, string memory _lname) public isPresident{
    require(members[_addr].isMember == false);

    //Create member object
    Member memory m;
    m.fname = _fname;
    m.lname = _lname;
    m.isMember = true;
    m.memAddress = _addr;

    members[_addr] = m;

  }

  /** @dev    Remove member from organisation
    * @param  _addr  Address of student
    */
  function removeMember(address _addr) public {
    require(members[_addr].isMember == true);
    require(_addr != president);
    require(msg.sender == members[msg.sender].memAddress || msg.sender == president);
    if(members[_addr].canPos != 0){

      address removeCan = _addr;

      if(candidates.length == 1 || candidates[candidates.length-1] == removeCan){
        candidates.length = candidates.length -1;
        members[removeCan].canPos = 0;
        members[removeCan].totalVotes = 0;
      }
      else{

        address toSwap = candidates[candidates.length-1]; //get last address in candidate array
        uint256 swapPos = members[removeCan].canPos;    //position to give to swapped candidate

        candidates[swapPos-1] = toSwap;     //assign swap candidate new position in array
        members[toSwap].canPos = swapPos;   //update member details to reflect change

        members[removeCan].canPos = 0;      //set member's candiate position to default
        members[removeCan].totalVotes = 0;  //remove cast votes for them

        candidates.length = candidates.length -1;
      }
    }

    address voteToRemove = members[_addr].vote;

    if(voteToRemove != address(0) && members[voteToRemove].isMember == true && members[voteToRemove].totalVotes > 0){
      members[voteToRemove].totalVotes = SafeMath.sub(members[voteToRemove].totalVotes, 1);
    }

    delete members[_addr];

  }

  /** @dev    Start candidacy for organisation president
    */
  function startCandidacy() public isMember{

    require(members[msg.sender].canPos == 0);    //Check if member is already a candidate


    candidates.push(msg.sender);
    members[msg.sender].canPos = candidates.length;

  }

/** @dev    End candidacy for organisation president
    */
  function endCandidacy() public isMember{

    address removeCan = msg.sender;

    if(candidates.length == 1 || candidates[candidates.length-1] == removeCan){
      candidates.length = candidates.length -1;
      members[removeCan].canPos = 0;
      members[removeCan].totalVotes = 0;
    }
    else{

      address toSwap = candidates[candidates.length-1];   //get last address in candidate array
      uint256 swapPos = members[removeCan].canPos;        //position to give to swapped candidate

      candidates[swapPos-1] = toSwap;                     //assign swap candidate new position in array
      members[toSwap].canPos = swapPos;                   //update member details to reflect change

      members[removeCan].canPos = 0;                      //set member's candiate position to default
      members[removeCan].totalVotes = 0;                  //remove cast votes for them

      candidates.length = candidates.length -1;
    }

  }

  /** @dev    Cast vote for chosen candidate
    * @param  _addr  Address of candidate
    */
  function castVote(address _addr) public isMember{

    require(members[_addr].isMember == true);
    require(members[_addr].canPos > 0);

    revokeVote();

    members[_addr].totalVotes = SafeMath.add(members[_addr].totalVotes, 1);
    members[msg.sender].vote = _addr;

  }

  /** @dev    Revole vote for chosen candidate
    */
  function revokeVote() public isMember{

    address voteToRemove = members[msg.sender].vote;

    if(voteToRemove != address(0) && members[voteToRemove].isMember == true && members[voteToRemove].totalVotes > 0){
      members[voteToRemove].totalVotes = SafeMath.sub(members[voteToRemove].totalVotes, 1);
    }

    members[msg.sender].vote = address(0);

  }

  /** @dev    Revoke own membership from organisation
    */
  function quitOrganisation() public isMember{

    require(msg.sender != president);

    address voteToRemove = members[msg.sender].vote;

    if(voteToRemove != address(0) && members[voteToRemove].isMember == true && members[voteToRemove].totalVotes > 0){
      members[voteToRemove].totalVotes = SafeMath.sub(members[voteToRemove].totalVotes, 1);
    }

    delete members[msg.sender];

  }

  /** @dev    Calculate the next president of the organisation
    */
  function calculateElectionResults() public isPresident{

    require(candidates.length > 0);

    address newPresident = address(0);
    uint256 voteLimit = 0;
    for(uint i = 0; i < candidates.length; i++){
      //members[candidates[i]];

      if(members[candidates[i]].totalVotes > voteLimit){
        newPresident = members[candidates[i]].memAddress;
        voteLimit = members[candidates[i]].totalVotes;
      }

      members[candidates[i]].canPos = 0;
      members[candidates[i]].totalVotes = 0;
    }

    if(newPresident != president && newPresident != address(0)){
      president = newPresident;
    }

    delete candidates;

  }

  ///GETTERS & SETTERS ///
  function getMember(address _mem) public view returns(address _addr, string memory _fname, string memory _lname, address _v, bool _ismem, uint256 _can, uint256 _totv){
      Member memory m = members[_mem];
      _fname = m.fname;
      _lname = m.lname;
      _addr = m.memAddress;
      _v = m.vote;
      _ismem = m.isMember;
      _can = m.canPos;
      _totv = m.totalVotes;
  }

  function getCandidates() public view returns(address[] memory){
    return candidates;
  }

  function getOrganisationDetails() public view returns(address _pres, string memory _name){
    _pres = president;
    _name = name;
  }

  function sendEtherToCharity(address payable charity, uint256 value) public isPresident {
    if(!charity.send(value)){revert();}

  }

  function kill() public isPresident{
    selfdestruct(msg.sender);
  }

  function () external payable{

  }

}
