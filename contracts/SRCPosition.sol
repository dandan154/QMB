pragma solidity ^0.5.0;

import "./SRCLib.sol";

contract SRCPosition{

    using SRCLib for SRCLib.Vote;
    using SRCLib for SRCLib.SchoolState;

    address owner;
    address admin;

    address curHolder;
    string title;
    bool isActive;

    SRCLib.SchoolState requiredSchool;

    mapping(address => uint256) candidatePos;
    address[] candidates;

    mapping(address => uint256) votePos;
    SRCLib.Vote[] castVotes;

    uint256 precision;    //max number of selectable candidates for a student to select

    modifier onlyOwner{
        require(msg.sender == owner || msg.sender == admin);
        _;
    }
    constructor(string memory _tit, address _own, address _admin, SRCLib.SchoolState _sch) public {
        title = _tit;
        owner = _own;
        admin = _admin;
        requiredSchool = _sch;
        isActive = true;
        curHolder = address(0);
        precision = 3;
    }

    /** @dev    Check if voter has cast a vote
      * @param  _addr  Address of voter
      */
    function checkIfHasVoted(address _addr) public view returns (bool){
         if (votePos[_addr] > 0){
             return true;
         }
         return false;
    }

    /** @dev    Check voter's school membership to determine if they can vote on position
      * @param  _sch    Voter's university school membership
      *
      */
    function checkIfCanVote(SRCLib.SchoolState _sch) public view returns (bool){
        if(_sch == requiredSchool || requiredSchool == SRCLib.SchoolState.NONE){
            return true;
        }

        return false;
    }


    /** @dev    Check to ensure that candidate array is valid
      * @param  _can    List of candidates in ballot
      *
      */
    function checkCandidateArray(address[] memory _can) public view onlyOwner returns(bool t){
      t = true;

      for(uint256 i; i < _can.length; i++){
        if(candidatePos[_can[i]] == 0){
          t = false;
        }
      }

      return t;
    }

    /** @dev    Add a new vote to position and set first priority candidate
      * @param  _addr   Address of voter
      * @param  _can    First candidate to add to vote, highest preferencial value
      *
      */
    function addVote(address _addr, address[] memory _can) public onlyOwner{

      //Add new vote to array
      SRCLib.Vote memory _v;
      _v.voter = _addr;
      _v.selectedCandidates = _can;

      castVotes.push(_v);

      uint256 vPos = castVotes.length;
      votePos[_addr] = vPos;
    }


    /** @dev    Remove vote entirely from array of cast votes
      * @param  _addr   Address of voter
      */
    function removeVote(address _addr) public onlyOwner{

       SRCLib.Vote memory toSwap = castVotes[castVotes.length-1];
       castVotes[votePos[_addr]-1] = toSwap;

       votePos[castVotes[castVotes.length-1].voter] = votePos[_addr];
       votePos[_addr] = 0;

       castVotes.length = castVotes.length - 1;
    }


    /** @dev    Add a new potential candidate for voters to select when voting
      * @param  _addr   Address of candidate
      */
    function addCandidate(address _addr) public onlyOwner{
        require(candidatePos[_addr] == 0);      //Make sure prospective candidate isn't already assigned
        candidates.push(_addr);
        candidatePos[_addr] = candidates.length;
    }

    /** @dev    Remove a potential candidate for voters to select when voting
      * @param  _addr   Address of candidate
      */
    function removeCandidate(address _addr) public onlyOwner{
        require(candidatePos[_addr] > 0);

        uint256 toRemove = candidatePos[_addr];
        address toSwap = candidates[candidates.length-1];

        candidates[toRemove-1] = toSwap;
        candidatePos[toSwap] = toRemove;
        candidatePos[_addr] = 0;
        candidates.length = candidates.length-1;

    }


    /** @dev Destroy SRC position, return any stored ether to SRC
      */
    function kill() public onlyOwner{
        selfdestruct(msg.sender);
    }

    /// GETTERS & SETTERS ///

    function toggleActive() public onlyOwner{
      if(isActive){
        isActive = false;
      } else{
        isActive = true;
      }
    }

    function setHolder(address _newHold) public onlyOwner{
      curHolder = _newHold;
    }

    function getAllCandidates() public view returns(address[] memory){
      return candidates;
    }

    function getSelectedCandidates(address _vote) public view returns (address[] memory){
        address[] memory _cans;
        if(votePos[_vote] == 0){return _cans; }
        _cans = castVotes[votePos[_vote]-1].selectedCandidates;
        return _cans;
    }

    function getTotalVoteCount() public view returns(uint256){
      return castVotes.length;
    }

    function getVote(uint256 i) public view returns(address[] memory){
      return castVotes[i].selectedCandidates;
    }

    function getTitle() public view returns (string memory){
        return title;
    }

    function getSchool() public view returns(SRCLib.SchoolState){
        return requiredSchool;
    }

    function getDetails() public view returns(string memory _tit, uint8 _sch, address _addr, address _hol, bool _act){
      _tit = title;
      _sch = uint8(requiredSchool);
      _addr = address(this);
      _hol = curHolder;
      _act = isActive;

    }

    function () external payable{

    }

}
