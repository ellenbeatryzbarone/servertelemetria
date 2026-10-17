const express = require("express");
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_KEY || "cubesat-teste-123";   // troque no Render!
const T_CUIDADO = Number(process.env.T_CUIDADO || 40);         // °C
const T_ALERTA = Number(process.env.T_ALERTA || 60);           // °C
const MAX = 500;
const readings = [];
let nextId = 1;

const classify = (t) => (t >= T_ALERTA ? "ALERTA" : t >= T_CUIDADO ? "CUIDADO" : "NORMAL");

app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type, x-api-key");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// O cubo envia aqui
app.post("/api/telemetry", (req, res) => {
  if (req.get("x-api-key") !== API_KEY) return res.status(401).json({ error: "API key inválida" });
  const { temperature, sensor = "temp-01", device = "cubesat" } = req.body || {};
  const t = Number(temperature);
  if (!Number.isFinite(t)) return res.status(400).json({ error: "'temperature' numérico é obrigatório" });

  const r = {
    id: nextId++,
    device: String(device).slice(0, 40),
    sensor: String(sensor).slice(0, 40),
    temperature: t,
    status: classify(t),
    receivedAt: new Date().toISOString(),
  };
  readings.push(r);
  if (readings.length > MAX) readings.shift();
  console.log(`[${r.status}] ${r.device}/${r.sensor}: ${t} °C`);
  res.status(201).json(r);
});

app.get("/api/telemetry", (req, res) => res.json(readings.slice(-100).reverse()));
app.get("/api/latest", (req, res) => res.json(readings[readings.length - 1] || null));
app.get("/api/config", (req, res) => res.json({ T_CUIDADO, T_ALERTA }));
app.get("/health", (req, res) => res.send("ok"));

// Painel simples para o pessoal acompanhar ao vivo
app.get("/", (req, res) => res.type("html").send(`<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Telemetria CubeSat</title>
<style>
body{font-family:system-ui,sans-serif;max-width:720px;margin:2rem auto;padding:0 1rem}
#big{font-size:2.5rem;padding:1.2rem;border-radius:12px;text-align:center;color:#fff;background:#888}
.NORMAL{background:#2e9e4f!important}.CUIDADO{background:#e0a100!important}.ALERTA{background:#d32f2f!important}
table{width:100%;border-collapse:collapse;margin-top:1rem}td,th{padding:.4rem;border-bottom:1px solid #ccc;text-align:left}
</style></head><body>
<h1>Telemetria CubeSat</h1>
<div id="big">Aguardando dados...</div>
<table><thead><tr><th>Hora</th><th>Dispositivo</th><th>Sensor</th><th>Temp</th><th>Status</th></tr></thead><tbody id="rows"></tbody></table>
<script>
async function load(){
  try{
    const d = await (await fetch("/api/telemetry")).json();
    if(!d.length) return;
    const big = document.getElementById("big");
    big.textContent = d[0].temperature.toFixed(1)+" °C — "+d[0].status;
    big.className = d[0].status;
    const tb = document.getElementById("rows"); tb.innerHTML="";
    d.slice(0,20).forEach(r=>{
      const tr=document.createElement("tr");
      [new Date(r.receivedAt).toLocaleTimeString(),r.device,r.sensor,r.temperature+" °C",r.status]
        .forEach(v=>{const td=document.createElement("td");td.textContent=v;tr.appendChild(td)});
      tb.appendChild(tr);
    });
  }catch(e){}
}
load(); setInterval(load,2000);
</script></body></html>`));

app.listen(PORT, () => console.log(`Servidor na porta ${PORT} | cuidado>=${T_CUIDADO}°C alerta>=${T_ALERTA}°C`));
