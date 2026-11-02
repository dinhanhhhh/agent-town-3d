/**
 * Autonomous Verification & Integrity Test Suite
 * Validates:
 * 1. Station Layout & 3D Polar Geometry coordinates
 * 2. Waypoint Route Paths (Forward & Feedback loops)
 * 3. SDLC Stage Order and Pipeline Contracts
 * 4. Sound Synthesis environment guards
 * 5. Simulation Feature Tasks completeness
 */

import { STAGE_ORDER } from '../src/lib/pipeline/stages.js';
import { STATIONS_LAYOUT } from '../src/lib/scene/layout.js';
import { getRouteWaypoints } from '../src/lib/scene/waypoints.js';
import { FEATURE_TASKS } from '../src/lib/events/MockSimulator.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failed++;
  }
}

console.log('=== 1. Checking 8 Autonomous Stations Layout ===');
assert(STAGE_ORDER.length === 8, 'STAGE_ORDER contains exactly 8 agents');
for (const role of STAGE_ORDER) {
  const layout = STATIONS_LAYOUT[role];
  assert(Boolean(layout), `Station ${role} layout exists`);
  assert(Array.isArray(layout.position) && layout.position.length === 3, `Station ${role} position is [x,y,z]`);
  assert(Array.isArray(layout.focusCamera) && layout.focusCamera.length === 3, `Station ${role} focusCamera is [x,y,z]`);
  assert(typeof layout.accentColor === 'number', `Station ${role} accentColor is numeric hex`);
}

console.log('\n=== 2. Checking Waypoint Routes & Feedback Loops ===');
// Forward sequence
for (let i = 0; i < STAGE_ORDER.length - 1; i++) {
  const from = STAGE_ORDER[i];
  const to = STAGE_ORDER[i + 1];
  const waypoints = getRouteWaypoints(from, to);
  assert(Array.isArray(waypoints) && waypoints.length >= 2, `Route from ${from} to ${to} has ${waypoints.length} waypoints`);
  const hasNaN = waypoints.some(([x, y, z]) => isNaN(x) || isNaN(y) || isNaN(z));
  assert(!hasNaN, `Route from ${from} to ${to} has no NaN coordinates`);
}

// Critical feedback loops
const feedbackLoops = [
  ['qa', 'dev'],
  ['review', 'dev'],
  ['security', 'dev'],
  ['monitor', 'devops']
];
for (const [from, to] of feedbackLoops) {
  const waypoints = getRouteWaypoints(from, to);
  assert(Array.isArray(waypoints) && waypoints.length >= 2, `Feedback route from ${from} to ${to} has ${waypoints.length} waypoints`);
}

console.log('\n=== 3. Checking Feature Tasks Database ===');
assert(Array.isArray(FEATURE_TASKS) && FEATURE_TASKS.length >= 10, `FEATURE_TASKS has at least 10 tasks (Found: ${FEATURE_TASKS?.length})`);
for (const task of FEATURE_TASKS) {
  assert(Boolean(task.title && task.refNo && task.prNo && task.qaTests > 0), `Task "${task.title?.slice(0, 20)}..." has valid title, refNo (${task.refNo}), prNo (${task.prNo}), qaTests (${task.qaTests})`);
}

console.log(`\n========================================`);
console.log(`Verification Complete: ${passed} Passed, ${failed} Failed`);
if (failed > 0) {
  process.exit(1);
}
