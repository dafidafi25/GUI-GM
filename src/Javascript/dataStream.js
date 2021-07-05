var maxRoomNumber = 500
var ROOM_V=new Float32Array(maxRoomNumber);
var ROOM_I=new Float32Array(maxRoomNumber);
var ROOM_F=new Float32Array(maxRoomNumber);
var ROOM_CP=new Float32Array(maxRoomNumber);
var ROOM_kWh=new Uint16Array(maxRoomNumber);
var ROOM_FM1=new Float32Array(maxRoomNumber);
var ROOM_FM2=new Float32Array(maxRoomNumber);
var ROOM_CARD_IN=new Uint16Array(maxRoomNumber);
var ROOM_F_ALARM=new Uint16Array(maxRoomNumber);
var ROOM_INIT_ON=new Uint16Array(maxRoomNumber);
var ROOM_BELL_K=new Uint16Array(maxRoomNumber);
var arrTemp = new Uint8Array(720);
var floorReq = 2;
var floorFlag;

var intervalId = window.setInterval(function(){
    updateData(floorReq);
    floorReq++;
    if(floorReq == 6){
        $.ajax({
          url: "http://localhost:3000/sendData1",
          type : "post",
          data: ROOM_FM1,
          timeout: 500,
          success : function(data){
            console.log(data);
          }
        });
        $.ajax({
          url: "http://localhost:3000/sendData2",
          type : "post",
          data: ROOM_FM2,
          timeout: 500,
          success : function(data){
            console.log(data);
          }
        });
        $.ajax({
          url: "http://localhost:3000/sendData3",
          type : "post",
          data: ROOM_kWh,
          timeout: 500,
          success : function(data){
            console.log(data);
          }
        });
        floorReq = 2;
    }
  }, 500);
  
async function updateData(floor){
var num = floor;
floorFlag = num;
var floor = {};
floor.Number = num;
$.ajax({
    url: "http://localhost:3000/getData",
    type : "post",
    data: floor,
    timeout: 500,
    success : getData
});

    
}

function getData(data){
    unpack(data);
    
}

function unpack(jsonData) {
var bytes = jsonData.data;
    if(bytes.length == 720){
        arrTemp = bytes;
        updateArrData(floorFlag);
    }
}

