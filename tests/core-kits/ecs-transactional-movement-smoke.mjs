import assert from "node:assert/strict";
import { test } from "node:test";
import { createHash } from "node:crypto";

// Override only for before/after regression comparisons against exact upstream bytes.
const ecs = await import(process.env.NEXUS_ECS_MODULE ?? "../../src/ecs.js");
const {
  createWorld, createScheduler, createMovementSystem, createCollisionSystem,
  defineComponent, defineResource, defineEvent
} = ecs;

function setup({ count = 1, delta = 1 / 60, policy = {}, frozen = false } = {}) {
  const definitions = {
    Position: defineComponent("TransactionTestPosition"),
    Velocity: defineComponent("TransactionTestVelocity"),
    InputIntent: defineComponent("TransactionTestIntent"),
    MovementStats: defineComponent("TransactionTestMovementStats"),
    Collider: defineComponent("TransactionTestCollider"),
    CollisionEvent: defineEvent("TransactionTestCollision"),
    Time: defineResource("TransactionTestTime"),
    WorldBounds: defineResource("TransactionTestBounds")
  };
  const world = createWorld();
  world.setResource(definitions.Time, { delta });
  const entities = [];
  for (let index = 0; index < count; index += 1) {
    const entity = world.addEntity();
    const position = { x: index * 10, y: 0, z: 5, label: `body:${index}` };
    const velocity = { x: 0, y: 0, units: "m/s" };
    world.setComponent(entity, definitions.Position, frozen ? Object.freeze(position) : position);
    world.setComponent(entity, definitions.Velocity, frozen ? Object.freeze(velocity) : velocity);
    world.setComponent(entity, definitions.InputIntent, { x: 1, y: 0 });
    world.setComponent(entity, definitions.MovementStats, { speed: 6 + index });
    world.setComponent(entity, definitions.Collider, { radius: 0.5 });
    entities.push(entity);
  }
  const movement = createMovementSystem(definitions, policy);
  const scheduler = createScheduler().addSystem("simulate", movement);
  world.clearJournal();
  return { world, definitions, entities, scheduler, movement };
}

function positions(fixture) {
  const { world, definitions, entities } = fixture;
  return entities.map((entity) => ({
    entity,
    position: structuredClone(world.getComponent(entity, definitions.Position)),
    velocity: structuredClone(world.getComponent(entity, definitions.Velocity))
  }));
}

function stateHash(fixture) {
  return createHash("sha256").update(JSON.stringify(positions(fixture))).digest("hex");
}

function runTick(fixture, hooks = {}) {
  // This is the actual upstream ECS scheduler, not a substitute engine.
  // ECS transaction scope is explicit. It does NOT cover host callbacks or engine clocks.
  return fixture.world.atomic(() => fixture.scheduler.run(fixture.world, hooks));
}

test("movement values remain correct at a fixed simulation delta", () => {
  const fixture = setup();
  runTick(fixture);
  const [body] = positions(fixture);
  assert.equal(body.position.x, 0.1);
  assert.equal(body.position.y, 0);
  assert.equal(body.velocity.x, 6);
  assert.equal(body.velocity.y, 0);
});

test("movement replaces values without mutating previously stored references", () => {
  const fixture = setup();
  const { world, definitions, entities: [entity] } = fixture;
  const beforePosition = world.getComponent(entity, definitions.Position);
  const beforeVelocity = world.getComponent(entity, definitions.Velocity);
  runTick(fixture);
  assert.equal(beforePosition.x, 0);
  assert.equal(beforeVelocity.x, 0);
  assert.notStrictEqual(world.getComponent(entity, definitions.Position), beforePosition);
  assert.notStrictEqual(world.getComponent(entity, definitions.Velocity), beforeVelocity);
});

test("movement preserves unrelated component fields", () => {
  const fixture = setup();
  runTick(fixture);
  const [body] = positions(fixture);
  assert.equal(body.position.z, 5);
  assert.equal(body.position.label, "body:0");
  assert.equal(body.velocity.units, "m/s");
});

