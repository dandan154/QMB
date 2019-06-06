var canToProcess = -1;
var canProcess = 0;

function candidateProcessCheck(){
  if(canProcess == canToProcess){
    $("#canTable").DataTable();
  }
}

$(document).ready(function(){

  $.getJSON("../ABI/CharityOrg.json", function(result){
    var abi = result.abi;
    var OrgContract = web3.eth.contract(abi);
    OrgInstance = OrgContract.at(Cookies.get('contractAddress'));
    console.log(Cookies.get('contractAddress'));
    console.log(abi);
    if (typeof web3 !== 'undefined') {
           web3 = new Web3(web3.currentProvider);
    } else {
           web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    getOrgDetails();
    addCandidateToTable();
  });


  function addCandidateToTable(){
    $.getJSON("../ABI/CharityOrg.json", function(result){
      //var abi = result.abi;
      //var orgContract = web3.eth.contract(abi);
      //var orgInstance = orgContract.at(Cookies.get('posAddress'));

      OrgInstance.getCandidates.call(function(error, result){
        if(!error){

          var canList = result;
          canToProcess = canList.length;

          for(var i = 0; i < canToProcess; i++){
            OrgInstance.getMember.call(canList[i], function(error, result){
              if(!error){
                var add = '<tr> <td>' + result[1] +'</td>' + '<td>' + result[2] + '</td>' + '<td>' + result[0] + '</td>' + '<td>' + result[6].c[0] + '</td></tr>'
                $("#canTableBody").append(add);
                canProcess = canProcess + 1;
                candidateProcessCheck();
              }else{
                console.log(error);
              }
            });
          }
        } else{
          console.log(error);
        }
      });
    });
  }
  function getOrgDetails(){

    console.log(OrgInstance);
    OrgInstance.getOrganisationDetails.call(function(error, result){
      if(!error){
        console.log(result);

        $("#orgHeader")[0].innerText = result[1];
        $("#orgPres")[0].innerText = result[0];
        $("#orgAddr")[0].innerText = Cookies.get('contractAddress');

        web3.eth.getBalance(Cookies.get('contractAddress'), function(error, result){
          if(!error){
              $("#orgBalance")[0].innerText = result.c[0]/10000 + " ETH";
          } else{
          }
        });

      }else{
        console.log(error);
      }
    });
  }


  $("#startCandidacy").click(function() {

    OrgInstance.startCandidacy.sendTransaction(function(error, result){
      if(!error){
        console.log(result);
        alert("Your Candidacy has begun! \ntransaction hash: " + result);
        location.reload();
      }else{
        console.log(error);
      }
    });
  });

  $("#endCandidacy").click(function() {
    OrgInstance.endCandidacy.sendTransaction(function(error, result){
      if(!error){
        console.log(result);
        alert("Your Candidacy has ended! \ntransaction hash: " + result);
        location.reload();
      } else {
        console.error(error);
      }
    });
  });

  $("#addMem").click(function() {

    OrgInstance.addMember.sendTransaction($("#addr").val(), $("#fname").val(), $("#lname").val(), function(error, result){
      if(!error){
        console.log(result);
        alert("Member has been added! \ntransaction hash: " + result);
        location.reload();
      }else{
        console.log(error);
      }
    });
  });

  $("#rmMem").click(function() {

    OrgInstance.removeMember.sendTransaction($("#rmAddr").val(), function(error, result){
      if(!error){
        console.log(result);
        alert("Member has been removed! \ntransaction hash: " + result);
        location.reload();
      }else{
        console.log(error);
      }
    });
  });

  $("#castvote").click(function() {

    var can = prompt("Enter the address of your candital preference", "");

    OrgInstance.castVote.sendTransaction(can, function(error, result){
      if(!error){
        console.log(result);
        alert("Vote cast! \ntransaction hash: " + result);
        location.reload();
      }else{
        console.log(error);
      }
    });
  });

  $("#sendEth").click(function() {

    var toEther = 1000000000000000000;
    OrgInstance.sendEtherToCharity.sendTransaction($("#trans").val() , $("#amount").val() * toEther, function(error, result){
      if(!error){
        console.log(result);
        alert("Ethereum has been sent! \ntransaction hash: " + result);
        location.reload();
      }else{
        console.log(error);
      }
    });
  });

  $("#renounce").click(function(){
    OrgInstance.removeMember.sendTransaction(web3.eth.defaultAccount, function(error, result){
      if(!error){

      }else{
        console.log(error);
      }
    });
  });
  $("#endElection").click(function() {

    OrgInstance.calculateElectionResults.sendTransaction(function(error, result){
      if(!error){
        console.log(result);
        alert("Election has been calculated, check the main page to check the new president! \ntransaction hash: " + result);
        location.reload();
      }else{
        console.log(error);
      }
    });
  });
});