function checkIn(id){
    var num={};
    num.room = id;
    $.ajax({
      url: "http://localhost:3000/checkIn",
      type : "post",
      data: num,
      error : function (XMLHttpRequest, textStatus, errorThrown){
          console.log(errorThrown);
      }
    });
  
  }
  
  function checkOut(id){
    var num={};
    num.room = id;
    $.ajax({
      url: "http://localhost:3000/checkOut",
      type : "post",
      data: num,
      error : function (XMLHttpRequest, textStatus, errorThrown){
          console.log(errorThrown);
      }
    });
  }

    function setting(delayVal){
    var num = {};
    num.val = delayVal
    
    $.ajax({
        url: "http://localhost:3000/setting",
        type : "post",
        data: num,
        error : function (XMLHttpRequest, textStatus, errorThrown){
            console.log(errorThrown);
        }
        });
    }



  async function updateArrData(floor){
    var floorNumber = floor; // declare floor number
    var roomN = 0;
    var floorPos = 0x01;
    var roomPosUp = 1; //roomPosUpdate
    // console.log(arrTemp);
  
    for(let i = 0;i<720; i+=24){
      roomN = i;
      floorPos = floorNumber*100 -100;
      floorPos += roomPosUp
      
  
      var dataVD1 = 0x0000;
      dataVD1 |= arrTemp[roomN+2]<<8;
      dataVD1 |= arrTemp[roomN+3];
      
      var dataID1 = 0x0000;
      dataID1 |= arrTemp[roomN+4]<<24;
      dataID1 |= arrTemp[roomN+5]<<16;          
      dataID1 |= arrTemp[roomN+6]<<8;
      dataID1 |= arrTemp[roomN+7]; 
    
      
      var dataFD1 = 0x0000;
      dataFD1 |= arrTemp[roomN+8]<<8;
      dataFD1 |= arrTemp[roomN+9];   
       
      
      var cpD1 = 0x0000;
      cpD1 |= arrTemp[roomN+10]<<8;
      cpD1 |= arrTemp[roomN+11];  
      
      
      var kWhD1 = 0x0000;
      kWhD1 |= arrTemp[roomN+12]<<24;
      kWhD1 |= arrTemp[roomN+13]<<16;          
      kWhD1 |= arrTemp[roomN+14]<<8;
      kWhD1 |= arrTemp[roomN+15];  
      
      var FM1D1 = 0x0000;
      FM1D1 |= arrTemp[roomN+16]<<8;
      FM1D1 |= arrTemp[roomN+17];       
    
      var FM2D1 = 0x0000;
      FM2D1 |= arrTemp[roomN+18]<<8;
      FM2D1 |= arrTemp[roomN+19];
  
      var CardInD1 = 0;
      if((arrTemp[roomN+20] & 0x80) === 0x80)
      {
          CardInD1 = 1;
      }
      
      var fireAlarmD1 = 0;
      if((arrTemp[roomN+20] & 0x40) === 0x40)
      {
          fireAlarmD1 = 2;
      }
      
      var initACLonD1 = 0;
      if((arrTemp[roomN+20] & 0x20) === 0x20)
      {
          initACLonD1 = 3;
      }
      
      var bellKonD1 = 0;
      if((arrTemp[roomN+20] & 0x10) === 0x10)
      {
          bellKonD1 = 4;
      } 
  
      ROOM_V[floorPos] =  (dataVD1/100);
      ROOM_I[floorPos] =  (dataID1/1000);
      ROOM_F[floorPos] =  (dataFD1/100);
      ROOM_CP[floorPos] = (cpD1/1000);
      ROOM_kWh[floorPos] = kWhD1;
      ROOM_FM1[floorPos] = FM1D1;
      ROOM_FM2[floorPos] = FM2D1;
      ROOM_CARD_IN[floorPos] = CardInD1;
      ROOM_F_ALARM[floorPos] = fireAlarmD1;
      ROOM_INIT_ON[floorPos] = initACLonD1;
      ROOM_BELL_K[floorPos] = bellKonD1;
      // ROOM_V[floorPos] = ROOM_V[floorPos].toFixed(3); 
  
      // if(floorPos == 427){
      //   console.log("V" + " = " + dataVD1);
      //   console.log("I" + " = " + dataID1);
      //   console.log("Freq" + " = " + dataFD1);
      //   console.log("Cos" + " = " + cpD1);
      //   console.log("Kwh" + " = " + kWhD1);
      //   console.log("FM1" + " = " + FM1D1);
      //   console.log("Fm2" + " = " + FM2D1);
      //   console.log("Key" + " = " + CardInD1); 
      //   console.log("f.a" + " = " + fireAlarmD1);
      //   console.log("C-I" + " = " + initACLonD1);
      //   console.log("FB-C-I" + " = " + bellKonD1);
      // }
  
      // if(floorPos == 427){
      //   console.log("V" + " = " + ROOM_V[floorPos]);
      //   console.log("I" + " = " + ROOM_I[floorPos]);
      //   console.log("Freq" + " = " + ROOM_F[floorPos]);
      //   console.log("Cos" + " = " + ROOM_CP[floorPos]);
      //   console.log("Kwh" + " = " + ROOM_kWh[floorPos]);
      //   console.log("FM1" + " = " + ROOM_FM1[floorPos]);
      //   console.log("Fm2" + " = " + ROOM_FM2[floorPos]);
      //   console.log("Key" + " = " + ROOM_CARD_IN[floorPos]); 
      //   console.log("f.a" + " = " + ROOM_F_ALARM[floorPos]);
      //   console.log("C-I" + " = " + ROOM_INIT_ON[floorPos]);
      //   console.log("FB-C-I" + " = " + ROOM_BELL_K[floorPos]);
      // }

      roomPosUp++;
    }
  
  
    // checkData(401); //room data to check
    // console.log(floor);
    updateDataRoom(floor);
  }
  function checkData(number){
    console.log("V" + " = " + ROOM_V[number]);
    console.log("I" + " = " + ROOM_I[number]);
    console.log("Freq" + " = " + ROOM_F[number]);
    console.log("Cos" + " = " + ROOM_CP[number]);
    console.log("Kwh" + " = " + ROOM_kWh[number]);
    console.log("FM1" + " = " + ROOM_FM1[number]);
    console.log("Fm2" + " = " + ROOM_FM2[number]);
    console.log("Key" + " = " + ROOM_CARD_IN[number]); 
    console.log("f.a" + " = " + ROOM_F_ALARM[number]);
    console.log("C-I" + " = " + ROOM_INIT_ON[number]);
    console.log("FB-C-I" + " = " + ROOM_BELL_K[number]);
  }
  

  function reply_click(clicked_id)
  {
      
      if(`${clicked_id}` == "setting"){
          var val = document.getElementById(`roomDelay`).value;
          setting(val);
          document.getElementById(`roomDelay`).value ="";
      }else if(`${clicked_id}` == "backIndex"){
          window.location.href = 'index.html';
      }
      else if (`${clicked_id}` == "settingPage"){
          window.location.href = 'setting.html';
      }
      
      else{
          var num = `${clicked_id}`.substring(2);
          num = parseInt(num);
          if(document.getElementById(`${clicked_id}`).innerHTML == "Check-In"){
          checkIn(num);
          document.getElementById(`${clicked_id}`).className="btn btn-outline-danger";
          document.getElementById(`${clicked_id}`).innerHTML = "Check-Out";
          }else if (document.getElementById(`${clicked_id}`).innerHTML == "Check-Out")
          {
          checkOut(num);
          document.getElementById(`${clicked_id}`).className="btn btn-outline-light";
          document.getElementById(`${clicked_id}`).innerHTML = "Check-In"
        }
      }
      
  }


function updateDataRoom(floor){
    var updateFloor = floor*100+1-100;
    if(updateFloor == 101){
        numberOfFloor = 19;
    }else{
        numberOfFloor = 27
    }
    // console.log(updateFloor);
    for (let i = updateFloor; i <= updateFloor + numberOfFloor-1; i++) {
      document.getElementById('v_'+i).innerHTML = ROOM_V[i].toFixed(3);
      document.getElementById('i_'+i).innerHTML = ROOM_I[i].toFixed(3);
      document.getElementById('cos_'+i).innerHTML = ROOM_CP[i].toFixed(3);
      document.getElementById('fm1_'+i).innerHTML = ROOM_FM1[i].toFixed(2);
      document.getElementById('freq_'+i).innerHTML = ROOM_F[i].toFixed(2);
      document.getElementById('fm2_'+i).innerHTML = ROOM_FM2[i].toFixed(2);
      document.getElementById('pwr_'+i).innerHTML = ROOM_kWh[i].toFixed(2);
      document.getElementById('ac_'+i).className = ROOM_INIT_ON[i] == 0 ? "dotRed ": "dotGreen";
      document.getElementById('key_'+i).className = ROOM_CARD_IN[i] == 0 ? "dotRed" : "dotGreen";
      document.getElementById('kulkas_'+i).className = ROOM_BELL_K[i] == 0 ? "dotRed" : "dotGreen";
      document.getElementById('emer_'+i).className = ROOM_F_ALARM[i] == 0 ? "dotRed" : "dotGreen";


    }
  }