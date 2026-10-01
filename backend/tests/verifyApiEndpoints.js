/**
 * verifyApiEndpoints.js
 * Prueba de integración de la API REST de CicloMetrics
 */

const assert = require('assert');
const http = require('http');
const app = require('../src/app');
const { defaultStore } = require('../src/storage/jsonStore');

async function runApiIntegrationTests() {
  await defaultStore.init();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}/api`;

  console.log(`\nIniciando pruebas de integración API en ${baseUrl}...\n`);

  try {
    // 1. GET /api/health
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual(healthData.status, 'ok');
    console.log('  [PASS] GET /api/health responde 200 OK');

    // 2. POST /api/profile (guardar usuario y bicicleta)
    const profilePayload = {
      user: {
        nombre: 'Carlos Ciclista',
        email: 'carlos@ciclometrics.com',
        biometria: {
          peso: 76.5,
          altura: 179,
          edad: 32,
          genero: 'masculino'
        }
      },
      bicycle: {
        tipo: 'gravel',
        peso: 10.2,
        rodado: '700c',
        ancho_neumatico: 38,
        psi_min: 35,
        psi_max: 75
      }
    };

    const postProfileRes = await fetch(`${baseUrl}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profilePayload)
    });

    const postProfileData = await postProfileRes.json();
    assert.strictEqual(postProfileRes.status, 200);
    assert.strictEqual(postProfileData.success, true);
    assert(postProfileData.data.user.id, 'Debe devolver un ID de usuario');
    assert(postProfileData.data.bicycle.id, 'Debe devolver un ID de bicicleta');
    console.log('  [PASS] POST /api/profile crea usuario y bicicleta');

    const createdUserId = postProfileData.data.user.id;

    // 3. GET /api/profile/:id
    const getProfileRes = await fetch(`${baseUrl}/profile/${createdUserId}`);
    const getProfileData = await getProfileRes.json();
    assert.strictEqual(getProfileRes.status, 200);
    assert.strictEqual(getProfileData.data.user.email, 'carlos@ciclometrics.com');
    assert.strictEqual(getProfileData.data.bicycle.tipo, 'gravel');
    console.log('  [PASS] GET /api/profile/:id recupera el perfil correctamente');

    // 4. POST /api/routes/calculate utilizando el userId creado
    const routePayload = {
      userId: createdUserId,
      origen: 'Plaza Mayor',
      destino: 'Cerro Alto',
      points: [
        { distance: 0, elevation: 600 },
        { distance: 3000, elevation: 620 },
        { distance: 7000, elevation: 850 }, // subida
        { distance: 10000, elevation: 780 } // bajada
      ],
      saveRoute: true
    };

    const calcRes = await fetch(`${baseUrl}/routes/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(routePayload)
    });

    const calcData = await calcRes.json();
    assert.strictEqual(calcRes.status, 200);
    assert.strictEqual(calcData.success, true);
    assert.strictEqual(calcData.data.distancia_km, 10);
    assert(calcData.data.tiempo_estimado_min > 0, 'ETA debe ser calculado');
    assert(calcData.data.kcal_quemadas > 0, 'kCal debe ser calculada');
    assert(calcData.data.psi_delantero_recomendado > 0, 'PSI delantero recomendado');
    assert(calcData.data.psi_trasero_recomendado > 0, 'PSI trasero recomendado');
    console.log('  [PASS] POST /api/routes/calculate ejecuta análisis físico-mecánico');

    // 5. POST /api/profile con datos erróneos debe fallar con 400
    const invalidProfileRes = await fetch(`${baseUrl}/profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user: {
          nombre: 'A', // nombre muy corto
          email: 'invalido',
          biometria: { peso: -50 } // peso negativo
        },
        bicycle: { peso: 9 }
      })
    });

    assert.strictEqual(invalidProfileRes.status, 400);
    const invalidData = await invalidProfileRes.json();
    assert.strictEqual(invalidData.success, false);
    assert(invalidData.details.length > 0);
    console.log('  [PASS] POST /api/profile valida datos erróneos y responde 400 Bad Request');

    console.log('\nTodas las pruebas de integración API finalizaron con éxito.\n');
  } finally {
    server.close();
  }
}

runApiIntegrationTests().catch((err) => {
  console.error('Fallo en pruebas API:', err);
  process.exit(1);
});
