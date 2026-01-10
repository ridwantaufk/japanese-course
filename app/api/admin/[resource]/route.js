import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { resources } from '@/lib/resources';

export async function GET(request, { params }) {
  const { resource } = await params;
  const config = resources[resource];

  if (!config) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;
  const search = searchParams.get('search') || '';

  try {
    let queryText = `SELECT * FROM ${config.table}`;
    let countQueryText = `SELECT COUNT(*) FROM ${config.table}`;
    const queryParams = [];

    // Basic search implementation
    if (search) {
      // Find text columns to search
      const textColumns = config.columns
        .map(c => c.key) // Naive approach: search in displayed columns
        .filter(key => !['id', 'created_at'].includes(key)); // Exclude non-text likely cols
      
      if (textColumns.length > 0) {
        const conditions = textColumns.map((col, idx) => `${col}::text ILIKE $1`).join(' OR ');
        queryText += ` WHERE ${conditions}`;
        countQueryText += ` WHERE ${conditions}`;
        queryParams.push(`%${search}%`);
      }
    }

    queryText += ` ORDER BY ${config.primaryKey} DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    
    const countRes = await query(countQueryText, queryParams.slice(0, 1)); // Only search param for count
    const total = parseInt(countRes.rows[0].count);

    const dataRes = await query(queryText, [...queryParams, limit, offset]);

    return NextResponse.json({
      data: dataRes.rows,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const { resource } = await params;
  const config = resources[resource];

  if (!config) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    
    // Filter body to only include allowed fields
    const allowedFields = config.fields.map(f => f.key);
    const data = {};
    const keys = [];
    const values = [];
    const placeholders = [];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        data[field] = body[field];
        keys.push(field);
        values.push(body[field]);
        placeholders.push(`$${keys.length}`);
      }
    });

    if (keys.length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
    }

    const queryText = `INSERT INTO ${config.table} (${keys.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
    const res = await query(queryText, values);

    return NextResponse.json(res.rows[0], { status: 201 });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}