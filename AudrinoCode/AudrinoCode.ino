// include servo library
#include <Servo.h>
// // create servo object and give it a name
//  declare variables for pins
const int servoRotationPin = 13;
const int servoElevationPin = 12;
Servo servoRotation;
Servo servoElevation;
// WEB SERVER-----------------------
const int pinLDR1 = A0;
const int pinLDR2 = A1;
const int pinLDR3 = A2;
const int pinLDR4 = A3;
const int pinSolar = A4;
const int pinBattery = A5;
const int pinServerToggle = 11;

signed char solarValue;
signed char eDiff;
signed char rDiff;
int threshold;

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
int baseAvgSum = 0;
// bool recording;
// const int numValuesToRecord = 10;
// int recorded[numValuesToRecord];
// int remainingNumValues = numValuesToRecord;

// variables for measuring solar panel
int solarReading;
float solarVoltage;

// timing
int timeElapsedInDarkness; // ms
const int interval = 1000; // ms. Used for all time dependent fns so be careful when changing.
int currTime;
long lastRecordTime;
// const int recordingDuration = 10000; // 10 seconds
// const int recordEvery = recordingDuration / numValuesToRecord;

bool serverModeToggled;
const int internalDelta = 2;

bool serverStarting = false;
bool standaloneMode = true;

void setup()
{
  // WEB SERVER---------------------------
  Serial.begin(115200);

  // MAIN---------------

  servoRotation.attach(servoRotationPin);
  servoElevation.attach(servoElevationPin);

  servoRotation.write(rotationServoPosition);
  servoElevation.write(elevationServoPosition);
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
  // Serial.print("Testing...");

  // wait for 10s to get the base avg Sum
  // Serial.println("Looping. BaseAvgSum: ");
  if (baseAvgSum == 0)
  {
    baseAvgSum = getMin();
    // Serial.print(baseAvgSum);
  }

  if (standaloneMode == 0)
  {
    // server.handleClient();
  }
  trackerLogic();

  const bool serverModeToggled = digitalRead(pinServerToggle) == HIGH; // need this to useEffect
  if (serverModeToggled && standaloneMode)
  {
    standaloneMode = false;
    initialiseServer();
  }
  else if (!serverModeToggled && !standaloneMode)
  {
    standaloneMode = true;
    // if (status == WL_CONNECTED)
    // {
    // server.close();
    // Serial.println();
    Serial.print("Closing server...");
    // }
  }

  delay(interval);
}

void handlePollingData()
{
  Serial.println("Received /data request");

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

int getAverageSum()
{
  updateAvgTRBL();
  avgSum = (avgTop + avgRight + avgBottom + avgLeft) / 4;
  return avgSum;
}
int updateAvgTRBL()
{
  valueLDR1 = analogRead(pinLDR1); // aligned with top, right, bottom, left.
  valueLDR2 = analogRead(pinLDR2);
  valueLDR3 = analogRead(pinLDR3);
  valueLDR4 = analogRead(pinLDR4);

  avgTop = valueLDR1;
  avgRight = valueLDR2;
  avgBottom = valueLDR3;
  avgLeft = valueLDR4;
}
void trackerLogic()
{
  String eAction = "";
  String rAction = "";

  updateAvgTRBL();

  // //offset
  // avgSum = (valueLDR1 + valueLDR2 + valueLDR3 + valueLDR4) / 4;

  eDiff = avgTop - avgBottom;
  rDiff = avgRight - avgLeft;

  threshold = getThreshold(baseAvgSum);

  if (abs(eDiff) > threshold)
  {
    if (eDiff > 0 && elevationServoPosition < 180)
    {
      // if (elevationServoPosition >= 180){
      //   elevationServoPosition =0;
      //   servoElevation.write(0);
      // }else{
      elevationServoPosition = elevationServoPosition + internalDelta;

      eAction = "Up";
      // }
    }
    else if (eDiff < 0 && elevationServoPosition > 0)
    {
      // if (elevationServoPosition <= 0){
      //   elevationServoPosition =180;
      //   servoElevation.write(180);
      // }
      elevationServoPosition = elevationServoPosition - internalDelta;

      eAction = "Down";
    }
    servoElevation.write(elevationServoPosition);
  }

  if (abs(rDiff) > threshold)
  {
    if (rDiff > 0)
    {

      // check flip condition
      if (rotationServoPosition + internalDelta > 180)
      {
        Serial.print("!MOVING ROUND R");
        //   servoRotation.write(0);
        //   rotationServoPosition = internalDelta;

        // rotate elevation servos on flip condition
        if (elevationServoPosition < 90)
        {
          // elevationServoPosition = (90 - elevationServoPosition);
          Serial.print("!MOVING ROUND E");
        }
        else if (elevationServoPosition > 90)
        {
          // elevationServoPosition = (90 - elevationServoPosition);
          Serial.print("!MOVING ROUND E");
        }
      }
      else
      {
        // no flip needed
        rotationServoPosition = rotationServoPosition + internalDelta;
      }

      rAction = "Left";
    }
    else if (rDiff < 0)
    {

      // check flip condition
      if (rotationServoPosition - internalDelta < 0)
      {
        Serial.print("!MOVING ROUND R");
        //   servoRotation.write(0);
        //   rotationServoPosition = 90 - internalDelta;

        // rotate elevation servos on flip condition
        if (elevationServoPosition < 90)
        {
          // elevationServoPosition = (90 - elevationServoPosition);
          Serial.print("!MOVING ROUND E");
        }
        else if (elevationServoPosition > 90)
        {
          // elevationServoPosition = (90 - elevationServoPosition);
          Serial.print("!MOVING ROUND E");
        }
      }
      else
      {
        rotationServoPosition = rotationServoPosition - internalDelta;
      }
      rAction = "Right";
    }

    servoRotation.write(rotationServoPosition);
  }
  // else
  // {
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
  Serial.print(", baseAvgSum: ");
  Serial.print(baseAvgSum);
  Serial.print(", ePos: ");
  Serial.print(elevationServoPosition);
  Serial.print(", rPos: ");
  Serial.print(rotationServoPosition);
  Serial.println();
  // }
}

float getThreshold(int baseAvgSum)
{
  const float thresholdValue = (baseAvgSum * 0.8) + 10;
  return thresholdValue;
}
int getMin()
{
  int array[4] = {valueLDR1, valueLDR2, valueLDR3, valueLDR4};
  int minIndex = 0;
  int min = array[minIndex];
  for (int i = 1; i < 4; i++)
  {
    if (array[i] < min)
    { // What Rob wrote
      minIndex = i;
      min = array[i];
    }
  }
  return minIndex;
}
