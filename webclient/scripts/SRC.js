

function getSchoolVal(schoolval){
  var sch;
  switch(schoolval){
    case 0:
      sch = "None";
      break;
    case 1:
      sch = "Science & Engineering";
      break;
    case 2:
      sch = "Art & Design";
      break;
    case 3:
      sch = "Dentistry";
      break;
    case 4:
      sch = "Education & Social Work";
      break;
    case 5:
      sch = "Humanities";
      break;
    case 6:
      sch = "Life Sciences";
      break;
    case 7:
      sch = "Medicine";
      break;
    case 8:
      sch = "Nursing & Health Sciences";
      break;
    case 9:
      sch = "Social Sciences";
  }
  return sch;
}

var isAdmin = false;
var nextHolder;
var votes = [];

function voteCalc(remaining, votes){
  console.log(votes);
  var elimCans = [];
  var round = 1;

  while(remaining.length > 0  ){

    var vTemp = votes;
    var tally = {};

    //Initialise key-value pairs for tracking tallies.
    for(var i = 0; i < remaining.length; i++){
      tally[remaining[i]] = 0;
    }

    //Tally votes
    for(var i = 0; i < vTemp.length; i++){

      //Remove eliminated candidates
      var v = vTemp[i].filter( function ( z ) {
        return elimCans.indexOf(z) === -1;
      });

      if(v.length > 0){
        tally[v[0]] = tally[v[0]] +1;
      }
    }

    var voteSectionStart = '<div id="votesection"> <h3>Round ' + round + '</h3>'
    $("#voteresults").append(voteSectionStart);
    var voteSectionEnd = '</div>'

    var toRemove = "";
    var lowest = remaining[0];
    //Get lowest scoring candidate + Display results
    for(var i = 0; i < remaining.length; i++){

      //var voteRow = '  <div class="votebarcont"> <div class="votebar" style="{width: 90%; background-color: #4CAF50;}>"' + remaining[i] + ': ' + tally[remaining[i]] +  '</div>' + "yeet" +' </div>';
      var voteRow = '<div class="row"><div class="col-md-4"><p class="text-right">' + remaining[i] + ': </p></div> <div class="col-md-6"><div class="progress"><div class="progress-bar" role="progressbar" style="width:' + (tally[remaining[i]]/votes.length)*100  + '%">' + tally[remaining[i]] + ' votes</div></div></div></div>'


      $("#voteresults").append(voteRow);

      if(tally[remaining[i]] < tally[lowest]){
        lowest = remaining[i];
      }
    }

    if(remaining.length == 1){
      winner = remaining[0];
    }
    //Elminate lowest scoring candidate
    elimCans.push(lowest);
    remaining = remaining.filter( function ( z ) {
      return elimCans.indexOf(z) === -1;
    });

    var voteSectionEnd = '</div>'
    $("#voteresults").append(voteSectionEnd);


    round = round + 1;
  }

  //Clear vote array
  while(votes.length){votes.pop();}
  console.log(remaining);
  var voteConfirm = '<div class="row"><div class="col-md-4 text-left" style="margin-top: 15px; margin-bottom: 25px"><button class="btn btn-lg btn-secondary" id="confirm" >Confirm Result!</button></div> </div>'
  if(isAdmin){
    $("#voteresults").append(voteConfirm);
  }

  console.log(votes);
}


function setCookie(newPos){
  Cookies.set('posAddress', newPos );
}


var studentToProcess = -1;
var studentProcessed= 0;


function waitForTable(){
  if(studentProcessed == studentToProcess){
    $("#studentTable").DataTable();
  }
}

var posToProcess = -1;
var posProcessed = 0;

function waitForPosTable(){
  if(posProcessed == posToProcess){
    var pTable = $("#posTable").DataTable();;
    pTable.$('tr').click(function(){
      setCookie($(this)[0].children[2].innerText);
      window.location.href="./position.html";
    });
  }
}

var canToProcess = -1;
var canProcess = 0;

function waitForCanTable(){
  if(canProcessed == canToProcess){
    $("#canTable").DataTable();
  }
}

