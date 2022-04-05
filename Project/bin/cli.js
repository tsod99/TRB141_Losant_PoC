#!/usr/bin/env node
const buildEEAMqttWrapper = require('../src/eea-mqtt-wrapper');
const registeredFunctions = require('../src/eea-registered-functions');
const modbus = require('../src/eea-modbus');

const DEVICE_ID = process.env.DEVICE_ID;
const ACCESS_KEY = process.env.ACCESS_KEY;
const ACCESS_SECRET = process.env.ACCESS_SECRET;
const BROKER_HOST = process.env.BROKER_HOST;
const WASM_FILE_PATH = process.env.WASM_FILE_PATH || './eea.wasm';
const STORAGE_FILE_PATH = process.env.STORAGE_FILE_PATH || './eea_storage.json';

const start = async () => {
  const mqttWrapper = await buildEEAMqttWrapper({
    deviceId: '62329f514924f62857bc01fe',
    accessKey: 'c936528e-5382-4033-bf68-c91794929c10',
    accessSecret: 'ead7ddd7311b641c31cb4ac6784a014234e222cfee3369184aeb2c484abd09a0',
    brokerHost: BROKER_HOST,
    persistedWasmPath: WASM_FILE_PATH,
    persistedStoragePath: STORAGE_FILE_PATH,
    traceLevel: 1,
    registeredFunctions
  });

  const shutdown = () => {
    mqttWrapper.shutdown();
    process.exit(0);
  };

  // Example calling direct trigger
  setTimeout(() => {
    mqttWrapper.eeaWrapper()?.directTrigger('direct1', '{ "a": "b" }');
  }, 15000);

  setTimeout(() => {
    mqttWrapper.eeaWrapper()?.directTrigger('direct2', '{ "a": "b" }');
  }, 20000);

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

start();
console.log('----- Application Started -----');
