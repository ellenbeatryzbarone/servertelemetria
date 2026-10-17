"""Cliente de teste para o pessoal do cubo. pip install requests"""
import requests, time

SERVER = "https://SEU-APP.onrender.com"   # endereço do servidor
API_KEY = "cubesat-teste-123"             # a chave combinada

def ler_sensor():
    # TROCAR pela leitura real do sensor do cubo
    return 25.0

while True:
    temp = ler_sensor()
    r = requests.post(f"{SERVER}/api/telemetry",
                      json={"device": "cubesat-01", "sensor": "temp-01", "temperature": temp},
                      headers={"x-api-key": API_KEY}, timeout=15)
    print(r.status_code, r.json())
    time.sleep(2)
