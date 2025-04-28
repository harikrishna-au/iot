import React from "react";
import "./styles.css";

const App = () => {
  const arduinoCards = [
    { id: "a1", title: "ultrasonic", code: `#include <WiFi.h>
#include "ThingSpeak.h"

#define SECRET_SSID "YourWiFiSSID"
#define SECRET_PASS "YourWiFiPassword"
#define SECRET_CH_ID 1234567
#define SECRET_WRITE_APIKEY "YOUR_API_KEY"

char ssid[] = SECRET_SSID;
char pass[] = SECRET_PASS;
WiFiClient client;
unsigned long myChannelNumber = SECRET_CH_ID;
const char *myWriteAPIKey = SECRET_WRITE_APIKEY;

#define TRIG_PIN 22
#define ECHO_PIN 23
#define SOUND_VELOCITY 0.034
#define CM_TO_INCH 0.393701

void setup() {
    Serial.begin(115200);
    pinMode(TRIG_PIN, OUTPUT);
    pinMode(ECHO_PIN, INPUT);
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, pass);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
    }
    ThingSpeak.begin(client);
}

void loop() {
    digitalWrite(TRIG_PIN, LOW);
    delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH);
    delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);

    long duration = pulseIn(ECHO_PIN, HIGH);
    float distanceCm = duration * SOUND_VELOCITY / 2;
    float distanceInch = distanceCm * CM_TO_INCH;

    Serial.print("Distance (cm): ");
    Serial.println(distanceCm);
    Serial.print("Distance (inch): ");
    Serial.println(distanceInch);

    if (WiFi.status() != WL_CONNECTED) {
        WiFi.begin(ssid, pass);
        delay(5000);
        return;
    }

    ThingSpeak.setField(1, distanceCm);
    ThingSpeak.setField(2, distanceInch);

    int x = ThingSpeak.writeFields(myChannelNumber, myWriteAPIKey);
    if (x == 200) {
        Serial.println("Channel update successful.");
    } else {
        Serial.print("Problem updating channel. HTTP error code: ");
        Serial.println(x);
    }
    delay(20000);
}` },
    { id: "a2", title: "dht11", code: `#include <WiFi.h>
#include "ThingSpeak.h"
#include "DHT.h"

#define SECRET_SSID "YourWiFiSSID"
#define SECRET_PASS "YourWiFiPassword"
#define SECRET_CH_ID 1234567
#define SECRET_WRITE_APIKEY "YOUR_API_KEY"

char ssid[] = SECRET_SSID;
char pass[] = SECRET_PASS;
WiFiClient client;
unsigned long myChannelNumber = SECRET_CH_ID;
const char *myWriteAPIKey = SECRET_WRITE_APIKEY;

#define DHTPIN 4
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

void setup() {
    Serial.begin(115200);
    dht.begin();
    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, pass);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
    }
    ThingSpeak.begin(client);
}

void loop() {
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    if (isnan(h) || isnan(t)) {
        Serial.println("Failed to read from DHT sensor!");
        delay(2000);
        return;
    }

    Serial.print("Humidity: ");
    Serial.print(h);
    Serial.print(" %\t");
    Serial.print("Temperature: ");
    Serial.println(t);

    if (WiFi.status() != WL_CONNECTED) {
        WiFi.begin(ssid, pass);
        delay(5000);
        return;
    }

    ThingSpeak.setField(1, h);
    ThingSpeak.setField(2, t);

    int x = ThingSpeak.writeFields(myChannelNumber, myWriteAPIKey);
    if (x == 200) {
        Serial.println("Channel update successful.");
    } else {
        Serial.print("Problem updating channel. HTTP error code: ");
        Serial.println(x);
    }
    delay(20000);
}` },
    { id: "a3", title: "RGB web control", code: "..." },
    { id: "a4", title: "4LED WEB", code: `#include <WiFi.h>
#include <WebServer.h>

const char* ssid = "Rajakumar";
const char* password = "KJDC2408";

WebServer server(80);

const int ledPins[] = {13, 12, 14, 25};
const int numLeds = 4;

void setupPins() {
  for (int i = 0; i < numLeds; i++) {
    pinMode(ledPins[i], OUTPUT);
    digitalWrite(ledPins[i], LOW);
  }
}

void handleRoot() {
  String html = "<h1>ESP32 LED Control</h1>";
  for (int i = 0; i < numLeds; i++) {
    html += "LED" + String(ledPins[i]) + ": ";
    html += "<a href=\"/on?pin=" + String(ledPins[i]) + "\"><button>ON</button></a>";
    html += "<a href=\"/off?pin=" + String(ledPins[i]) + "\"><button>OFF</button></a><br><br>";
  }
  server.send(200, "text/html", html);
}

void handleLEDOn() {
  if (server.hasArg("pin")) {
    int pin = server.arg("pin").toInt();
    digitalWrite(pin, HIGH);
    server.send(200, "text/html", "LED" + String(pin) + " is ON.<br><a href=\"/\">Back</a>");
  } else {
    server.send(400, "text/html", "Missing pin argument.<br><a href=\"/\">Back</a>");
  }
}

void handleLEDOff() {
  if (server.hasArg("pin")) {
    int pin = server.arg("pin").toInt();
    digitalWrite(pin, LOW);
    server.send(200, "text/html", "LED" + String(pin) + " is OFF.<br><a href=\"/\">Back</a>");
  } else {
    server.send(400, "text/html", "Missing pin argument.<br><a href=\"/\">Back</a>");
  }
}

void setup() {
  Serial.begin(115200);
  setupPins();

  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected to Wi-Fi.");
  Serial.println(WiFi.localIP());

  server.on("/", handleRoot);
  server.on("/on", handleLEDOn);
  server.on("/off", handleLEDOff);

  server.begin();
  Serial.println("HTTP server started.");
}

void loop() {
  server.handleClient();
}` },
    { id: "a5", title: "soilmoisture", code: `#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>

const char* ssid = "Rajakumar";
const char* password = "KJOC20483";

int sensorPin = 36;
const int redPin = 23;
const int greenPin = 22;
const int bluePin = 21;

AsyncWebServer server(80);

String getMoistureData() {
  int sensorValue = analogRead(sensorPin);
  int moisturePercent = map(sensorValue, 4095, 1000, 0, 100);
  
  String color = "none";
  String status = "unknown";

  if (moisturePercent < 10) {
    color = "red";
    status = "Dry";
    digitalWrite(redPin, HIGH);
    digitalWrite(greenPin, LOW);
    digitalWrite(bluePin, LOW);
  } else if (moisturePercent > 10 && moisturePercent < 50) {
    color = "blue";
    status = "Moderate";
    digitalWrite(redPin, LOW);
    digitalWrite(greenPin, LOW);
    digitalWrite(bluePin, HIGH);
  } else if (moisturePercent >= 50) {
    color = "green";
    status = "Wet";
    digitalWrite(redPin, LOW);
    digitalWrite(greenPin, HIGH);
    digitalWrite(bluePin, LOW);
  }

  String response = "<h1>Soil Moisture: " + String(moisturePercent) + "% (" + status + ")</h1>";
  response += "<div style='width: 100%; height:100px; background-color:" + color + "'></div>";
  
  return response;
}

void setup() {
  pinMode(redPin, OUTPUT);
  pinMode(greenPin, OUTPUT);
  pinMode(bluePin, OUTPUT);

  Serial.begin(115200);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("Connected to WiFi");
  Serial.println(WiFi.localIP());

  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request){
    String html = "<html><head><meta http-equiv='refresh' content='5'></head><body>";
    html += getMoistureData();
    html += "</body></html>";
    request->send(200, "text/html", html);
  });

  server.begin();
}

void loop() {}` },
    { id: "a6", title: "coap-client", code: `#include <WiFi.h>
#include <WiFiUdp.h>
#include <coap-simple.h>
#include <DHT.h>

const char* ssid = "Shruti";
const char* password = "chammu shruthi";
const char* NODEID = "NODE-01";

IPAddress coapServer(192, 168, 0, 101);

WiFiUDP udp;
Coap coapClient(udp);

#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

#define MOISTURE_SENSOR_PIN 34

void callback_response(CoapPacket &packet, IPAddress ip, int port) {
  Serial.println("[CoAP Response Received]");
  char p_packet[packet.payloadlen + 1];
  memcpy(p_packet, packet.payload, packet.payloadlen);
  p_packet[packet.payloadlen] = '\0';
  Serial.println(p_packet);
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi Connected!");
  Serial.println("IP Address: " + WiFi.localIP().toString());
  dht.begin();
  pinMode(MOISTURE_SENSOR_PIN, INPUT);
  coapClient.response(callback_response);
  coapClient.start();
}

void loop() {
  float temperature = dht.readTemperature();
  float humidity = dht.readHumidity();
  int moisture = analogRead(MOISTURE_SENSOR_PIN);

  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }

  String payload = "{";
  payload += "\"id\":\"" + String(NODEID) + "\",";
  payload += "\"temperature\":" + String(temperature) + ",";
  payload += "\"humidity\":" + String(humidity) + ",";
  payload += "\"moisture\":" + String(moisture);
  payload += "}";

  coapClient.send(coapServer, 5683, "sensor", COAP_NONCON, COAP_PUT, NULL, 0, (uint8_t*)payload.c_str(), payload.length());
  Serial.println("Sent CoAP data to the server: " + payload);

  delay(5000);
}` }
  ];

  const piCards = [
  
    { id: "p1", title: "ultrasonic", code: `from flask import Flask, render_template_string
import lgpio
import time
import threading
import atexit

TRIG = 17
ECHO = 27

h = lgpio.gpiochip_open(0)
lgpio.gpio_claim_output(h, TRIG)
lgpio.gpio_claim_input(h, ECHO)

distance_data = []

def measure_distance():
    global distance_data
    while True:
        lgpio.gpio_write(h, TRIG, 1)
        time.sleep(0.00001)
        lgpio.gpio_write(h, TRIG, 0)

        while lgpio.gpio_read(h, ECHO) == 0:
            pulse_start = time.time()

        while lgpio.gpio_read(h, ECHO) == 1:
            pulse_end = time.time()

        pulse_duration = pulse_end - pulse_start
        distance = (pulse_duration * 34300) / 2

        if len(distance_data) >= 20:
            distance_data.pop(0)
        distance_data.append(round(distance, 1))

        time.sleep(1)

app = Flask(_name_)

@app.route('/')
def index():
    return render_template_string('''
    <h1>Ultrasonic Distance Sensor with Chart</h1>
    <canvas id="distanceChart" width="400" height="200"></canvas>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
    async function fetchData() {
        const response = await fetch('/distance');
        const data = await response.json();
        return data;
    }

    async function updateChart(chart) {
        const data = await fetchData();
        chart.data.labels.push(new Date().toLocaleTimeString());
        chart.data.datasets[0].data.push(data.distance);

        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }
        chart.update();
    }

    const ctx = document.getElementById('distanceChart').getContext('2d');
    const distanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Distance (cm)',
                data: [],
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        }
    });

    setInterval(() => updateChart(distanceChart), 1000);
    </script>
    ''')

@app.route('/distance')
def get_distance():
    if distance_data:
        return {'distance': distance_data[-1]}
    return {'distance': 0.0}

def cleanup_gpio():
    lgpio.gpiochip_close(h)

atexit.register(cleanup_gpio)

if _name_ == '_main_':
    threading.Thread(target=measure_distance, daemon=True).start()
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)` },
    { id: "p2", title: "dht11", code: `import time
import board
import adafruit_dht
import requests

sensor = adafruit_dht.DHT11(board.D4)

THINGSPEAK_URL = "https://api.thingspeak.com/update"
API_KEY = "YOUR_API_KEY_HERE"

while True:
    try:
        temperature = sensor.temperature
        humidity = sensor.humidity

        if temperature is not None and humidity is not None:
            print(f"Temperature: {temperature}°C, Humidity: {humidity}%")

            payload = {
                'api_key': API_KEY,
                'field1': temperature,
                'field2': humidity
            }

            response = requests.post(THINGSPEAK_URL, params=payload)

            if response.status_code == 200:
                print("Data sent to ThingSpeak successfully")
            else:
                print(f"Failed to send data. Status code: {response.status_code}")
        time.sleep(15)
    except RuntimeError as error:
        print("Reading error:", error.args[0])
        time.sleep(3)` },
    { id: "p3", title: "servomotar", code: `from flask import Flask, render_template, request
import lgpio

app = Flask(_name_)

servo_pin = 4
h = lgpio.gpiochip_open(0)
lgpio.gpio_claim_output(h, servo_pin)

frequency_hz = 50
min_duty = 2.5
max_duty = 12.5

def set_angle(angle):
    duty_cycle = min_duty + (angle / 180) * (max_duty - min_duty)
    lgpio.tx_pwm(h, servo_pin, frequency_hz, duty_cycle)

@app.route('/')
def index():
    return render_template('servoindex.html')

@app.route('/control', methods=['POST'])
def control():
    try:
        angle = int(request.form['angle'])
        if 0 <= angle <= 180:
            set_angle(angle)
            return f"Servo moved to {angle} degrees"
        else:
            return "Invalid angle! Enter a value between 0 and 180."
    except ValueError:
        return "Invalid input! Please enter a number."

if _name_ == "_main_":
    try:
        app.run(host='0.0.0.0', port=5001, debug=False)
    except KeyboardInterrupt:
        print("Program terminated by user.")
    finally:
        lgpio.tx_pwm(h, servo_pin, frequency_hz, 0)
        lgpio.gpio_free(h, servo_pin)
        lgpio.gpiochip_close(h)` },
    { id: "p4", title: "rgb", code: `from flask import Flask, render_template, request
import lgpio
import signal
import sys

app = Flask(_name_)

RED_PIN, GREEN_PIN, BLUE_PIN = 17, 22, 24

h = lgpio.gpiochip_open(0)
lgpio.gpio_claim_output(h, RED_PIN)
lgpio.gpio_claim_output(h, GREEN_PIN)
lgpio.gpio_claim_output(h, BLUE_PIN)

def set_color(r, g, b):
    lgpio.tx_pwm(h, RED_PIN, 100, r)
    lgpio.tx_pwm(h, GREEN_PIN, 100, g)
    lgpio.tx_pwm(h, BLUE_PIN, 100, b)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/set-color', methods=['POST'])
def set_color_route():
    r, g, b = int(request.form['r']), int(request.form['g']), int(request.form['b'])
    set_color(r, g, b)
    return "OK"

def cleanup(signum, frame):
    print("Cleaning up GPIOs before exit...")
    lgpio.gpiochip_close(h)
    sys.exit(0)

signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)

if _name_ == "_main_":
    try:
        app.run(host="0.0.0.0", port=5000)
    finally:
        cleanup(None, None)` },
    {
      id: "p6", 
      title: "coap-server", 
      code: `import asyncio
from aiocoap import *
from aiocoap.resource import Resource, Site

class CoAPServer(Resource):
    async def render_post(self, request):
        received_data = request.payload.decode()
        print(f"Received data: {received_data}")
        return Message(code=CHANGED, payload=b"Data Received")

async def main():
    root = Site()
    root.add_resource(('sensor',), CoAPServer())
    await Context.create_server_context(root)
    await asyncio.get_running_loop().create_future()

if _name_ == "_main_":
    asyncio.run(main())`
    }
  ];

  const handleCopy = (text) => {
    // Format the code with proper indentation
    const formattedCode = text
      .split('\n')
      .map(line => {
        // Preserve existing indentation
        const indentMatch = line.match(/^(\s+)/);
        const indent = indentMatch ? indentMatch[0] : '';
        return indent + line.trim();
      })
      .join('\n');

    navigator.clipboard.writeText(formattedCode);
  };

  return (
    <div className="container">
      <img 
        src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" 
        alt="Google" 
        className="google-logo"
      />
      <div className="search-box">
        {/* This is just for visual effect */}
      </div>
      <div className="cards-row">
        <div className="pi-group">
          {piCards.map((card) => (
            <span 
              key={card.id}
              className="card"
              onClick={() => handleCopy(card.code)}
            >
              {card.title}
            </span>
          ))}
        </div>
        <div className="arduino-group">
          {arduinoCards.map((card) => (
            <span 
              key={card.id}
              className="card"
              onClick={() => handleCopy(card.code)}
            >
              {card.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;




