const modbus = require('jsmodbus');
const net = require('net');

const options = {
  'host': '127.0.0.1',
  'port': '502',
};

const getModbusData = async (startAddress, length) => {
  return new Promise(resolve => {
      const socket = new net.Socket();
      const client = new modbus.client.TCP(socket);

      socket.on('connect', function () {
        client.readHoldingRegisters(startAddress, length)
          .then(function (resp) {
            var resData = resp.response._body.valuesAsArray;
            socket.end();
            return resolve(resData);
          }).catch(function () {
            console.log("Error in catch");
            console.error(require('util').inspect(arguments, {
              depth: null
            }))
            socket.end();
            return reject(null);
          });
      });

      socket.on('error', console.error)
      socket.connect(options);
    });
};

const writeModbusData = (address, value) => {
  const socket = new net.Socket()
  const client = new modbus.client.TCP(socket)

  socket.on('connect', function () {
   client.writeSingleRegister(address, value)
      .then(function (resp) {
        socket.end()
      }).catch(function () {
        console.error(arguments)
        socket.end()
      })
  })

  socket.on('error', console.error)
  socket.connect(options)
}

module.exports = { getModbusData, writeModbusData };