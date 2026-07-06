const SUPABASE_OBJECT_RE =
  /^(https:\/\/[^/]+\.supabase\.co)\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/

const IMAGE_RATIOS: Record<string, number> = {
  'd07255eb-5c5a-45b2-969c-96f369298252.jpg': 4 / 5,
  '450b86c7-8b9f-49a7-b6c6-4729e87ac3a3.jpg': 4 / 5,
  '2e95e61b-ca1e-49cf-b0b8-f4a7012642bf.jpg': 4 / 5,
  '73abfe2a-0a50-4e97-be66-227a4b773633.jpg': 4 / 5,
  'c75499de-85e5-4304-8a8a-21a48e455e98.jpg': 4 / 5,
  '5cda7f3d-f056-48dc-a236-311d710e1492.jpg': 4 / 3,
  '6a62315b-ed50-4c69-85ca-e37df9a2e9a6.jpg': 4 / 3,
  'dc4cb67b-f731-4234-bd59-c7e22f543761.jpg': 4 / 3,
  'ad08f486-15d5-4d7a-b759-67760e13426d.jpg': 4 / 5,
  '21f6cd3e-8f4b-43d0-bbac-e3f424bd0f13.jpg': 4 / 5,
  '753877b3-541f-4b5f-a46c-865b5e70ea5d.jpg': 4 / 5,
  'fe8037bf-3728-4f59-9423-bc2376c235dc.jpg': 4 / 5,
  '4123d47d-f550-423a-bf69-06b29b60353f.jpg': 4 / 5,
  'c0941604-5260-45c3-92e4-45629c020354.jpg': 4 / 5,
}

export function supabaseRenderUrl(src: string, width: number, quality = 92): string {
  const match = src.match(SUPABASE_OBJECT_RE)
  if (!match) return src
  const [, origin, bucket, path] = match
  const filename = path.split('/').pop() ?? ''
  const ratio = IMAGE_RATIOS[filename]
  if (!ratio) return src
  const height = Math.round(width / ratio)
  return `${origin}/storage/v1/render/image/public/${bucket}/${encodeURI(path)}?width=${width}&height=${height}&quality=${quality}&resize=contain`
}

export function supabaseSrcSet(src: string, widths: number[], quality = 92): string | undefined {
  const match = src.match(SUPABASE_OBJECT_RE)
  const filename = match?.[3].split('/').pop() ?? ''
  if (!match || !IMAGE_RATIOS[filename]) return undefined
  return widths.map((width) => `${supabaseRenderUrl(src, width, quality)} ${width}w`).join(', ')
}
