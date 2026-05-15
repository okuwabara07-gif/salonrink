import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const format = req.nextUrl.searchParams.get('format') === 'json' ? 'json' : 'csv';

  const [customersRes, reservationsRes] = await Promise.all([
    supabase.from('customers').select('*').eq('salon_id', user.id),
    supabase.from('reservations').select('*').eq('salon_id', user.id),
  ]);

  if (customersRes.error) console.error('customers query:', customersRes.error);
  if (reservationsRes.error) console.error('reservations query:', reservationsRes.error);

  const payload = {
    exported_at: new Date().toISOString(),
    salon_id: user.id,
    customers: customersRes.data ?? [],
    reservations: reservationsRes.data ?? [],
  };

  if (format === 'json') {
    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': 'attachment; filename="export.json"',
      },
    });
  }

  const toCSV = (rows: Record<string, unknown>[]): string => {
    if (!rows.length) return '';
    const headers = Object.keys(rows[0]);
    const escape = (v: unknown) =>
      `"${String(v ?? '').replace(/"/g, '""').replace(/\r?\n/g, ' ')}"`;
    const lines = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => escape(r[h])).join(',')),
    ];
    return lines.join('\n');
  };

  const csv =
    `# customers (${payload.customers.length} rows)\n` +
    toCSV(payload.customers) +
    `\n\n# reservations (${payload.reservations.length} rows)\n` +
    toCSV(payload.reservations);

  // BOM 付与で Excel での文字化け回避
  return new NextResponse('\uFEFF' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="export.csv"',
    },
  });
}
