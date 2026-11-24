export function urlPublicaFoto(path: string, bucket: "produtos-fotos" | "artesaos-fotos" = "produtos-fotos"): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}
