
const { app, BrowserWindow } = require('electron');
const {webFrame} = require('electron');
const path = require('path');


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    webPreferences: { 
      nodeIntegration: true
      // zoomFactor:0.5
    } ,
    width: 1920,
    height: 1080,
  });
  mainWindow.setPosition(-1920,0);
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.


//initial library
const net = require("net");
var bodyParser = require('body-parser');
const express = require('express');
const { Serializer } = require('v8');
const { Socket } = require('dgram');
const { Router } = require('express');
const { parseJSON } = require('jquery');

//START PROCESS


//connect to tcp ip
var client = new net.Socket();
var floorData = "";
var delayOFF_TIM1=0;
var RETRY_INTERVAL = 1000;
client.setTimeout(1000);
client.connect(8025,"192.168.1.199", function() {
  console.log('Connected');
});
client.on('error', netReconnect);
client.on('data', getData); 

//setting socket server to get body data from js

//creating server  
const FLOOR_SERVER = [];
const app1 = express();
const port = 3000;
app1.use(bodyParser.urlencoded({extended:false}));
app1.use(bodyParser.json());
app1.listen(port, () => {
console.log(`Example app listening at http://localhost:${port}`);
});
app1.post('/getData',sendToJs);
app1.post('/checkIn',checkIn);
app1.post('/checkOut',checkOut);
app1.post('/setting',setDelay);
app1.post('/sendData1',updateDataAy1);
app1.post('/sendData2',updateDataAy2);
app1.post('/sendData3',updateDataAy3);
// app1.use(logErrors);
// app1.use(clientErrorHandler);
// app1.use(errorHandler);



//start server from net tcp ip
var maxRoomNumber = 500
var ROOM_FM1=new Float32Array(maxRoomNumber);
var ROOM_FM2=new Float32Array(maxRoomNumber);
var ROOM_kWh=new Uint16Array(maxRoomNumber);
var currFloor;
var sendAy;
const dummyBuff = Buffer.from([0x3e,0x3e,0x3e,0x3e,0x39,0x38,0x39,0x0a]);
// const myModule = require('./Javascript/dataStream');
const server = net.createServer(ServerResponse);

function ServerResponse(Socket){
  Socket.on("error",(err) =>{
    console.log("Caught flash policy server socket error: ");
    console.log(err.stack);
  });
  Socket.on("data",function(data){
  dataAy(data)
  Socket.write(sendAy);
  });
}

server.listen({
  host : `localhost`,
  port : `8023`
},function(){
  console.log("Listenning to 8023");
});

function updateDataAy1(req,res){
  ROOM_FM1 = req.body;
}
function updateDataAy2(req,res){
  ROOM_FM2 = req.body;
}
function updateDataAy3(req,res){
  ROOM_kWh = req.body;
}


