# Servidor de Telemetria CubeSat

## Endpoints
| Método | Rota | Função |
|---|---|---|
| POST | `/api/telemetry` | Cubo envia a temperatura (header `x-api-key`) |
| GET | `/api/telemetry` | Últimas 100 leituras |
| GET | `/api/latest` | Última leitura |
| GET | `/` | Painel ao vivo |
| GET | `/health` | Teste de vida |

## Limites de temperatura (ajustáveis por variável de ambiente)
- `< 40 °C` → NORMAL
- `40–59,9 °C` → CUIDADO
- `>= 60 °C` → ALERTA

(Variáveis `T_CUIDADO` e `T_ALERTA`. Para teste com isqueiro, talvez convenha baixar, ex.: 30 e 45.)

## Colocar online (Render, grátis)
1. Crie um repositório no GitHub e suba estes arquivos.
2. Em render.com: **New > Web Service** > conecte o repositório.
3. Build Command: `npm install` | Start Command: `npm start`
4. Em **Environment**, crie `API_KEY` com uma senha sua (e, se quiser, `T_CUIDADO` / `T_ALERTA`).
5. Deploy. O endereço será algo como `https://cubesat-telemetry.onrender.com`.

Obs.: no plano grátis o servidor "dorme" após ~15 min sem uso e leva ~50 s para acordar.
Abra o endereço no navegador antes do teste. As leituras ficam em memória (somem se reiniciar).

## Teste rápido (curl)
```
curl -X POST https://SEU-APP.onrender.com/api/telemetry \
  -H "Content-Type: application/json" -H "x-api-key: SUA_CHAVE" \
  -d '{"device":"cubesat-01","sensor":"temp-01","temperature":65}'
```
Deve responder `"status":"ALERTA"`.

## O que passar para o pessoal do cubo
- URL: `https://SEU-APP.onrender.com/api/telemetry`
- Método: POST, JSON `{"device":"cubesat-01","sensor":"temp-01","temperature": <número °C>}`
- Header: `x-api-key: <chave>`
- Exemplos: `teste_cliente.py` e `teste_esp32.ino`