test("movement can read frozen component snapshots", () => {
  const fixture = setup({ frozen: true });
  assert.doesNotThrow(() => runTick(fixture));
  assert.equal(positions(fixture)[0].position.x, 0.1);
});

test("movement publishes accurate before/after component journal records", () => {
  const fixture = setup();
  let journal;
  runTick(fixture, { onDrain: (result) => { journal = result.journal; } });
  const componentRecords = journal.filter((record) => record.kind === "component");
  assert.equal(componentRecords.length, 2);
  const position = componentRecords.find((record) => record.component.name === fixture.definitions.Position.name);
  const velocity = componentRecords.find((record) => record.component.name === fixture.definitions.Velocity.name);
  assert.equal(position.previous.x, 0);
  assert.equal(position.value.x, 0.1);
  assert.equal(velocity.previous.x, 0);
  assert.equal(velocity.value.x, 6);
  assert.equal(position.action, "set");
});

test("a later resolve-phase failure rolls movement and the journal back", () => {
  const fixture = setup({ count: 3 });
  const before = positions(fixture);
  fixture.scheduler.addSystem("resolve", () => { throw new Error("injected resolve failure"); });
  assert.throws(() => runTick(fixture), /injected resolve failure/);
  assert.deepEqual(positions(fixture), before);
  assert.deepEqual(fixture.world.drainJournal(), []);
});

test("rollback restores the original stored component identities", () => {
  const fixture = setup();
  const { world, definitions, entities: [entity] } = fixture;
  const beforePosition = world.getComponent(entity, definitions.Position);
  const beforeVelocity = world.getComponent(entity, definitions.Velocity);
  const before = positions(fixture);
  assert.throws(() => world.atomic(() => {
    fixture.movement(world);
    throw new Error("abort");
  }), /abort/);
  assert.strictEqual(world.getComponent(entity, definitions.Position), beforePosition);
  assert.strictEqual(world.getComponent(entity, definitions.Velocity), beforeVelocity);
  assert.deepEqual(positions(fixture), before);
});

test("a second-entity policy failure also restores the first entity", () => {
  const fixture = setup({ count: 2, policy: {
    integrate({ entity, position, nextVelocity, time }) {
      if (entity === 2) throw new Error("injected entity failure");
      return { x: position.x + nextVelocity.x * time.delta, y: position.y };
    }
  } });
  const before = positions(fixture);
  assert.throws(() => runTick(fixture), /injected entity failure/);
  assert.deepEqual(positions(fixture), before);
});

test("world bounds still clamp the completed position", () => {
  const fixture = setup();
  fixture.world.setResource(fixture.definitions.WorldBounds,
    { minX: -1, maxX: 0.05, minY: -1, maxY: 1 });
  runTick(fixture);
  assert.equal(positions(fixture)[0].position.x, 0.05);
});

test("zero delta does not advance position", () => {
  const fixture = setup({ delta: 0 });
  runTick(fixture);
  assert.equal(positions(fixture)[0].position.x, 0);
});

test("two independent 600-tick runs have identical per-tick state hashes", () => {
  const left = setup({ count: 4 });
  const right = setup({ count: 4 });
  for (let tick = 0; tick < 600; tick += 1) {
    runTick(left);
    runTick(right);
    assert.equal(stateHash(left), stateHash(right), `tick ${tick}`);
  }
  assert.ok(Math.abs(positions(left)[0].position.x - 60) < 1e-10);
});

test("retry after a failed tick matches an uninterrupted 600-tick run", () => {
  const control = setup({ count: 3 });
  const recovered = setup({ count: 3 });
  let abort = false;
  recovered.scheduler.addSystem("resolve", () => {
    if (abort) throw new Error("retryable tick failure");
  });
  for (let tick = 0; tick < 600; tick += 1) {
    runTick(control);
    if (tick === 300) {
      const before = stateHash(recovered);
      abort = true;
      assert.throws(() => runTick(recovered), /retryable tick failure/);
      assert.equal(stateHash(recovered), before, "failed tick mutated ECS state");
      abort = false;
    }
    runTick(recovered);
    assert.equal(stateHash(recovered), stateHash(control), `tick ${tick}`);
  }
});

