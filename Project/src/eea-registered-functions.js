const { encodeStringAndLength, decodeString, EEA_RESULT_CODES } = require('./eea-utils');
const { exec } = require('child_process');
const modbus = require('./eea-modbus');

var modbusData_IO = {};
var modbusData_Main = {};
var data_updated = 0;

//////////// Default I/O Modbus Register Addresses /////////////////////////////////
// PIN 3 status (4 PIN connector)           324
// PIN 4 status (4 PIN connector)           325
// PIN 3 direction                          326
// PIN 4 direction                          327
// Relay(relay 1)                           337
// Latching relay(relay 2)                  338
// Isolated input                           339
// PIN 1 input status                       341
// PIN 2 input status                       342
// PIN 1 (Dry/Wet) status                   343
// PIN 2 (Dry/Wet) status                   344
////////////////////////////////////////////////////////////////////////////////

const combine2Registers = (reg1, reg2) => {
 return parseInt(reg1)*65536 + parseInt(reg2);
}

async function getIOModbusData()
{

  await modbus.getModbusData(324, 4)
      .then(function(res1){
        if(res1 != null){ 
          modbusData_IO["pin3_status"] = res1[2];
          modbusData_IO["pin4_status"] = res1[3];
          modbusData_IO["pin3_direction"] = res1[0];
          modbusData_IO["pin4_direction"] = res1[1];
        }
  });

  await modbus.getModbusData(337, 8)
    .then(function(res2){
      if(res2 != null){
        modbusData_IO["relay_1"] = res2[0];
        modbusData_IO["relay_2"] = res2[1];
        modbusData_IO["isolated_input"] = res2[2];
        modbusData_IO["pin1_input_status"] = res2[4];
        modbusData_IO["pin2_input_status"] = res2[5];
        modbusData_IO["pin1_dry_wet_status"] = res2[6];
        modbusData_IO["pin2_dry_wet_status"] = res2[7];
        data_updated = 1;
      }
  });
}

async function getMainModbusData(startAddress, count)
{

  await modbus.getModbusData(startAddress, count)
      .then(function(res3){
        if(res3 != null){
          for(var i=0;i<count;i++) {
            modbusData_Main[String(startAddress+i)] = res3[i];
          }
          data_updated = 2;
        }
  });
}

const getDataUpdated = () => {
  return data_updated;
};

const getMainData = () => {
  return modbusData_Main;
};

const getIOData = () => {
  return modbusData_IO;
};

const resetDataUpdated = () => {
  data_updated = 0;
};

const registeredFunctions = (wasmMemory) => {
  return {
    eea_fn_read_modbus_io: ( ) => {
      modbusData_IO = {};            
      getIOModbusData();
      return EEA_RESULT_CODES.success;
    },

    eea_fn_read_modbus_main: (startAddress, count) => {
      modbusData_Main = {};      
      getMainModbusData(startAddress, count);
      return EEA_RESULT_CODES.success;
    },

    eea_fn_relay_on: (relayNum) => {

      var cmd = "ubus call ioman.relay.relay" + String(relayNum - 1) + " update '{\"state\":\"closed\"}'";
      exec(`${cmd}`, (err, stdout, stderr) => {
        if (err) {
          console.error(err)
        } else {
         console.log(`stdout: ${stdout}`);
         console.log(`stderr: ${stderr}`);
        }
      });

      return EEA_RESULT_CODES.success;
    },

    eea_fn_relay_off: (relayNum) => {

      var cmd = "ubus call ioman.relay.relay" + String(relayNum - 1) + " update '{\"state\":\"open\"}'";
      exec(`${cmd}`, (err, stdout, stderr) => {
        if (err) {
          console.error(err)
        } else {
         console.log(`stdout: ${stdout}`);
         console.log(`stderr: ${stderr}`);
        }
      });

      return EEA_RESULT_CODES.success;
    },

    eea_fn_base64_encode: (ptrStr, strLen, outPtrEncodedStr, strBufferLen, outPtrEncodedStrLen) => {
      const input = decodeString(wasmMemory, ptrStr, strLen);
      const encoded = Buffer.from(input).toString('base64');
      encodeStringAndLength(wasmMemory, encoded, outPtrEncodedStr, strBufferLen, outPtrEncodedStrLen);
      return EEA_RESULT_CODES.success;
    }
  };
};

module.exports = {
  getDataUpdated,
  getMainData,
  getIOData,
  resetDataUpdated,
  registeredFunctions
}
