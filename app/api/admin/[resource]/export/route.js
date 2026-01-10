import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { resources } from '@/lib/resources';
import * as XLSX from 'xlsx';

export async function GET(request, { params }) {
  const { resource } = await params;
  const config = resources[resource];

  if (!config) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') || 'csv';
  const search = searchParams.get('search') || '';

  try {
    // 1. Build Query (Duplicate logic from GET List but NO LIMIT/OFFSET)
    let queryText = `SELECT * FROM ${config.table}`;
    const conditions = [];
    const values = [];
    let paramCounter = 1;

    // Filters
    config.columns.forEach(col => {
      const val = searchParams.get(col.key);
      if (val) {
        if (col.type === 'boolean') {
           conditions.push(`${col.key} = $${paramCounter}`);
           values.push(val === 'true');
           paramCounter++;
        } else if (col.type === 'select' || col.key === 'jlpt_level') {
           conditions.push(`${col.key} = $${paramCounter}`);
           values.push(val);
           paramCounter++;
        } else {
           conditions.push(`${col.key}::text ILIKE $${paramCounter}`);
           values.push(`%${val}%`);
           paramCounter++;
        }
      }
    });

    if (search) {
      const textColumns = config.columns.map(c => c.key);
      if (textColumns.length > 0) {
        const searchConditions = textColumns.map(col => `${col}::text ILIKE $${paramCounter}`).join(' OR ');
        conditions.push(`(${searchConditions})`);
        values.push(`%${search}%`);
        paramCounter++;
      }
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Default Sort
    queryText += ` ORDER BY ${config.primaryKey} DESC`;

    // Fetch ALL Data
    const res = await query(queryText, values);
    const data = res.rows;

    // 2. Generate File
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Export");

    let buffer;
    let contentType;
    let filename;

    if (format === 'xlsx') {
      buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      filename = `${resource}_export_all.xlsx`;
    } else {
      buffer = XLSX.write(workbook, { bookType: 'csv', type: 'buffer' });
      contentType = 'text/csv';
      filename = `${resource}_export_all.csv`;
    }

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Export Error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}