function dataAy(data){
  var openingChar;
  var totalByte;
  var totalNode;
  var floorNumber;
  var roomNumber;
  var total_kWh;
  var total_FM1;
  var total_FM2;
  var checkCRC_L = 0x00;
  var checkCRC_H = 0x00;
  var reqNum;

  //checkin
  // console.log(data);
  if( (data[0] == 0x3C) && 
    (data[2]  > 0x30) && (data[4]  > 0x30) &&
    (data[5] == 0x39) && (data[6] == 0x38) && (data[7] == 0x39)) //<
  {
    var floorNumberIN = (data[1]-0x30) + (data[2]-0x30);
    var roomNumberIN = (data[3]-0x30) + (data[4]-0x30);
    openingChar = '>';
    totalByte   = 15;
    totalNode   = 1;
    floorNumber = floorNumberIN;
    roomNumber  = roomNumberIN;
    console.log("request lantai " + floorNumberIN + " nomor Kamar :" + roomNumberIN);
    reqNum = floorNumberIN*2*100+roomNumberIN
    total_kWh   = ROOM_kWh[reqNum];
    total_FM1   = ROOM_FM1[reqNum];
    total_FM2   = ROOM_FM2[reqNum];

    //Little-Indian : 1-Byte : 00
    byte_openingChar = openingChar.charCodeAt (0);
      
    //Little-Indian : 2-Byte : 01-02
        byte_totalB_1 = totalByte&0xFF;
        byte_totalB_2 = totalByte>>8;
        
    //Little-Indian : 2-Byte : 03-04
        byte_totalN_1 = totalNode&0xFF;
        byte_totalN_2 = totalNode>>8;
        
    //Little-Indian : 1-Byte : 05
        byte_floorN_1 = floorNumber&0xFF;
        
    //Little-Indian : 1-Byte : 06
        byte_roomN_1 = roomNumber&0xFF;
        
    //Little-Indian : 4-Byte : 07-08-09-10
        byte_kWh_1 = total_kWh&0xFF;
        byte_kWh_2 = total_kWh>>8;
        byte_kWh_3 = total_kWh>>16;
        byte_kWh_4 = total_kWh>>24;
        
    //Little-Indian : 2-Byte : 11-12
        byte_FM1_1 = total_FM1&0xFF;
        byte_FM1_2 = total_FM1>>8;
    //Little-Indian : 2-Byte : 13-14
        byte_FM2_1 = total_FM2&0xFF;
        byte_FM2_2 = total_FM2>>8;
        
    //Little-Indian : 2-Byte : 15-16

    CH_IN_BUFFER = [];
    CH_IN_BUFFER[0] = byte_openingChar;
    CH_IN_BUFFER[1] = byte_totalB_1;
    CH_IN_BUFFER[2] = byte_totalB_2;
    CH_IN_BUFFER[3] = byte_totalN_1;
    CH_IN_BUFFER[4] = byte_totalN_2;
    CH_IN_BUFFER[5] = byte_floorN_1;
    CH_IN_BUFFER[6] = byte_roomN_1;
    CH_IN_BUFFER[7] = byte_kWh_1;
    CH_IN_BUFFER[8] = byte_kWh_2;
    CH_IN_BUFFER[9] = byte_kWh_3;
    CH_IN_BUFFER[10] = byte_kWh_4;
    CH_IN_BUFFER[11] = byte_FM1_1;
    CH_IN_BUFFER[12] = byte_FM1_2;
    CH_IN_BUFFER[13] = byte_FM2_1;
    CH_IN_BUFFER[14] = byte_FM2_2;
    CH_IN_BUFFER[15] = 0;
    CH_IN_BUFFER[16] = 0;
    u16CRC = 0xFFFF;
    checkCRC_L = 0x00;
    checkCRC_H = 0x00;
    for(i = 1; i<=14; i++)
    {
        u16CRC = crc16_update(u16CRC, CH_IN_BUFFER[i]);
        // node.warn(u16CRC);
    }
    
    checkCRC_L = (u16CRC & 0xFF);
    checkCRC_H = (u16CRC >> 8);  
            
    CH_IN_BUFFER[15] = checkCRC_L;
    CH_IN_BUFFER[16] = checkCRC_H;
    CH_IN_BUFFER[17] = 0x0A;
    sendAy = Buffer.from(CH_IN_BUFFER);
  }
  else if( (data[0] == 0x3C) && 
    (data[2]  > 0x30) && (data[4]  > 0x30) &&
    (data[5] == 0x38) && (data[6] == 0x37) && (data[7] == 0x38)) //<
  {
    floorNumberIN = (data[1]-0x30) + (data[2]-0x30);
    roomNumberIN = (data[3]-0x30) + (data[4]-0x30);
    u16CRC = 0xFFFF;
    openingChar = '>';
    totalByte   = 15;
    totalNode   = 1;
    floorNumber = floorNumberIN;
    roomNumber  = roomNumberIN;
    reqNum = floorNumberIN*2*100+roomNumberIN;
    total_kWh   = ROOM_kWh[reqNum];
    total_FM1   = ROOM_FM1[reqNum];
    total_FM2   = ROOM_FM2[reqNum];
    
    //Little-Indian : 1-Byte : 00
        byte_openingChar = openingChar.charCodeAt (0);
        
    //Little-Indian : 2-Byte : 01-02
        byte_totalB_1 = totalByte&0xFF;
        byte_totalB_2 = totalByte>>8;
        
    //Little-Indian : 2-Byte : 03-04
        byte_totalN_1 = totalNode&0xFF;
        byte_totalN_2 = totalNode>>8;
        
    //Little-Indian : 1-Byte : 05
        byte_floorN_1 = floorNumber&0xFF;
        
    //Little-Indian : 1-Byte : 06
        byte_roomN_1 = roomNumber&0xFF;
        
    //Little-Indian : 4-Byte : 07-08-09-10
        byte_kWh_1 = total_kWh&0xFF;
        byte_kWh_2 = total_kWh>>8;
        byte_kWh_3 = total_kWh>>16;
        byte_kWh_4 = total_kWh>>24;
        
    //Little-Indian : 2-Byte : 11-12
        byte_FM1_1 = total_FM1&0xFF;
        byte_FM1_2 = total_FM1>>8;
    //Little-Indian : 2-Byte : 13-14
        byte_FM2_1 = total_FM2&0xFF;
        byte_FM2_2 = total_FM2>>8;
        
    //Little-Indian : 2-Byte : 15-16
    
        
    
    CH_IN_BUFFER[0] = byte_openingChar;
    CH_IN_BUFFER[1] = byte_totalB_1;
    CH_IN_BUFFER[2] = byte_totalB_2;
    CH_IN_BUFFER[3] = byte_totalN_1;
    CH_IN_BUFFER[4] = byte_totalN_2;
    CH_IN_BUFFER[5] = byte_floorN_1;
    CH_IN_BUFFER[6] = byte_roomN_1;
    CH_IN_BUFFER[7] = byte_kWh_1;
    CH_IN_BUFFER[8] = byte_kWh_2;
    CH_IN_BUFFER[9] = byte_kWh_3;
    CH_IN_BUFFER[10] = byte_kWh_4;
    CH_IN_BUFFER[11] = byte_FM1_1;
    CH_IN_BUFFER[12] = byte_FM1_2;
    CH_IN_BUFFER[13] = byte_FM2_1;
    CH_IN_BUFFER[14] = byte_FM2_2;
    CH_IN_BUFFER[15] = 0;
    CH_IN_BUFFER[16] = 0;
    
    u16CRC = 0xFFFF;
    checkCRC_L = 0x00;
    checkCRC_H = 0x00;
    for(i = 1; i<=14; i++)
    {
        u16CRC = crc16_update(u16CRC, CH_IN_BUFFER[i]);
        // node.warn(u16CRC);
    }
    
    checkCRC_L = (u16CRC & 0xFF);
    checkCRC_H = (u16CRC >> 8);  
            
    CH_IN_BUFFER[15] = checkCRC_L;
    CH_IN_BUFFER[16] = checkCRC_H;
    CH_IN_BUFFER[17] = 0x0A;
    sendAy= Buffer.from(CH_IN_BUFFER);
  }
  else if( (data[0] == 0x3C) && 
        (data[1] == 0x30) && (data[2] == 0x30) &&
        (data[3] == 0x30) && (data[4] == 0x30) &&
        (data[5] == 0x39) && (data[6] == 0x38) && (data[7] == 0x39) && (data[8] == 0x0A)) //<
  {
    var maxFloorNumber = 6;
    var ARR_MaxRoomNum = Buffer.alloc(7);
    ARR_MaxRoomNum[1] = 19; //Floor1
    ARR_MaxRoomNum[2] = 27; //Floor2
    ARR_MaxRoomNum[3] = 27; //Floor3
    ARR_MaxRoomNum[4] = 27; //Floor4
    ARR_MaxRoomNum[5] = 27; //Floor5
    ARR_MaxRoomNum[6] = 27; //Floor6
    var totalRoom = ARR_MaxRoomNum[1]+ARR_MaxRoomNum[2]+ARR_MaxRoomNum[3]+
                    ARR_MaxRoomNum[4]+ARR_MaxRoomNum[5]+ARR_MaxRoomNum[6];
    var totalByteINIT = 1+2+2+(10*totalRoom)+2+1;
    openingChar = '>';
    totalByte   = 2+(10*totalRoom)+2+1;
    totalNode   = totalRoom;
    //Little-Indian : 1-Byte : 00
    var mbyte_openingChar = openingChar.charCodeAt (0);
        
    //Little-Indian : 2-Byte : 01-02
    var mbyte_totalB_1 = totalByte&0xFF;
    var mbyte_totalB_2 = totalByte>>8;
        
    //Little-Indian : 2-Byte : 03-04
    var mbyte_totalN_1 = totalNode&0xFF;
    var mbyte_totalN_2 = totalNode>>8;
            
    //Little-Indian : 2-Byte : 15-16
    
    var ALL_METER_BUFFER = [];
    ALL_METER_BUFFER[0]  = mbyte_openingChar;
    ALL_METER_BUFFER[1]  = mbyte_totalB_1; //totalByte 1
    ALL_METER_BUFFER[2]  = mbyte_totalB_2; //totalByte 2
    ALL_METER_BUFFER[3]  = mbyte_totalN_1; //totalNode 1   1
    ALL_METER_BUFFER[4]  = mbyte_totalN_2; //totalNode 2   2
            
    var cntARR_M = 5; //cntARR_METER        
    var cntRoomNum = 1;
    for(i=1; i<=maxFloorNumber; i++)
    {
        for(j=1; j<=ARR_MaxRoomNum[i]; j++)
        {
            floorNumber = i;
            roomNumber  = j;
            reqNum = floorNumberIN*2*100+roomNumberIN;
            total_kWh   = ROOM_kWh[reqNum];
            total_FM1   = ROOM_FM1[reqNum];
            total_FM2   = ROOM_FM2[reqNum];
                
            //Little-Indian : 1-Byte : 05
            var mbyte_floorN_1 = floorNumber&0xFF;
                
            //Little-Indian : 1-Byte : 06
            var mbyte_roomN_1 = roomNumber&0xFF;
                
            //Little-Indian : 4-Byte : 07-08-09-10
            var mbyte_kWh_1 = total_kWh&0xFF;
            var mbyte_kWh_2 = total_kWh>>8;
            var mbyte_kWh_3 = total_kWh>>16;
            var mbyte_kWh_4 = total_kWh>>24;
                
            //Little-Indian : 2-Byte : 11-12
            var mbyte_FM1_1 = total_FM1&0xFF;
            var mbyte_FM1_2 = total_FM1>>8;
            //Little-Indian : 2-Byte : 13-14
            var mbyte_FM2_1 = total_FM2&0xFF;
            var mbyte_FM2_2 = total_FM2>>8;
                
            //Little-Indian : 2-Byte : 15-16
            
            ALL_METER_BUFFER[cntARR_M++] = mbyte_floorN_1; //Floor Number  3
            ALL_METER_BUFFER[cntARR_M++] = mbyte_roomN_1;  //Room  Number  4
            ALL_METER_BUFFER[cntARR_M++] = mbyte_kWh_1;    //kWh 1         5
            ALL_METER_BUFFER[cntARR_M++] = mbyte_kWh_2;    //kWh 2         6
            ALL_METER_BUFFER[cntARR_M++] = mbyte_kWh_3;    //kWh 3         7
            ALL_METER_BUFFER[cntARR_M++] = mbyte_kWh_4;    //kWh 4         8
            ALL_METER_BUFFER[cntARR_M++] = mbyte_FM1_1;    //FM1 1         9
            ALL_METER_BUFFER[cntARR_M++] = mbyte_FM1_2;    //FM1 2         10
            ALL_METER_BUFFER[cntARR_M++] = mbyte_FM2_1;    //FM2 1         11
            ALL_METER_BUFFER[cntARR_M++] = mbyte_FM2_2;    //FM2 2         12
            // node.warn("cntARR: " + cntARR_M); 
            cntRoomNum++;
        }
    }

    u16CRC = 0xFFFF;
    checkCRC_L = 0x00;
    checkCRC_H = 0x00;
    for(i = 1; i<=(totalByte-1); i++)
    {
        u16CRC = crc16_update(u16CRC, ALL_METER_BUFFER[i]);
        // node.warn(u16CRC);
    }
    
    checkCRC_L = (u16CRC & 0xFF);
    checkCRC_H = (u16CRC >> 8);  
            
    // ALL_METER_BUFFER[15] = checkCRC_L;
    // ALL_METER_BUFFER[16] = checkCRC_H;
    ALL_METER_BUFFER[cntARR_M++] = checkCRC_L;
    ALL_METER_BUFFER[cntARR_M++] = checkCRC_H;
    ALL_METER_BUFFER[cntARR_M++] = 0x0A;
    // console.log(ALL_METER_BUFFER);
    sendAy = Buffer.from(ALL_METER_BUFFER);
  }
  else
  {
      var ARR_FAKE = new Buffer(2);
      ARR_FAKE[0] = 0x3E;
      ARR_FAKE[1] = 0x0A;
      sendAy = Buffer.from(ARR_FAKE);
  }
    
                
}