test("collision resolution observes replaced transforms on subsequent pairs", () => {
  const fixture = setup({ count: 3 });
  const { world, definitions, entities: [a, b, c] } = fixture;
  world.setComponent(a, definitions.Position, { x: 0, y: 0 });
  world.setComponent(b, definitions.Position, { x: 0.8, y: 0 });
  world.setComponent(c, definitions.Position, { x: -0.8, y: 0 });
  const pairs = [];
  const collision = createCollisionSystem(definitions, {
    resolveCollision({ world, aEntity, bEntity }) {
      pairs.push([aEntity, bEntity]);
      if (aEntity === a && bEntity === b) {
        world.setComponent(a, definitions.Position, { x: 10, y: 0 });
      }
    }
  });
  collision(world);
  assert.deepEqual(pairs, [[a, b]]);
});

test("collision filtering and event publication retain their existing behavior", () => {
  const fixture = setup({ count: 3 });
  const { world, definitions, entities: [a, b, c] } = fixture;
  for (const entity of [a, b, c]) world.setComponent(entity, definitions.Position, { x: 0, y: 0 });
  const collision = createCollisionSystem(definitions, {
    shouldCollide: ({ aEntity, bEntity }) => aEntity === a && bEntity === b
  });
  collision(world);
  assert.deepEqual(world.readEvents(definitions.CollisionEvent), [{ pair: [a, b] }]);
});

test("large pending journals roll back without masking the original exception", () => {
  const world = createWorld();
  const event = defineEvent("LargeJournalRegression");
  const count = 160000;
  for (let index = 0; index < count; index += 1) world.emit(event, index);
  const failure = new Error("original-transaction-failure");
  assert.throws(() => world.atomic(() => {
    world.emit(event, "rolled-back");
    throw failure;
  }), (error) => error === failure);
  assert.equal(world.readEvents(event).length, count);
  const journal = world.drainJournal();
  assert.equal(journal.length, count);
  assert.equal(journal[0].payload, 0);
  assert.equal(journal.at(-1).payload, count - 1);
  assert.equal(journal.at(-1).sequence, count);
  world.emit(event, "after-rollback");
  assert.equal(world.drainJournal()[0].sequence, count + 1);
});

test("collision resolution observes replaced colliders on subsequent pairs", () => {
  const fixture = setup({ count: 3 });
  const { world, definitions, entities: [a, b, c] } = fixture;
  for (const entity of [a, b, c]) world.setComponent(entity, definitions.Collider, { radius: 1 });
  world.setComponent(a, definitions.Position, { x: 0, y: 0 });
  world.setComponent(b, definitions.Position, { x: 1.8, y: 0 });
  world.setComponent(c, definitions.Position, { x: -1.8, y: 0 });
  const pairs = [];
  createCollisionSystem(definitions, {
    resolveCollision({ aEntity, bEntity }) {
      pairs.push([aEntity, bEntity]);
      if (aEntity === a && bEntity === b) world.setComponent(a, definitions.Collider, { radius: 0 });
    }
  })(world);
  assert.deepEqual(pairs, [[a, b]]);
});

test("invalid position conversion cannot partially commit velocity", () => {
  const fixture = setup({ policy: {
    clampPosition() {
      return { x: { valueOf() { throw new Error("invalid-position-number"); } }, y: 0 };
    }
  } });
  const before = positions(fixture);
  assert.throws(() => fixture.movement(fixture.world), /invalid-position-number/);
  assert.deepEqual(positions(fixture), before);
  assert.deepEqual(fixture.world.drainJournal(), []);
});
