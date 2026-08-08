export const dynamic = "force-dynamic";

export async function POST() {
  return Response.json(
    { error: "Старый генератор кейсов отключён. Используйте новую CMS по адресу /admin." },
    { status: 410 },
  );
}
