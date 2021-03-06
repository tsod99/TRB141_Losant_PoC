# How to execute the NodeJS project on the Teltonika TRB141

Firstly, you need to download the project code to the TRB141 device.
As you know, the OpenWRT based routers have limited flash/memory resources, so you need to download the project into /storage folder of the device as it has
enough space in it.
After downloading the project, you need to install the NodeJS packages as below.

$ npm install

Then you will be able to see a new folder, "node_modules" in the project folder, that means the NodeKS packages are installed successfully.
After installing the NodeJS packages, you can execute the main application in the device using the following command.

$ node --experimental-wasm-bigint /storage/TRB141_Losant_PoC/Project/bin/cli.js

Then you will be able to see "---- Application started -----" message in the terminal window.
Here, there is a problem, if the device is rebooted, you need to execute the application again.
In order to solve this problem, we can make the service file in the device, then the application will start automatically after startup.
The service file, "eea", is added to the Github repo, so you can find it there.
So, you need to copy this file to /etc/init.d folder, and give the executable permission to this file and start the service using the following commands.
Then this service will start automatically after reboot of the device.

$ chmod +x /etc/init.d/eea

$ /etc/init.d/eea enable

$ /etc/init.d/eea start

After executing the application, you need to deploy the EEA(embedded edge agent) workflow into the device from the Losant server, then the device will work 
accorging to the Losant workflow.
By doing so, you will be able to change the device workflow at any time from the Losant server without the device application.

