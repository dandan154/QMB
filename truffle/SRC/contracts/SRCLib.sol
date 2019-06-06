pragma solidity ^0.5.0;

library SRCLib{

    enum SchoolState {NONE, SCIENG, ARTDES, DENT, EDUSOC, HUMAN, LIFSCI, MED, NURHEALTH, SOCSCI}

    struct Vote{

        address voter;
        address[] selectedCandidates;                       //for looping through
    }

    struct Student{
        string fname;
        string lname;
        uint256 matric;
        SchoolState school;
        bool isStudent;
    }

}
