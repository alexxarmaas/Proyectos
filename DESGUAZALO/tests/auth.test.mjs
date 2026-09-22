import test from "node:test";
import assert from "node:assert/strict";
import { authErrorMessage, safeInternalPath } from "../lib/auth.ts";

test("safeInternalPath only accepts local application paths", () => {
  assert.equal(safeInternalPath("/publicar"), "/publicar");
  assert.equal(safeInternalPath("/marketplace?q=faro"), "/marketplace?q=faro");
  assert.equal(safeInternalPath("//evil.example"), "/cuenta/anuncios");
  assert.equal(safeInternalPath("https://evil.example"), "/cuenta/anuncios");
  assert.equal(safeInternalPath(null, "/"), "/");
});

test("auth errors are translated to human Spanish copy", () => {
  assert.equal(authErrorMessage({ code: "invalid_credentials", message: "Invalid login credentials" }), "El email o la contraseña no son correctos.");
  assert.equal(authErrorMessage({ code: "email_not_confirmed", message: "Email not confirmed" }), "Confirma tu email antes de entrar. Revisa también la carpeta de spam.");
  assert.equal(authErrorMessage({ code: "same_password", message: "New password should be different" }), "La nueva contraseña debe ser distinta de la actual.");
  assert.equal(authErrorMessage({ code: "over_email_send_rate_limit", message: "Email rate limit exceeded" }), "Has hecho demasiados intentos seguidos. Espera un poco antes de volver a probar.");
});