// process get data
function requestData(a,b,c,d,e,f,g,h){
  var buffer = Buffer.from([a,b,c,d,e,f,g,h]);
  if(!client.destroyed){
    client.write(buffer);
  }
}

function olahData(floor){
  var FLOOR_NUMBER = floor;
  var u16CRC = 0xFFFF;
  var checkCRC_L = 0x00;
  var checkCRC_H = 0x00;
  var tempI = FLOOR_SERVER[0];
  const buff_S = [];

  if(tempI > 0){
    for(i = 0; i<=5; i++)
    {
        buff_S[i] = FLOOR_SERVER[i];
    }
    console.log("atur relay");
  }
  else{
    buff_S[0] = FLOOR_NUMBER;
    buff_S[1] = 0xFF;
    buff_S[2] = 0xFF;
    buff_S[3] = 0xFF;
    buff_S[4] = 0xFF;
    buff_S[5] = 0xFF;
  }

  for(i = 0; i<=5; i++)
    {
        u16CRC = crc16_update(u16CRC, buff_S[i]);
    }
    
  checkCRC_L = (u16CRC & 0xFF);
  checkCRC_H = (u16CRC >> 8);  
          
  buff_S[6] = checkCRC_L;
  buff_S[7] = checkCRC_H; 
  
  for(i = 0; i<=7; i++)
    {
        FLOOR_SERVER[i] = 0;
    }
  requestData(buff_S[0],buff_S[1],buff_S[2],buff_S[3],buff_S[4],buff_S[5],buff_S[6],buff_S[7],);
}


