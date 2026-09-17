import { getBackupJsonAction } from "@/actions";

export const dynamic = "force-dynamic";

/** Direct JSON backup download: GET /api/backup */
export async function GET() {
  const json = await getBackupJsonAction();
  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(json, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="alim-study-backup-${stamp}.json"`,
    },
  });
}
