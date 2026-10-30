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
    // 1. GET /api/health y validación del entrypoint Serverless de Vercel
    const vercelHandler = require('../../api/index.js');
    assert.strictEqual(typeof vercelHandler, 'function', 'El entrypoint api/index.js debe exportar una función Serverless');
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assert.strictEqual(healthRes.status, 200);
    assert.strictEqual(healthData.status, 'ok');
    assert(healthData.storage && healthData.storage.engine, 'GET /api/health debe reportar el motor de almacenamiento activo');
    console.log(`  [PASS] GET /api/health responde 200 OK (Motor activo: ${healthData.storage.engine})`);

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

    // 6. POST /api/auth/register (validación de contraseña débil y falta de aceptación de términos)
    const testEmail = `testuser_${Date.now()}@ciclometrics.cl`;

    const weakRegisterRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Usuario Prueba',
        email: testEmail,
        password: 'securePass123', // Falta carácter especial
        confirmPassword: 'securePass123',
        acceptedTerms: true,
        biometria: { peso: 72, altura: 175, edad: 28, genero: 'masculino', nivel: 'intermedio' }
      })
    });
    assert.strictEqual(weakRegisterRes.status, 400);

    const noTermsRegisterRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Usuario Prueba',
        email: testEmail,
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptedTerms: false,
        biometria: { peso: 72, altura: 175, edad: 28, genero: 'masculino', nivel: 'intermedio' }
      })
    });
    assert.strictEqual(noTermsRegisterRes.status, 400);
    console.log('  [PASS] POST /api/auth/register exige contraseña robusta (8+, Mayús, Minús, Núm, Especial) y aceptación de términos');

    // 6.1 POST /api/auth/register (registro de usuario nuevo válido)
    const registerRes = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: 'Usuario Prueba',
        email: testEmail,
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptedTerms: true,
        biometria: {
          peso: 72,
          altura: 175,
          edad: 28,
          genero: 'masculino',
          nivel: 'intermedio'
        }
      })
    });
    const registerData = await registerRes.json();
    assert.strictEqual(registerRes.status, 201);
    assert.strictEqual(registerData.success, true);
    assert(registerData.data.token, 'Debe devolver un token de sesión');
    assert.strictEqual(registerData.data.user.email, testEmail);
    assert.strictEqual(registerData.data.user.acceptedTerms, true);
    console.log('  [PASS] POST /api/auth/register registra nuevo usuario y retorna token');

    // 6.2 Verificación de seguridad criptográfica: la contraseña no debe estar en texto plano
    const registeredUserInStore = await defaultStore.findById('users', registerData.data.user.id);
    assert(registeredUserInStore.password, 'El usuario en la base de datos debe tener password');
    assert.notStrictEqual(registeredUserInStore.password, 'SecurePass123!', 'La contraseña NUNCA debe guardarse en texto plano');
    assert(registeredUserInStore.password.includes(':'), 'La contraseña debe almacenarse en formato criptográfico <salt>:<hash>');
    console.log('  [PASS] Contraseñas protegidas con salt y hash criptográfico en la persistencia');

    // 7. POST /api/auth/login con credenciales erróneas -> 401
    const badLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'wrongPassword'
      })
    });
    assert.strictEqual(badLoginRes.status, 401);
    console.log('  [PASS] POST /api/auth/login rechaza credenciales incorrectas (401)');

    // 7.1 POST /api/auth/reset-password valida email inexistente (404) y password débil (400)
    const resetNotFoundRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'inexistente@correo.com',
        newPassword: 'NuevaPassword123!'
      })
    });
    assert.strictEqual(resetNotFoundRes.status, 404);

    const resetBadPassRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        newPassword: 'sin_mayuscula_ni_num' // Inválida según política
      })
    });
    assert.strictEqual(resetBadPassRes.status, 400);

    // 7.2 POST /api/auth/reset-password restablece contraseña de usuario existente
    const resetSuccessRes = await fetch(`${baseUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        newPassword: 'NewSecurePassword456!',
        confirmPassword: 'NewSecurePassword456!'
      })
    });
    const resetSuccessData = await resetSuccessRes.json();
    assert.strictEqual(resetSuccessRes.status, 200);
    assert.strictEqual(resetSuccessData.success, true);

    // Verificar que el login con contraseña antigua falle (401)
    const oldLoginCheck = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'SecurePass123!'
      })
    });
    assert.strictEqual(oldLoginCheck.status, 401);

    // Verificar que el login con nueva contraseña funcione (200)
    const newLoginCheck = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'NewSecurePassword456!'
      })
    });
    assert.strictEqual(newLoginCheck.status, 200);
    console.log('  [PASS] POST /api/auth/reset-password restablece contraseña y valida nuevo acceso');

    // 8. POST /api/auth/login con usuario preconfigurado Ricardo Henríquez
    const ricardoLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'ricardo@ciclometrics.cl',
        password: 'password123'
      })
    });
    const ricardoLoginData = await ricardoLoginRes.json();
    assert.strictEqual(ricardoLoginRes.status, 200);
    assert.strictEqual(ricardoLoginData.success, true);
    assert.strictEqual(ricardoLoginData.data.user.id, 'user-ricardo-1');
    assert.strictEqual(ricardoLoginData.data.user.nombre, 'Ricardo Henríquez');
    assert.strictEqual(ricardoLoginData.data.user.biometria.peso, 75);
    const ricardoToken = ricardoLoginData.data.token;
    console.log('  [PASS] POST /api/auth/login autentica a Ricardo Henríquez');

    // 9. GET /api/auth/me usando token de autorización
    const meRes = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${ricardoToken}` }
    });
    const meData = await meRes.json();
    assert.strictEqual(meRes.status, 200);
    assert.strictEqual(meData.data.id, 'user-ricardo-1');
    assert.strictEqual(meData.data.email, 'ricardo@ciclometrics.cl');
    console.log('  [PASS] GET /api/auth/me resuelve usuario actual con Bearer token');

    // 10. GET /api/bicycles filtrado por userId
    const bikesRes = await fetch(`${baseUrl}/bicycles?userId=user-ricardo-1`);
    const bikesData = await bikesRes.json();
    assert.strictEqual(bikesRes.status, 200);
    assert.strictEqual(bikesData.success, true);
    assert(bikesData.data.length >= 1, 'Ricardo debe tener al menos 1 bicicleta asociada');
    const ricardoBike = bikesData.data.find((b) => b.id === 'bike-ricardo-1' || b.nombre.includes('Aro 29'));
    assert(ricardoBike, 'Debe existir la bicicleta preconfigurada Aro 29');
    console.log('  [PASS] GET /api/bicycles?userId=... devuelve las bicicletas del usuario');

    // 11. POST /api/bicycles (crear nueva bicicleta para Ricardo)
    const newBikeRes = await fetch(`${baseUrl}/bicycles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ricardoToken}`
      },
      body: JSON.stringify({
        nombre: 'Gravel de Competición',
        tipo: 'gravel',
        peso: 9.2,
        rodado: '700c',
        ancho_neumatico: 40,
        psi_min: 35,
        psi_max: 65,
        userId: 'user-ricardo-1'
      })
    });
    const newBikeData = await newBikeRes.json();
    assert.strictEqual(newBikeRes.status, 201);
    assert.strictEqual(newBikeData.success, true);
    assert.strictEqual(newBikeData.data.nombre, 'Gravel de Competición');
    const createdBikeId = newBikeData.data.id;
    console.log('  [PASS] POST /api/bicycles registra una nueva bicicleta');

    // 12. DELETE /api/bicycles/:id (eliminar bicicleta recién creada)
    const deleteBikeRes = await fetch(`${baseUrl}/bicycles/${createdBikeId}`, {
      method: 'DELETE'
    });
    const deleteBikeData = await deleteBikeRes.json();
    assert.strictEqual(deleteBikeRes.status, 200);
    assert.strictEqual(deleteBikeData.success, true);
    console.log('  [PASS] DELETE /api/bicycles/:id elimina la bicicleta especificada');

    console.log('\nTodas las pruebas de integración API finalizaron con éxito.\n');
  } finally {
    server.close();
  }
}

runApiIntegrationTests().catch((err) => {
  console.error('Fallo en pruebas API:', err);
  process.exit(1);
});