function crc16_update(crc, aa)
  {
      var i;
    
      crc ^= aa;
      for (i = 0; i < 8; i++)
      {
          if (crc & 1) crc = (crc >> 1) ^ 0xA001;
          else         crc = (crc >> 1);
      }
      return crc;
  }
  
  //event handled
  function getData(data){
    // console.log(data);
    floorData = data;
  }

  function sendToJs(req,res){
    currFloor = req.body.Number;
    // console.log("lantai ke : " + currFloor + " req data ");
    olahData(currFloor);
    var buf = Buffer.from(floorData);
    // console.log(buf);
    buf = buf.toJSON();
    res.send(buf);
  }

  function checkIn(req,res){
    // const id = req.body.id;
    console.log("Kamar nomor : " + req.body.room + " Check In");
    relayOn(req.body.room);
    // updateDataAy();
    res.send();
  }

  function checkOut(req,res){
    // const id = req.body.id;
    console.log("Kamar nomor : " + req.body.room + " Check Out");
    relayOff(req.body.room);
    res.send();
  }

  function reqRoomData(req,res){
    console.log("request data....");
    res.send("tes");
  }

function relayOn(floorNumber){
  var floor = parseInt(floorNumber);
  var C_wM_cRelay = 0x31 + floor;
  var timerON_H = delayOFF_TIM1 & 0xFF;
  var timerON_L = delayOFF_TIM1 >> 8;
  serverFloorProcess(floorNumber,C_wM_cRelay,0x00,0x73,timerON_H,timerON_L);
  console.log(floorNumber + " " + C_wM_cRelay.toString(16) + " 0x00 " + " 0x73 " + timerON_H + " " + timerON_L);
}

