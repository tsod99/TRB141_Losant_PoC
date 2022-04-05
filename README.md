# TRB141_Losant_PoC

The goal of this project is to implement the interaction between the Teltonika TRB141 device and the Losant IoT platform through the embedded edge agent(EEA) workflow.

-------------------------------------- A step-by-step guide to running this project -------------------------------------------

1. You need to install the NodeJS packags on your device. Please see "Node_packages" folder.
2. You need to download the NodeJS project and execute it on your device. Please see "Project" folder.
3. You need to register your device on the Losant IoT platform, assign the access key to the device and create the EEA workflow on the server.
   And then, you can deploy the EEA workflow onto the device.
   There are a few problems to keep in mind in this step.
   
   - When creating the device on the platform, you have to choose "Embedded" in the Device Class section. (not "Standalone")
   - After creating the device, you need to create the access key or assign the existing access key to the created device.
     When creating the access key, you must store the access secret to a safe place as you can read it again once it is created.
     Currently, you can find the access secret key file in this Github repository. i.e, "access-key-c936528e-5382-4033-bf68-c91794929c.txt"
   - Once the device is created and the access key is assigned to the device, you can use the device id, access key and access secret for the NodeJS project.
     So, these credentials will be used to establish the connection to the Losant platform in the project file(/bin/cli.js).
     In fact, device registration process should be done first of all as you need to get the device id, access key and the access secret.
     
     ![image](https://user-images.githubusercontent.com/58363139/161797950-68598be6-ba0c-4027-b67d-0153929af880.png)

   - And then, you can create the new EEA workflow, at this time, you have to create the workflow in the "EMBEDDED WORKFLOWS" section, 
     not in the "APPLICATION WORKFLOWS" section.
     I created the new workflow for this project, do you can monitor the device input/output pin states in real-time and also you can control the relays on it.
     And you can deploy the workflow to the device and monitor the device status in real-time in the debug window.
     After creating the workflow, you can export it as below.
     
     ![image](https://user-images.githubusercontent.com/58363139/161800063-17699dba-1e92-44f4-8c2c-b57f26d67bb8.png)

     So, once the project works properly, you should be able to see the green color icon in the device page like the following.
     
     ![image](https://user-images.githubusercontent.com/58363139/161800402-a6f342a8-54c7-4663-8d40-8b362105daab.png)

     Finally, you should be able to see the real-time data in the workflow debug window.

     ![image](https://user-images.githubusercontent.com/58363139/161800909-e58ed5e7-7504-4a85-af90-3b8b7e2ba9ce.png)

     Hope you will love it.:)
     
     
