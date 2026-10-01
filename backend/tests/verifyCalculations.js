/**
 * verifyCalculations.js
 * Suite de verificación y validación física de los motores de cálculo
 * CicloMetrics Backend (Fase 1).
 */

const assert = require('assert');
const { interpolateElevationProfile } = require('../src/calculators/elevationInterpolator');
const {
  estimateSpeedForGrade,
  getMetForGrade,
  calculateCalories,
  computeRouteEnergyAndETA
} = require('../src/calculators/metCalculator');
const {
  calculateRecommendedTirePressure,
  FRONT_LOAD_RATIO,
  REAR_LOAD_RATIO
} = require('../src/calculators/tirePressureCalculator');
const { analyzeRoute } = require('../src/calculators/routeAnalyzer');
const { validateUser, validateBicycle } = require('../src/models/validators');

let passedTests = 0;
let totalTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  [PASS] ${name}`);
    passedTests++;
  } catch (error) {
    console.error(`  [FAIL] ${name}`);
    console.error(`         Detalle: ${error.message}`);
  }
}

console.log('\n--- 1. Pruebas de Interpolación Altimétrica (RT-02) ---');

test('Rellena valores nulos y NaN intermedios con interpolación lineal continua', () => {
  const rawPoints = [
    { distance: 0, elevation: 100 },
    { distance: 100, elevation: null },
    { distance: 200, elevation: NaN },
    { distance: 300, elevation: 130 }
  ];

  const result = interpolateElevationProfile(rawPoints);
  assert.strictEqual(result.length, 4);
  assert.strictEqual(result[0].elevation, 100);
  assert.strictEqual(result[1].elevation, 110); // 100 + (1/3)*(30) = 110
  assert.strictEqual(result[2].elevation, 120); // 100 + (2/3)*(30) = 120
  assert.strictEqual(result[3].elevation, 130);
  assert.strictEqual(result[1].interpolated, true);
  assert.strictEqual(result[2].interpolated, true);
});

test('Maneja vacíos al inicio y al final de la ruta por propagación de borde', () => {
  const rawPoints = [
    { distance: 0, elevation: null },
    { distance: 100, elevation: 50 },
    { distance: 200, elevation: null }
  ];

  const result = interpolateElevationProfile(rawPoints);
  assert.strictEqual(result[0].elevation, 50);
  assert.strictEqual(result[1].elevation, 50);
  assert.strictEqual(result[2].elevation, 50);
});

console.log('\n--- 2. Pruebas del Motor MET y Gasto Calórico (Ainsworth et al., 2011) ---');

test('MET y velocidades según clasificación de pendientes', () => {
  // Plano (0% a 2%)
  const metPlano = getMetForGrade(1.0);
  const speedPlano = estimateSpeedForGrade(1.0, 'ruta');
  assert(metPlano >= 6.0 && metPlano <= 8.5, `MET plano (${metPlano}) fuera de rango`);
  assert(speedPlano >= 18 && speedPlano <= 26, `Velocidad plana (${speedPlano}) fuera de rango`);

  // Subida moderada (2% a 6%)
  const metSubidaMod = getMetForGrade(4.0);
  const speedSubidaMod = estimateSpeedForGrade(4.0, 'ruta');
  assert(metSubidaMod >= 8.5 && metSubidaMod <= 12.0, `MET subida mod (${metSubidaMod}) fuera de rango [8.5-12.0]`);
  assert(speedSubidaMod < speedPlano, 'Velocidad en subida moderada debe ser menor que en plano');

  // Subida pronunciada (> 6%)
  const metSubidaPron = getMetForGrade(8.0);
  const speedSubidaPron = estimateSpeedForGrade(8.0, 'ruta');
  assert(metSubidaPron >= 12.0 && metSubidaPron <= 16.0, `MET subida pron (${metSubidaPron}) fuera de rango [12.0-16.0]`);
  assert(speedSubidaPron < speedSubidaMod, 'Velocidad en subida empinada debe ser menor que en subida moderada');

  // Bajada (< -2%)
  const metBajada = getMetForGrade(-4.0);
  const speedBajada = estimateSpeedForGrade(-4.0, 'ruta');
  assert(metBajada >= 3.5 && metBajada <= 4.5, `MET bajada (${metBajada}) fuera de rango [3.5-4.5]`);
  assert(speedBajada > speedPlano, 'Velocidad en bajada debe ser mayor que en plano');
});

test('Fórmula de kCal = MET * (peso_usuario + peso_bicicleta) * tiempo_horas', () => {
  const met = 8.0;
  const userWeight = 75; // kg
  const bikeWeight = 10; // kg
  const totalWeight = userWeight + bikeWeight; // 85 kg
  const durationHours = 1.5; // 90 minutos

  const kcal = calculateCalories(met, totalWeight, durationHours);
  const expectedKcal = 8.0 * 85 * 1.5; // 1020 kCal
  assert.strictEqual(kcal, expectedKcal);
});

console.log('\n--- 3. Pruebas de Presión de Neumáticos (Schwalbe / Frank Berto) ---');

test('Distribución de carga 40% delantera y 60% trasera', () => {
  const result = calculateRecommendedTirePressure({
    userWeightKg: 75,
    bikeWeightKg: 10,
    tireWidthMm: 28,
    bikeType: 'ruta'
  });

  assert.strictEqual(FRONT_LOAD_RATIO, 0.40);
  assert.strictEqual(REAR_LOAD_RATIO, 0.60);
  assert.strictEqual(result.distribution.totalWeightKg, 85);
  assert.strictEqual(result.distribution.frontLoadKg, 34); // 85 * 0.40
  assert.strictEqual(result.distribution.rearLoadKg, 51);  // 85 * 0.60

  // La rueda trasera tiene más peso, por lo tanto requiere mayor presión
  assert(result.recommendation.rear.psi > result.recommendation.front.psi,
    'La presión trasera debe ser mayor que la delantera');
});

test('Respeto estricto a los límites psi_min y psi_max', () => {
  // Caso de usuario muy liviano con psi_min elevado
  const resultMin = calculateRecommendedTirePressure({
    userWeightKg: 35,
    bikeWeightKg: 5,
    tireWidthMm: 45,
    psiMin: 40,
    psiMax: 65
  });
  assert(resultMin.recommendation.front.psi >= 40, 'No debe bajar del psi_min');

  // Caso de carga muy pesada con psi_max limitado
  const resultMax = calculateRecommendedTirePressure({
    userWeightKg: 140,
    bikeWeightKg: 20,
    tireWidthMm: 23,
    psiMin: 60,
    psiMax: 90
  });
  assert(resultMax.recommendation.rear.psi <= 90, 'No debe superar el psi_max');
});

console.log('\n--- 4. Pruebas de Validación Estricta de Entradas (RT-03) ---');

test('Rechaza biometría con pesos negativos o absurdos', () => {
  const invalidUserNegative = validateUser({
    nombre: 'Juan',
    email: 'juan@test.com',
    biometria: { peso: -70, altura: 175, edad: 30 }
  });
  assert.strictEqual(invalidUserNegative.isValid, false);
  assert(invalidUserNegative.errors.some(e => e.includes('peso')));

  const invalidUserOverweight = validateUser({
    nombre: 'Juan',
    email: 'juan@test.com',
    biometria: { peso: 500, altura: 175, edad: 30 }
  });
  assert.strictEqual(invalidUserOverweight.isValid, false);
});

test('Rechaza bicicleta con especificaciones incoherentes (psi_max <= psi_min)', () => {
  const invalidBike = validateBicycle({
    tipo: 'ruta',
    peso: 9,
    rodado: '700c',
    ancho_neumatico: 25,
    psi_min: 100,
    psi_max: 80 // Error: max menor que min
  });
  assert.strictEqual(invalidBike.isValid, false);
});

console.log('\n--- 5. Pruebas Integradas de Route Analyzer ---');

test('Ejecuta análisis integral de ruta con elevación, MET, ETA y presiones', () => {
  const routePoints = [
    { distance: 0, elevation: 50 },
    { distance: 2000, elevation: 50 },   // Plano: 2 km
    { distance: 4000, elevation: 130 },  // Subida 4%: 2 km (+80m)
    { distance: 6000, elevation: 190 },  // Subida 3%: 2 km (+60m)
    { distance: 8000, elevation: 110 }   // Bajada -4%: 2 km (-80m)
  ];

  const analysis = analyzeRoute({
    points: routePoints,
    user: { biometria: { peso: 75, altura: 178, edad: 28, genero: 'masculino' } },
    bicycle: { tipo: 'ruta', peso: 9, rodado: '700c', ancho_neumatico: 28, psi_min: 60, psi_max: 110 },
    origen: 'Campus Universitario',
    destino: 'Mirador de la Sierra'
  });

  assert.strictEqual(analysis.distancia_km, 8);
  assert(analysis.desnivel_positivo_m >= 139 && analysis.desnivel_positivo_m <= 141, `D+ (${analysis.desnivel_positivo_m}) incorrecto`);
  assert(analysis.desnivel_negativo_m >= 79 && analysis.desnivel_negativo_m <= 81, `D- (${analysis.desnivel_negativo_m}) incorrecto`);
  assert(analysis.tiempo_estimado_min > 0, 'ETA debe ser positivo');
  assert(analysis.kcal_quemadas > 0, 'kCal debe ser positivo');
  assert(analysis.psi_delantero_recomendado > 0, 'PSI delantero requerido');
  assert(analysis.psi_trasero_recomendado >= analysis.psi_delantero_recomendado, 'PSI trasero >= delantero');
  assert(analysis.desglose_tramos.flat.distanceKm > 0, 'Debe haber tramo plano');
  assert(analysis.desglose_tramos.moderateClimb.distanceKm > 0, 'Debe haber tramo subida moderada');
  assert(analysis.desglose_tramos.downhill.distanceKm > 0, 'Debe haber tramo bajada');
});

console.log(`\n========================================`);
console.log(` Resultado: ${passedTests} de ${totalTests} pruebas superadas.`);
console.log(`========================================\n`);

if (passedTests !== totalTests) {
  process.exit(1);
}
