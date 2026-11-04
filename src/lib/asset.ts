/** Prefixes a public asset path with the configured base path (only set for the static preview build). */
export const asset = (path: string) => `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
