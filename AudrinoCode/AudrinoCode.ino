#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266mDNS.h>
#include <ESP8266WebServer.h>   // Include the WebServer library
#include <ArduinoJson.h>
#include <Servo.h>
 
//WEB SERVER-----------------------
const char* ssid = "TYE-LAPTOP";
const char* password = "X3r3+172";
const int LDRPin=A0;

signed char solarValue;
signed char ldr1Value = 0;
signed char ldr2Value = 0;
signed char ldr3Value = 0;
signed char ldr4Value = 0;
signed char eDiff;
signed char rDiff;

//MAIN----------------------------
 // declare variables for pins
const int pinLDR1 = D0;
const int pinLDR2 = D1;
const int pinLDR3 = D2;
const int pinLDR4 = D3;
const int pinSolar = D4;
const int servoRotationPin = 9;
const int servoElevationPin = 8;
const int pinPushButton = 7;

// declare variables for servo angle (position)
int elevationServoPosition = 0;
int rotationServoPosition = 0;
const int sunrisePositionElevation = 90;
const int sunrisePositionRotation = 0;

//INITIAL VALUES
int valueLDR1;
int valueLDR2;
int valueLDR3;
int valueLDR4;

const int minValueLDR = 6;

int rotationDiff;
int elevationDiff;
int prevRotationDiff;
int prevElevationDiff;

int avgTop;
int avgBottom;
int avgLeft;
int avgRight;
int avgSum;

int result;
// margin for difference to move motor
int threshold = 10;
const int delta = 30;

// variables for measuring solar panel
int solarReading;
float solarVoltage;

// // create servo object and give it a name
// Servo servoRotation;
// Servo servoElevation;

//timing
int timeElapsedInDarkness; //ms
const int interval = 1000; //ms. Used for all time dependent fns so be careful when changing.
int currTime;
int trackerFnTime;
const int resetToSunriseAfterTime = 10000; //10 seconds
const int resetToSunriseThreshold = 10;

ESP8266WebServer server(80);
 
void setup() {
  // put your setup code here, to run once:
    // CAR_moveForward();
 
 //WEB SERVER---------------------------
  Serial.begin(9600);
  delay(10);
  // Connect to Wi-Fi
  Serial.println('\n');

  Serial.print("Connecting...");
 
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
 
  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
 
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
 
  if (MDNS.begin("esp8266")) {              // Start the mDNS responder for esp8266.local
    Serial.println("mDNS responder started");
  } else {
    Serial.println("Error setting up MDNS responder!");
  }
// Define HTTP endpoints
  //data: status, ldr values, solar cell value
  server.on("/data", HTTP_GET, handlePollingData);
 
  //manual search trigger was clicked
  server.on("/search", HTTP_POST, handleSearch);
 
  //manual reset button was clicked
  server.on("/manualResetToSunrise", HTTP_POST, resetToSunrise);
  server.enableCORS(true);

  server.begin();
  Serial.println();
  Serial.print("HTTP server started");

  //MAIN---------------
 
  //   servoRotation.attach(servoRotationPin);
  //   servoElevation.attach(servoElevationPin);
  // //set the intiial servos positions
  //   servoRotation.write(rotationServoPosition);      
  //   servoElevation.write(elevationServoPosition);  
    Serial.print("Servo positions set");
}
 
void loop() {
  //only run the tracker logic every interval milliseconds.
  currTime = millis();
  if (currTime - trackerFnTime >=interval){
    // trackerLogic();
    trackerFnTime = currTime;
    server.handleClient();
  }
  //periodically send a post to /data
}

void handlePollingData(){
  Serial.println("Received /data request");

  JsonDocument doc;

  const int _ldr1 = analogRead(pinLDR1);
  const int _ldr2 = analogRead(pinLDR2);
  const int _ldr3 = analogRead(pinLDR3);
  const int _ldr4 = analogRead(pinLDR4);

  doc["ldr1"] = _ldr1;
  doc["ldr2"] = _ldr2;
  doc["ldr3"] = _ldr3;
  doc["ldr4"] = _ldr4;
 
  doc["solarV"] = 0;
  doc["batteryPerc"]=100;
  doc["eDiff"] = 0;
  doc["rDiff"] = 0;
  doc["ePos"] = 0;
  doc["rPos"] = 0;

  String output;

  doc.shrinkToFit();  // optional

  server.sendHeader("Content-Type", "application/json");
  WiFiClient client = server.client();
  serializeJson(doc, output);
  Serial.println();
  Serial.print("Returning: ");
  Serial.print(output);
  server.send(200,"application/json",output);
}

void handleSearch(){
  Serial.println("Received /search request");
  server.sendHeader("Content-Type", "application/xml");
  server.send(200, "text/plain", "");
}

void handleRoot() {
  server.send(200, "text/plain", "Hello world!");   // Send HTTP status 200 (Ok) and send some text to the browser/client
}

void handleManualReset(){
  Serial.println("Received /pollingData request");
  server.send(200, "text/plain", "");
}

void resetToSunrise(){
  //do nothing rn
  Serial.println("Received /reset request");
  server.send(200, "text/plain", "");
}

void handleNotFound(){
  Serial.println();
  Serial.print("Invalid request received - returning 404");
  server.send(404, "text/plain", "404: Not found"); // Send HTTP status 404 (Not Found) when there's no handler for the URI in the request
}