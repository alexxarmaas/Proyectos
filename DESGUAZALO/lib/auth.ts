export function safeInternalPath(value: string | null | undefined, fallback = "/cuenta/anuncios") {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}

export function authErrorMessage(error: { message?: string; code?: string } | null | undefined, fallback = "No hemos podido completar la operación. Inténtalo de nuevo.") {
  if (!error) return fallback;

  const code = (error.code ?? "").toLowerCase();
  const message = (error.message ?? "").toLowerCase();

  if (code === "invalid_credentials" || message.includes("invalid login credentials")) {
    return "El email o la contraseña no son correctos.";
  }
  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "Confirma tu email antes de entrar. Revisa también la carpeta de spam.";
  }
  if (code === "user_already_exists" || message.includes("user already registered") || message.includes("already been registered")) {
    return "Ya existe una cuenta con ese email.";
  }
  if (code === "weak_password" || message.includes("password should be") || message.includes("password is too weak")) {
    return "La contraseña no cumple los requisitos de seguridad. Usa al menos 8 caracteres y evita contraseñas fáciles de adivinar.";
  }
  if (code === "same_password" || message.includes("new password should be different") || message.includes("same password")) {
    return "La nueva contraseña debe ser distinta de la actual.";
  }
  if (code.includes("rate_limit") || message.includes("rate limit") || message.includes("email rate limit exceeded")) {
    return "Has hecho demasiados intentos seguidos. Espera un poco antes de volver a probar.";
  }
  if (code === "reauthentication_needed" || message.includes("reauthentication")) {
    return "Por seguridad necesitamos que vuelvas a identificarte antes de cambiar la contraseña.";
  }
  if (message.includes("expired") || message.includes("otp_expired")) {
    return "El enlace ha caducado. Solicita uno nuevo.";
  }
  if (message.includes("network") || message.includes("fetch")) {
    return "No hemos podido conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo.";
  }

  return fallback;
}
