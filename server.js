const express = require("express");
const path = require("path");
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // painel + logo

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

app.listen(PORT, () => console.log(`Servidor na porta ${PORT} | cuidado>=${T_CUIDADO}°C alerta>=${T_ALERTA}°C`));
