
#include <ArduinoJson.h>
#include <Servo.h>

// HC4051 mp(12, 13, 14); //guess: GPIO
// WEB SERVER-----------------------
const char *ssid = "TYE-LAPTOP";
const char *pass = "X3r3+172";
const int pinLDR1 = A0;
const int pinLDR2 = A1;
const int pinLDR3 = A2;
const int pinLDR4 = A3;
const int pinSolar = A4;
const int pinBattery = A5;
const int pinServerToggle = D11;

signed char solarValue;
signed char eDiff;
signed char rDiff;
int threshold;

// MAIN----------------------------
//  declare variables for pins
const int servoRotationPin = D13;
const int servoElevationPin = D12;
// const int pinPushButton = 7;

// declare variables for servo angle (position)
int elevationServoPosition = 90;
int rotationServoPosition = 90;

// INITIAL VALUES
int valueLDR1;
int valueLDR2;
int valueLDR3;
int valueLDR4;

int avgTop;
int avgBottom;
int avgLeft;
int avgRight;
int avgSum;
int baseAvgSum = -1;
// bool recording;
// const int numValuesToRecord = 10;
// int recorded[numValuesToRecord];
// int remainingNumValues = numValuesToRecord;

// variables for measuring solar panel
int solarReading;
float solarVoltage;

// // create servo object and give it a name
Servo servoRotation;
Servo servoElevation;

// timing
int timeElapsedInDarkness; // ms
const int interval = 1000; // ms. Used for all time dependent fns so be careful when changing.
int currTime;
long lastRecordTime;
// const int recordingDuration = 10000; // 10 seconds
// const int recordEvery = recordingDuration / numValuesToRecord;

bool serverModeToggled;
const int internalDelta = 1;

bool serverStarting = false;
bool standaloneMode = true;

float getThreshold(int avgSum)
{
  const float thresholdValue = (avgSum * 0.4);
  return thresholdValue;
}
void setup()
{
  // WEB SERVER---------------------------
  Serial.begin(115200);
  while (!Serial)
    ; // wait for serial port to connect. Needed for native USB port only

  // MAIN---------------

  servoRotation.attach(servoRotationPin);
  servoElevation.attach(servoElevationPin);
  // // set the intiial servos positions

  servoRotation.write(0);
  delay(1000);
  servoRotation.write(90);
  delay(1000);
  //   servoRotation.write(180);
  //   delay(1000);
  //   servoRotation.write(90);
  //   delay(1000);
  // servoRotation.write(0);
  //   delay(1000);
  //   servoElevation.write(0);
  //   delay(1000);
  //   servoElevation.write(90);
  //   delay(1000);
  //   servoElevation.write(180);
  //   delay(1000);
  //   servoElevation.write(90);
  //   delay(1000);
  //   servoElevation.write(0);
  //   delay(1000);
  //   servoElevation.write(90);
  //   servoRotation.write(0);
}

void initialiseServer()
{
  // check for the WiFi module:

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.print("IP address: ");

  Serial.println();
  Serial.print("HTTP server started");
}

void loop()
{
  Serial.println();
  Serial.print("Testing...");

  // wait for 10s to get the base avg Sum
  Serial.println("Looping. BaseAvgSum: ");
  Serial.print(baseAvgSum);

  // if (baseAvgSum == -1)
  // {
  //   currTime = millis();

  //   if (!recording)
  //   {
  //     recording = true;
  //   }

  //   if (currTime - lastRecordTime >= recordEvery && remainingNumValues >= 0)
  //   {
  //     // if the duration is one which we should record at, record it.
  //     recorded[numValuesToRecord - remainingNumValues] = getAverageSum();
  //     remainingNumValues--;
  //     lastRecordTime = currTime;
  //   }

  //   if (remainingNumValues == 0)
  //   {
  //     int sum = 0;
  //     for (int i = 0; i < numValuesToRecord; i++)
  //     {
  //       sum += recorded[i];
  //     }
  //     baseAvgSum = sum / numValuesToRecord;
  //     recording = false;
  //   }
  // }
  // else
  // {
  if (standaloneMode == 0)
  {
  }
  trackerLogic();

  const bool serverModeToggled = digitalRead(pinServerToggle) == HIGH; // need this to useEffect
  if (serverModeToggled && standaloneMode)
  {
    standaloneMode = false;
    initialiseServer();
  }

  // }

  delay(interval);
}

void handlePollingData()
{
  Serial.println("Received /data request");

  JsonDocument doc;

  // ldr1
  const int _ldr1 = analogRead(pinLDR1); // Value of the sensor connected Option 0 pin of Mux
  // ldr1
  const int _ldr2 = analogRead(pinLDR2); // Value of the sensor connected Option 1 pin of Mux
  // ldr1
  const int _ldr3 = analogRead(pinLDR3); // Value of the sensor connected Option 2 pin of Mux
  // ldr1
  const int _ldr4 = analogRead(pinLDR4); // Value of the sensor connected Option 3 pin of Mux

  const float sv = analogRead(pinSolar); // Value of the sensor connected Option 4 pin of Mux
  const float solarV = (sv + 0.5) * 5 / 1024.0;

  const float _battery = analogRead(pinBattery);        // Value of the sensor connected Option 4 pin of Mux
  const float bPerc = (_battery + 0.5) * 8.97 / 1024.0; // max 8.97 minimum 7.5v
}

