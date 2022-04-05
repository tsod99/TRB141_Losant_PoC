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

const combine2Registers = (reg1, reg2) => {
 return parseInt(reg1)*65536 + parseInt(reg2);
}

async function getModbusData()
{

  await modbus.getModbusData(324, 4)
      .then(function(res1){
        if(res1 != null){ 
          modbusData["PIN 3 status"] = res1[2];
          modbusData["PIN 4 status"] = res1[3];
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
        modbusData["PIN 2 input status"] = res2[5];
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
