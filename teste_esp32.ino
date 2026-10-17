// Exemplo ESP32 (Arduino IDE). Troque WiFi, SERVER e API_KEY.
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

const char* WIFI_SSID = "SUA_REDE";
const char* WIFI_PASS = "SUA_SENHA";
const char* URL = "https://SEU-APP.onrender.com/api/telemetry";
const char* API_KEY = "cubesat-teste-123";

float lerTemperatura() { return 25.0; }  // TROCAR pela leitura real do sensor

void setup() {
  Serial.begin(115200);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
}

void loop() {
  WiFiClientSecure client; client.setInsecure();   // ok para teste
  HTTPClient http;
  http.begin(client, URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", API_KEY);
  String body = "{\"device\":\"cubesat-01\",\"sensor\":\"temp-01\",\"temperature\":" + String(lerTemperatura()) + "}";
  int code = http.POST(body);
  Serial.println(code); Serial.println(http.getString());
  http.end();
  delay(2000);
}