void moveToRequestedPositionSmoothly(int target_pos, int init_pos, Servo srv)
{
  int _p = init_pos;
  while (_p != target_pos)
  {
    if (target_pos < init_pos)
    {
      _p = _p - internalDelta;
      srv.write(_p);
    }
    else
    {
      _p = _p + internalDelta;
      srv.write(_p);
    }
    delay(100);
  }
}

int getAverageSum()
{
  avgSum = (avgTop + avgRight + avgBottom + avgLeft) / 4;
  return avgSum;
}

void trackerLogic()
{
  String eAction = "";
  String rAction = "";

  valueLDR1 = analogRead(pinLDR1); // aligned with top, right, bottom, left.
  valueLDR2 = analogRead(pinLDR2);
  valueLDR3 = analogRead(pinLDR3);
  valueLDR4 = analogRead(pinLDR4);

  avgTop = valueLDR1;
  avgRight = valueLDR2;
  avgBottom = valueLDR3;
  avgLeft = valueLDR4;

  // no offset
  //  avgTop = (valueLDR1 + valueLDR2) / 2;
  //  avgBottom = (valueLDR3 + valueLDR4) / 2;
  //  avgLeft = (valueLDR1 + valueLDR4) / 2;
  //  avgRight = (valueLDR2 + valueLDR3) / 2;
  //  avgSum = (avgTop + avgBottom + avgLeft + avgRight) / 4;

  // offset
  avgSum = (valueLDR1 + valueLDR2 + valueLDR3 + valueLDR4) / 4;

  eDiff = avgTop - avgBottom;
  threshold = getThreshold(avgSum);

  if (abs(eDiff) > threshold)
  {
    if (eDiff > 0 && elevationServoPosition)
    {
      // if (elevationServoPosition >= 180){
      //   elevationServoPosition =0;
      //   servoElevation.write(0);
      // }else{
      elevationServoPosition = elevationServoPosition - internalDelta;
      servoElevation.write(elevationServoPosition);
      eAction = "Up";
      // }
    }
    else if (eDiff < 0)
    {
      // if (elevationServoPosition <= 0){
      //   elevationServoPosition =180;
      //   servoElevation.write(180);
      // }
      elevationServoPosition = elevationServoPosition + internalDelta;
      servoElevation.write(elevationServoPosition);
      eAction = "Down";
    }
  }

  rDiff = avgRight - avgLeft;
  if (abs(rDiff) > threshold)
  {
    if (rDiff > 0)
    {
      // if (rotationServoPosition > 180){
      //   //first reset to 0
      //   rotationServoPosition = 0;
      //   servoRotation.write(0);
      // }else{
      rotationServoPosition = rotationServoPosition + internalDelta;
      servoRotation.write(rotationServoPosition);
      rAction = "Left";
      // }
    }
    else // if (rDiff < 0)
    {
      // if (rotationServoPosition <= 0){
      //   rotationServoPosition = 180;
      //   servoRotation.write(180);
      // }else{
      rotationServoPosition = rotationServoPosition - internalDelta;
      servoRotation.write(rotationServoPosition);
      rAction = "Right";
      // }
    }
  }

  // if (recording)
  // {
  //   Serial.println();
  //   Serial.print("Recording, baseAvgSum: ");
  //   Serial.print(baseAvgSum);
  //   Serial.print(", remainingNumValues: ");
  //   Serial.print(remainingNumValues);
  // }
  else
  {
    Serial.print("action: ");
    Serial.print(eAction);
    Serial.print(", ");
    Serial.print(rAction);
    Serial.print(", eDiff: ");
    Serial.print(eDiff);
    Serial.print(" , rDiff: ");
    Serial.print(rDiff);
    Serial.print(", threshold: ");
    Serial.print(threshold);
    Serial.print(", Standalone Mode: ");
    Serial.print(standaloneMode);
    Serial.print(", LDR1: ");
    Serial.print(valueLDR1);
    Serial.print(", LDR2: ");
    Serial.print(valueLDR2);
    Serial.print(", LDR3: ");
    Serial.print(valueLDR3);
    Serial.print(", LDR4: ");
    Serial.print(valueLDR4);
    Serial.print(", avgT: ");
    Serial.print(avgTop);
    Serial.print(", avgR: ");
    Serial.print(avgRight);
    Serial.print(", avgB: ");
    Serial.print(avgBottom);
    Serial.print(", avgL: ");
    Serial.print(avgLeft);
    Serial.print(", avgSum: ");
    Serial.print(avgSum);
    Serial.print(", ePos: ");
    Serial.print(elevationServoPosition);
    Serial.print(", rPos: ");
    Serial.print(rotationServoPosition);
    Serial.println();
  }
}
