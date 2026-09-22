import test from "node:test";
import assert from "node:assert/strict";
import { parseAutomotiveQuery } from "../lib/search.ts";

test("parses Golf 7 part searches", () => {
  const parsed = parseAutomotiveQuery("faro golf 7 2018");
  assert.equal(parsed.filters.brand, "Volkswagen");
  assert.equal(parsed.filters.model, "Golf");
  assert.equal(parsed.filters.generation, "VII");
  assert.equal(parsed.filters.year, "2018");
  assert.equal(parsed.filters.category, "Iluminación");
});

test("normalizes compact and spaced OEM references", () => {
  assert.equal(parseAutomotiveQuery("5G1941036").filters.oem, "5G1941036");
  assert.equal(parseAutomotiveQuery("5G1 941 036").filters.oem, "5G1941036");
});

test("parses Ibiza engine and motor category", () => {
  const parsed = parseAutomotiveQuery("turbo ibiza 1.6 TDI");
  assert.equal(parsed.filters.brand, "SEAT");
  assert.equal(parsed.filters.model, "Ibiza");
  assert.equal(parsed.filters.engine, "1.6 TDI");
  assert.equal(parsed.filters.category, "Motor");
});

test("recognizes BMW E46 and alternator intent", () => {
  const parsed = parseAutomotiveQuery("BMW E46 alternador");
  assert.equal(parsed.filters.brand, "BMW");
  assert.equal(parsed.filters.model, "Serie 3");
  assert.equal(parsed.filters.generation, "E46");
  assert.equal(parsed.filters.category, "Electrónica");
});
