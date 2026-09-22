export const legalIdentity = {
  name: process.env.NEXT_PUBLIC_LEGAL_NAME?.trim() || "",
  nif: process.env.NEXT_PUBLIC_LEGAL_NIF?.trim() || "",
  address: process.env.NEXT_PUBLIC_LEGAL_ADDRESS?.trim() || "",
  email: process.env.NEXT_PUBLIC_LEGAL_EMAIL?.trim() || "",
};

export const legalIdentityComplete = Boolean(
  legalIdentity.name && legalIdentity.nif && legalIdentity.address && legalIdentity.email
);

export const legalUpdatedAt = "22 de septiembre de 2026";
