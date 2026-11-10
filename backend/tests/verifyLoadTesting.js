/**
 * CicloMetrics Web - Benchmark & Load Testing Suite (Hito 3 / Seminario / Proyecto de Título)
 * Ejecuta pruebas de cargabilidad y estrés concurrente contra el servidor backend
 * para evaluar latencias (p50, p95, p99), tiempos de respuesta, tasa de error y RPS.
 */

const http = require('http');
const express = require('express');
const cors = require('cors');

// Importar rutas y middlewares del backend
const apiRoutes = require('../src/routes/apiRoutes');

async function runLoadTests() {
  console.log('================================================================');
  console.log('  CicloMetrics Web - Batería de Pruebas de Cargabilidad y Estrés');
  console.log('  Evaluación de Latencia, Rendimiento y Concurrencia (IL 3.2)');
  console.log('================================================================\n');

  // Inicializar servidor de pruebas temporal
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api', apiRoutes);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  const results = [];

  function makeRequest(method, path, body = null) {
    return new Promise((resolve) => {
      const start = process.hrtime.bigint();
      const payload = body ? JSON.stringify(body) : null;
      const parsedUrl = new URL(`${baseUrl}${path}`);

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port,
        path: parsedUrl.pathname + parsedUrl.search,
        method: method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (payload) {
        options.headers['Content-Length'] = Buffer.byteLength(payload);
      }

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => { data += chunk; });
        res.on('end', () => {
          const end = process.hrtime.bigint();
          const latencyMs = Number(end - start) / 1e6;
          resolve({
            status: res.statusCode,
            latencyMs,
            success: res.statusCode >= 200 && res.statusCode < 400
          });
        });
      });

      req.on('error', (err) => {
        const end = process.hrtime.bigint();
        const latencyMs = Number(end - start) / 1e6;
        resolve({
          status: 500,
          latencyMs,
          success: false,
          error: err.message
        });
      });

      if (payload) {
        req.write(payload);
      }
      req.end();
    });
  }

  async function executeBatch(name, method, path, body, totalRequests, concurrency) {
    process.stdout.write(`Ejecutando prueba: ${name} [${totalRequests} reqs, concurrencia: ${concurrency}]... `);
    const latencies = [];
    let successCount = 0;
    let failureCount = 0;
    const testStart = Date.now();

    let completed = 0;
    let active = 0;
    let sent = 0;

    await new Promise((resolve) => {
      function next() {
        if (completed === totalRequests) {
          return resolve();
        }

        while (active < concurrency && sent < totalRequests) {
          sent++;
          active++;
          makeRequest(method, path, body).then((res) => {
            active--;
            completed++;
            latencies.push(res.latencyMs);
            if (res.success) successCount++;
            else failureCount++;
            next();
          });
        }
      }
      next();
    });

    const totalTimeSec = (Date.now() - testStart) / 1000;
    latencies.sort((a, b) => a - b);

    const min = latencies[0].toFixed(2);
    const max = latencies[latencies.length - 1].toFixed(2);
    const avg = (latencies.reduce((sum, v) => sum + v, 0) / latencies.length).toFixed(2);
    const p50 = latencies[Math.floor(latencies.length * 0.50)].toFixed(2);
    const p95 = latencies[Math.floor(latencies.length * 0.95)].toFixed(2);
    const p99 = latencies[Math.floor(latencies.length * 0.99)].toFixed(2);
    const rps = (totalRequests / totalTimeSec).toFixed(1);
    const errorRate = ((failureCount / totalRequests) * 100).toFixed(2);

    console.log('LISTO');
    console.log(`  -> Requests: ${totalRequests} | Duración: ${totalTimeSec.toFixed(2)}s | Throughput: ${rps} req/s`);
    console.log(`  -> Latencia (ms): Avg=${avg}ms | Min=${min}ms | Max=${max}ms | p50=${p50}ms | p95=${p95}ms | p99=${p99}ms`);
    console.log(`  -> Éxito: ${successCount}/${totalRequests} (${(100 - errorRate)}%) | Errores: ${failureCount} (${errorRate}%)\n`);

    results.push({
      name,
      totalRequests,
      concurrency,
      rps,
      avg,
      min,
      max,
      p50,
      p95,
      p99,
      errorRate
    });
  }

  // 1. Cargabilidad en Endpoint Liviano (Health Check)
  await executeBatch('1. GET /api/health (Baseline de Rendimiento)', 'GET', '/health', null, 500, 25);

  // 2. Cargabilidad en Endpoint de Autenticación / Registro / Consulta
  await executeBatch('2. GET /api/bicycles (Lectura de Garaje con Cache)', 'GET', '/bicycles', null, 300, 20);

  // 3. Cargabilidad en Motor Analítico Intensivo (Cálculo Físico-Altimétrico)
  const sampleRoutePayload = {
    userProfile: {
      peso: 72.5,
      altura: 176,
      edad: 28,
      nivel: 'intermedio'
    },
    bicycle: {
      peso: 9.8,
      rodado: '700c',
      ancho_neumatico: 32,
      psi_min: 50,
      psi_max: 85
    },
    points: [
      { lat: -33.435, lng: -70.625 },
      { lat: -33.428, lng: -70.620 },
      { lat: -33.420, lng: -70.615 },
      { lat: -33.415, lng: -70.610 }
    ]
  };

  await executeBatch('3. POST /api/routes/calculate (Motor Físico-Altimétrico Gaussiano)', 'POST', '/routes/calculate', sampleRoutePayload, 150, 15);

  // 4. Estrés de Concurrencia Extrema en Motor Físico (Pico de Carga)
  await executeBatch('4. POST /api/routes/calculate (Pico de Concurrencia - 30 clientes)', 'POST', '/routes/calculate', sampleRoutePayload, 200, 30);

  server.close();

  console.log('================================================================');
  console.log('  RESUMEN TABULAR DE MÉTRICAS DE CARGABILIDAD (FORMATO APA 7)');
  console.log('================================================================');
  console.log('| Endpoint Evaluado | Reqs | Concurrencia | RPS | Latencia Media | p95 | p99 | Tasa Error |');
  console.log('| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |');
  results.forEach(r => {
    console.log(`| ${r.name.padEnd(20, ' ')} | ${r.totalRequests} | ${r.concurrency} | ${r.rps} req/s | ${r.avg} ms | ${r.p95} ms | ${r.p99} ms | ${r.errorRate}% |`);
  });
  console.log('================================================================\n');

  return results;
}

runLoadTests().catch(err => {
  console.error('Error durante las pruebas de carga:', err);
  process.exit(1);
});