var SRCInstance;
$(document).ready(function(){

  $.getJSON("../ABI/SRC.json", function(result){
    var abi = result.abi;
    var SRCContract = web3.eth.contract(abi);
    SRCInstance = SRCContract.at(Cookies.get('contractAddress'));
    console.log(SRCInstance);
    if (typeof web3 !== 'undefined') {
           web3 = new Web3(web3.currentProvider);
    } else {
           web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
    }
    web3.eth.defaultAccount = web3.eth.accounts[0];

    SRCInstance.getAdmin.call(function(error, result){
      if(!error){
        if(web3.eth.defaultAccount == result){
          isAdmin = true;
        }else{
          isAdmin = false;
        }
      }else{
        console.log(error);
      }
    });

    SRCInstance.getStudentArr.call(function(error, result){
      if(!error){

        var studentList = result;
        studentToProcess = studentList.length;

        for(var i = 0; i < studentToProcess; i++){
          SRCInstance.getStudent.call(studentList[i], function(error, result){
            if(!error){
              var add = '<tr> <td>' + result[3].c[0] +'</td>' + '<td>' + result[0] + '</td>' + '<td>' + result[1] + '</td>' + '<td>' + getSchoolVal(result[2].c[0]) + '</td>' + '<td>' + result[4] + '</td></tr>'
              $("#studentTableBody").append(add);
              studentProcessed = studentProcessed + 1;
              waitForTable();
            }else{
              console.log(error);
            }
          });
        }
      }
      else{
        console.log(error);
      }
    });

    addPositionToTable();
    addCandidateToTable();
  });
  function addPositionToTable(){
    $.getJSON("../ABI/SRCPosition.json", function(result){
      var abi = result.abi;
      var posContract = web3.eth.contract(abi);
      SRCInstance.getPositions.call(function(error, result){
        if(!error){
          posToProcess = result.length;
          for(var i=0; i < posToProcess; i++){
            var posInstance = posContract.at(result[i]);
            posInstance.getDetails.call(function(error,result){
              if(!error){
                var add = '<tr class="position-row" style="cursor: pointer;"> <td>' + result[0] + '</td>' + '<td>' + getSchoolVal(result[1].c[0]) + '</td>' + '<td>' + result[2] + '</td></tr>'
                $("#posTableBody").append(add);
                posProcessed = posProcessed + 1;
                waitForPosTable();
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

  function addCandidateToTable(posLocation){
    $.getJSON("../ABI/SRCPosition.json", function(result){
      var abi = result.abi;
      var posContract = web3.eth.contract(abi);
      var posInstance = posContract.at(Cookies.get('posAddress'));
      posInstance.getDetails.call(function(error, result){
        if(!error){

          $("#posHeader")[0].innerText =result[0];

          $("#posSchool")[0].innerText = getSchoolVal(result[1].c[0]);
          $('#posAddr')[0].innerText = result[2];

          console.log(result[3]);
          if(result[3] == "0x0000000000000000000000000000000000000000"){
            $('#posHolder')[0].innerText = "None";
          }else{
            $('#posHolder')[0].innerText = result[3];
          }

          if(result[4]){
            $("#posActive")[0].innerText = "Active";
            $("#posActive").css("color", "Green");
            $("#posButtons").show();
          }else{
            $("#posActive")[0].innerText = "Inactive";
            $("#posActive").css("color", "Red");
            //$("#posButtons").hide();
          }


        }else{
          console.log(error);
        }
      });

      posInstance.getAllCandidates.call(function(error, result){
        if(!error){

          var canList = result;
          canToProcess = canList.length;

          for(var i = 0; i < canToProcess; i++){
            SRCInstance.getStudent.call(canList[i], function(error, result){
              if(!error){
                var add = '<tr> <td>' + result[3].c[0] +'</td>' + '<td>' + result[0] + '</td>' + '<td>' + result[1] + '</td>' + '<td>' + getSchoolVal(result[2].c[0]) + '</td>' + '<td>' + result[4] + '</td></tr>'
                $("#canTableBody").append(add);
                canProcessed = canProcessed + 1;
                waitForCanTable();
              }else{
                console.log(error);
              }
            });
          }
        }
      })
    })
  }


  $("#becomeCandidate").click(function() {
    console.log($("#posHeader")[0].innerText);
    console.log(SRCInstance);

    SRCInstance.addCandidate.sendTransaction($("#posHeader")[0].innerText, function(error, result){
      if(!error){
        alert("You are now a running candidate! \ntransaction hash: " + result);
        location.reload();
      }else{
        console.log(error);
      }
    });
  });
  $("#stopCandidate").click(function() {
    console.log($("#posHeader")[0].innerText);
    console.log(SRCInstance);

    SRCInstance.removeCandidate.sendTransaction($("#posHeader")[0].innerText, function(error, result){
      if(!error){
        alert("You are no longer a running candidate! \ntransaction hash: " + result);
        location.reload();
      }else{
        console.log(error);
      }
    });
  });

  $("#addPos").click(function() {
    SRCInstance.addPosition.sendTransaction($("#posTitle").val(), $("#schoolMem").val(), function(error, result){
      if(!error){
        console.log(result);
        alert("Position added successfully! \ntransaction hash: " + result);
        location.reload();
      } else {
        console.error(error);
      }
    });
  });

  $("#getPos").click(function() {
    SRCInstance.getPosition.call($("#getTitle").val(), function(error, result){
      if(!error){
        console.log(result);
      } else {
        console.error(error);
      }
    });
  });

$("#rmPos").click(function() {
  SRCInstance.removePosition.sendTransaction($("#rmTitle").val(), function(error, result){
    if(!error){
      console.log(result);
      alert("Position removed successfully! \ntransaction hash: " + result);
      location.reload();
    } else {
      console.error(error);
    }
  });
});

$("#addStudent").click(function() {
  SRCInstance.addStudent.sendTransaction($("#fname").val(), $("#lname").val(), $("#matric").val(), $('#school').val(), $('#addr').val(), function(error, result){
    if(!error){
      alert("Student added successfully!\ntransaction hash: " + result);
      location.reload();
    } else{
      console.log(error);
    }
  });
});

$("#cast").click(function(){
  var cans = [$("#can1").val(), $("#can2").val(), $("#can3").val()];
  cans = cans.filter(Boolean);

  console.log(cans);

  SRCInstance.addVote.sendTransaction($("#posHeader")[0].innerText, cans, function(error, result){
    if(!error){
      console.log(result);

    } else{
      console.log(error);
    }
  });
});

$("#revoke").click(function(){
  SRCInstance.removeVote.sendTransaction($("#posHeader")[0].innerText, function(error, result){
    if(!error){
      console.log(result);
    } else{
      console.log(error);
    }
  });
});

$("#renounce").click(function(){
  SRCInstance.getStudent.call(web3.eth.defaultAccount, function(error, result){
    if(!error){
      SRCInstance.removeStudent.sendTransaction(result[3].c[0], function(error, result){
        if(!error){
          console.log(result);
        } else{
          console.log(error);
        }
      });
    }else{
      console.log(error);
    }
  });
});

$("#confirm").click(function(){

})


var state = true;
$("#checkresults").click( function(){
  if(state){
  $.getJSON("../ABI/SRCPosition.json", function(result){
    var abi = result.abi;
    var posContract =  web3.eth.contract(abi);
    var posInstance = posContract.at(Cookies.get('posAddress'));
    console.log(posInstance);

    posInstance.getAllCandidates.call(function(error, result){
      if(!error){
        console.log(result);
        var remainingCandidates = result;

        posInstance.getTotalVoteCount.call(function(error, result){
          if(!error){
            console.log(result);

            var votesToRetrieve = result.c[0];
            var votesRetrieved = 0;

            for(var i = 0; i < votesToRetrieve; i++){
              posInstance.getVote.call(i, function(error, result){
                if(!error){
                  console.log("vote");
                  votes.push(result);
                  votesRetrieved = votesRetrieved + 1;
                  if(votesRetrieved == votesToRetrieve){
                    voteCalc(remainingCandidates, votes);
                  }

                }else{
                  console.log(error);
                }
              });
            }

          }else{
            console.log(error);
          }
        });

      }else{
        console.log(error);
      }
    });
  });
  state = false;
}else{
  $('#voteresults').empty();
  state = true;
}

});

  $("#getStudent").click(function() {
  SRCInstance.getStudent.call($('#getMatric').val(), function(error, result){
    if(!error){
      var stu = result;
    }else {
      console.error(error);
    }
    });
  });
  $("#rmStudent").click(function() {
    SRCInstance.removeStudent.sendTransaction($("#rmMatric").val(), function(error, result){
      if(!error){
        alert("Student removed successfully! \ntransaction hash: " + result);
        location.reload();
      } else {
        console.error(error);
      }
    })
  });
  $("#getStuList").click(function() {
    SRCInstance.getStudentArr.call(function(error, result){
      if(!error){
        console.log(result);
        alert("Student list retrieved!");
      } else {
        console.error(error);
      }
    })
  });
});