function relayOff(floorNumber){
  var floor = parseInt(floorNumber);
  var C_wM_cRelay = 0x31 + floor;
  serverFloorProcess(floorNumber,C_wM_cRelay,0x00,0x70,0x00,0x00);
  console.log(floorNumber + " " + C_wM_cRelay.toString(16) + " 0x00 " + " 0x70 " + "0x00" + " " + "0x00" );
}

function serverFloorProcess(a,b,c,d,e,f){
   FLOOR_SERVER[0] = a;
   FLOOR_SERVER[1] = b;
   FLOOR_SERVER[2] = c;
   FLOOR_SERVER[3] = d;
   FLOOR_SERVER[4] = e;
   FLOOR_SERVER[5] = f;
  olahData(0);
}

function setDelay(req,res){
  console.log("delay : " + req.body.val);
  delayOFF_TIM1 = req.body.val;
  res.send(req.body.val);
}

function refreshServer(){
  console.log("socket refresh server");
  if(app1.disabled){
    app1.listen(port, () => {
      console.log(`reconnected to  http://localhost:${port}`);
      });
  }
}

function netReconnect(ex) {
  console.log("handled error");
  console.log(ex);
  console.log("Trying too reconnect...");
  client.connect(8025,"192.168.1.199", function() {
    console.log('reconnected');
  });
}




// function logErrors (err, req, res, next) {
//   console.error(err.stack);
//   refreshServer();
//   next(err);
// }

// function clientErrorHandler (err, req, res, next) {
//   refreshServer();
//   if (req.xhr) {
//     res.status(500).send({ error: 'Something failed!' });
//   } else {
//     next(err);
//   }
// }

// function errorHandler (err, req, res, next) {
//   refreshServer();
//   res.status(500);
//   res.render('error', { error: err });
// }