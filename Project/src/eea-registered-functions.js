const { encodeStringAndLength, decodeString, EEA_RESULT_CODES } = require('./eea-utils');
const modbus = require('./eea-modbus');

var modbusData = {};

//////////// Default Modbus Register Addresses /////////////////////////////////
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
// WAN IP Reg 1                             139
// WAN IP Reg 2                             140
////////////////////////////////////////////////////////////////////////////////

/////////// Custom Modbus Register Addresses ///////////////////////////////////
// PIN 1 Runtime Accumulator                1025
// PIN 2 Runtime Accumulator                1027
// PIN 3 Runtime Accumulator                1029
// PIN 4 Runtime Accumulator                1031
////////////////////////////////////////////////////////////////////////////////

const combine2Registers = (reg1, reg2) => {
 return parseInt(reg1)*65536 + parseInt(reg2);
}

async function getModbusData()
{

  await modbus.getModbusData(1025, 8)
    .then(function(res0){
      if(res0 != null){
        modbusData["PIN 1 Runtime Accumulator"] = combine2Registers(res0[0], res0[1]);
        modbusData["PIN 2 Runtime Accumulator"] = combine2Registers(res0[2], res0[3]);
        modbusData["PIN 3 Runtime Accumulator"] = combine2Registers(res0[4], res0[5]);
        modbusData["PIN 4 Runtime Accumulator"] = combine2Registers(res0[6], res0[7]);
      }
  });

  await modbus.getModbusData(324, 4)
      .then(function(res1){
        if(res1 != null){ 
          modbusData["PIN 3 status"] = res1[2];
          if(res1[2] === 1 && typeof modbusData["PIN 3 Runtime Accumulator"] !== "undefined"){ //if input 3 is 1
            var newVal = parseInt(modbusData["PIN 3 Runtime Accumulator"]) + 1;
            modbus.writeModbusData(1029, parseInt(newVal/65536));
            modbus.writeModbusData(1030, newVal%65536);
          }
          modbusData["PIN 4 status"] = res1[3];
          if(res1[3] === 1 && typeof modbusData["PIN 4 Runtime Accumulator"] !== "undefined"){ //if input 4 is 1
            var newVal = parseInt(modbusData["PIN 4 Runtime Accumulator"]) + 1;
            modbus.writeModbusData(1031, parseInt(newVal/65536));
            modbus.writeModbusData(1032, newVal%65536);
          }
          modbusData["PIN 3 direction"] = res1[0];
          modbusData["PIN 4 direction"] = res1[1];
        }
  });

  await modbus.getModbusData(337, 8)
    .then(function(res2){
      if(res2 != null){
        modbusData["relay 1"] = res2[0];
        modbusData["relay 2"] = res2[1];
        modbusData["Isolated input"] = res2[2];
        modbusData["PIN 1 input status"] = res2[4];
        if(res2[4] === 1 && typeof modbusData["PIN 1 Runtime Accumulator"] !== "undefined"){ //if input 1 is 1
          var newVal = parseInt(modbusData["PIN 1 Runtime Accumulator"]) + 1;
          modbus.writeModbusData(1025, parseInt(newVal/65536));
          modbus.writeModbusData(1026, newVal%65536);
        }
        modbusData["PIN 2 input status"] = res2[5];
        if(res2[5] === 1 && typeof modbusData["PIN 2 Runtime Accumulator"] !== "undefined"){ //if input 2 is 1
          var newVal = parseInt(modbusData["PIN 2 Runtime Accumulator"]) + 1;
          modbus.writeModbusData(1027, parseInt(newVal/65536));
          modbus.writeModbusData(1028, newVal%65536);
        }
        modbusData["PIN 1 (Dry/Wet) status"] = res2[6];
        modbusData["PIN 2 (Dry/Wet) status"] = res2[7];
        console.log(modbusData);
      }
  });
}

module.exports = (wasmMemory) => {
  return {
    eea_fn_read_modbus: async (outPtrReadingsStr, strBufferLen, outPtrReadingsLen) => {             
      await getModbusData();
      return EEA_RESULT_CODES.success;
    },

    eea_fn_send_modbus: (outPtrReadingsStr, strBufferLen, outPtrReadingsLen) => {        
      encodeStringAndLength(wasmMemory, JSON.stringify(modbusData), outPtrReadingsStr, strBufferLen, outPtrReadingsLen);
      return EEA_RESULT_CODES.success;
    },

    eea_fn_toggle_relay: (relayNum) => {
      console.log("Toggle relay: " + String(relayNum));
      if(relayNum === 1){
        if(typeof modbusData["relay 1"] !== "undefined"){ 
          var newValue = 1 - modbusData["relay 1"];
          modbus.writeModbusData(337, newValue);
          modbusData["relay 1"] = newValue;
        }
      }
      else if(relayNum === 2){
        if(typeof modbusData["relay 2"] !== "undefined"){ 
          var newValue = 1 - modbusData["relay 2"];
          modbus.writeModbusData(338, newValue); 
          modbusData["relay 2"] = newValue;
        }
      }
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
