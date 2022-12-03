// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";


contract privateMessaging{
    //Only the members of the family can read and write data through this smart-contract
    mapping(address=>bool) public addressSaved;
    mapping(address => uint) public pendingToBeAdded;
    mapping(address => mapping(address => bool)) public Approvers;
    event memberAdded (address _member); 
    event messageSent (address _sender);
    event memberBanned (address _member);
    uint public numberMember = 3;
    uint8 public x;

    struct Member{
        bytes32 name; //short name : up to 32 bytes
        uint8 warning;
        uint8 numMessagesSend;
    }
    mapping(address => Member) public Members;
    mapping(address =>mapping(address=>bool)) public warner;

    struct Message{
        address author;
        string text;
        uint date;
    }
    mapping(uint8 => Message) public listMessages;
    uint public numberMessages;

    constructor(address _member1, address _member2, address _member3){
        addressSaved[_member1] = true;
        emit memberAdded(_member1);
        addressSaved[_member2] = true;
        emit memberAdded(_member2);
        addressSaved[_member3] = true;
        emit memberAdded(_member3);
    }

    modifier onlyMember{
        require(addressSaved[msg.sender],"Your are not a member");
        _;
    } 

    function addNewMember(address _proposer) public onlyMember{
        require(!addressSaved[_proposer],"This one is already a member of the family");
        require(!Approvers[_proposer][msg.sender],"You can not approve the same member twice");
        pendingToBeAdded[_proposer] = pendingToBeAdded[_proposer]+1;
        if(pendingToBeAdded[_proposer] == 3 ){
            addressSaved[_proposer] = true;
            emit memberAdded(_proposer);
            numberMember +=1;
        }
    }

    function sendWarning(address _member) public onlyMember{
        require(_member!=msg.sender,"Don't joke man");
        require(!warner[_member][msg.sender],"You can't send a warning to the same address twice");
        Member storage memb = Members[_member];
        memb.warning = memb.warning + 1;
        warner[_member][msg.sender] = true;
        if(memb.warning == 3){
            addressSaved[_member] = false;
            emit memberBanned(_member);
            numberMember -=1;
        }
    }

    function sendMessage(string memory _message) public onlyMember{
        listMessages[x] = Message({
            author:msg.sender,
            text: _message,
            date: block.timestamp
        });
        x++;
        emit messageSent(msg.sender);
        numberMessages++;
        Member storage mem = Members[msg.sender];
        mem.numMessagesSend++;
    }

    /*function readMessage() public view onlyMember returns(Message[] memory){
        return listMessages;
    }*/

    function changeMemberName(bytes32 name, address _member) public onlyMember{
        Member storage mem = Members[_member];
        mem.name = name;
    }

    function numMember() public view returns(uint){
        return numberMember;
    }

    function checkIfIsMember(address _member) public view returns(bool){
        return addressSaved[_member];
    }

    /*function profile(address _member) public onlyMember returns(Member memory){
        return Member[_member];
    }*/
}
