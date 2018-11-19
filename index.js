
/*
  Noble simple scan example

  This example uses Sandeep Mistry's noble library for node.js to
  create a central server that reads BLE peripherals advertisements.

  created 21 Jan 2015
  by Maria Paula Saba
*/

var noble = require('noble');   //noble library
var fs = require('fs');
const Influx = require ('influx');

const influx = new Influx.InfluxDB('http://localhost:8086/bledata');
console.log(influx);

var obj;

// here we start scanning. we check if Bluetooth is on
noble.on('stateChange', scan);

function scan(state){
  if (state === 'poweredOn') {
    noble.startScanning([],true);
    console.log("Started scanning");
  } else {
    noble.stopScanning();
    console.log("Is Bluetooth on?");
  }
}


// for every peripheral we discover, run this callback function
noble.on('discover', foundPeripheral);
var array = [];

function foundPeripheral(peripheral) {
if (peripheral.address=="cc:4a:11:40:6f:30" || peripheral.address=="d1:4d:e7:bd:9c:42" || peripheral.address=="fb:7e:65:b2:d5:1c"){


  peripheral.timestamp = Date.now();
  delete peripheral._noble;
  //console.log(peripheral);
  //here we output the some data to the console.
  //console.log('\n Discovered new peripheral with UUID ' + peripheral.uuid+ ':');
  //console.log('\t Peripheral Bluetooth address:' + peripheral.address);
  
  if(peripheral.advertisement.localName){
   // console.log('\t Peripheral local name:' + peripheral.advertisement.localName);
  }
  if(peripheral.rssi) {
   // console.log('\t RSSI: ' + peripheral.rssi + ' Est. distance:' + calculateDistance(peripheral.rssi)); //RSSI is the signal strength
    
  }
  if(peripheral.state){
   //console.log('\t state: ' + peripheral.state);
  }
  if(peripheral.advertisement.serviceUuids.length){
  //console.log('\t Advertised services:' + JSON.stringify(peripheral.advertisement.serviceUuids));
  }

  var serviceData = peripheral.advertisement.serviceData;
  if (serviceData && serviceData.length) {
    //console.log('\t Service Data:');
    for (var i in serviceData) {
      //console.log('\t\t' + JSON.stringify(serviceData[i].uuid) + ': ' + JSON.stringify(serviceData[i].data.toString('hex')));
    }
  }
  if (peripheral.advertisement.manufacturerData) {
    //console.log('\t Manufacturer data: ' + JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex')));
  }
  if (peripheral.advertisement.txPowerLevel !== undefined) {
    //console.log('\t TX power level: ' + peripheral.advertisement.txPowerLevel);
  }
/*
influx.writePoints([
{
measurement: 'rssi_reading',
tags: {device : 'rpi_room1', sensor : peripheral.address },
fields: {rssi : peripheral.rssi},
timestamp: peripheral.timestamp,
}]);
*/


var test ={
measurement: 'rssi_reading',
tags: {device : 'rpi_room1', sensor : peripheral.address },
fields: {rssi : peripheral.rssi},
timestamp: peripheral.timestamp,
};
array.push(test);
if (array.length%100 == 0){
influx.writePoints(
array,{
precision: 'ms'
,});
array = [];
console.log('wrote data');
}

/*
array.push(peripheral);
if (array.length%1000 == 0){
	fs.readFile('data.json','utf8', function(err,txt){
	if (err) throw err;
		if (txt !=""){
			data = JSON.parse(txt);	
			data.concat(array);
		}else {
			data = array;
		}
		array = [];
		fs.writeFile('data.json',JSON.stringify(data), function(err,data){
			console.log('file saved');
		});
	});
}
*/
}

};

function calculateDistance(rssi) {
  
  var txPower = -59 //hard coded power value. RUUVI power level 4dbm  
  
  if (rssi == 0) {
    return -1.0; 
  }

  var ratio = rssi*1.0/txPower;
  if (ratio < 1.0) {
    return Math.pow(ratio,10);
  }
  else {
    var distance =  (0.89976)*Math.pow(ratio,7.7095) + 0.111;    
    return distance;
  }
} 