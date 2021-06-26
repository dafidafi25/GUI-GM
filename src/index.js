
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
      nodeIntegration: true,
      zoomFactor:0.5
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





//START PROCESS

const net = require("net"); 
const express = require('express');
var bodyParser = require('body-parser');
var client = new net.Socket();
var floorData = "";
var delayOFF_TIM1=0;
var RETRY_INTERVAL = 1000;
const FLOOR_SERVER = [];
const app1 = express();
const port = 3000;
//setting socket server to get body data from js
app1.use(bodyParser.urlencoded({extended:false}));
app1.use(bodyParser.json());
app1.listen(port, () => {
console.log(`Example app listening at http://localhost:${port}`);
});

//connect to tcp ip
client.setTimeout(1000);
client.connect(8025,"192.168.1.199", function() {
  console.log('Connected');
});
client.on('error', netReconnect);

//creating event as client get Data handler for arduino
client.on('data', getData); 
//creating event as Server get Data handler for JS get method for requesting data
app1.post('/getData',sendToJs);
//creating event as Server get Data handler for JS get method for checkin
app1.post('/checkIn',checkIn);
app1.post('/checkOut',checkOut);
app1.post('/setting',setDelay);
app1.use(logErrors)
app1.use(clientErrorHandler)
app1.use(errorHandler)

function requestData(a,b,c,d,e,f,g,h){
var buffer = Buffer.from([a,b,c,d,e,f,g,h]);
  if(!client.destroyed){
    client.write(buffer)
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
    // console.log("lantai ke : " + req.body.Number + " req data ");
    olahData(req.body.Number);
    var buf = Buffer.from(floorData);
    console.log(buf);
    buf = buf.toJSON();
    res.send(buf);
  }

  function checkIn(req,res){
    // const id = req.body.id;
    console.log("Kamar nomor : " + req.body.room + " Check In");
    relayOn(req.body.room);
    res.send();
  }

  function checkOut(req,res){
    // const id = req.body.id;
    console.log("Kamar nomor : " + req.body.room + " Check Out");
    relayOff(req.body.room);
    res.send();
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


function logErrors (err, req, res, next) {
  console.error(err.stack);
  refreshServer();
  next(err);
}

function clientErrorHandler (err, req, res, next) {
  refreshServer();
  if (req.xhr) {
    res.status(500).send({ error: 'Something failed!' });
  } else {
    next(err);
  }
}

function errorHandler (err, req, res, next) {
  refreshServer();
  res.status(500);
  res.render('error', { error: err });
}