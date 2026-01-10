import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { resources } from '@/lib/resources';

export async function GET(request, { params }) {
  const { resource, id } = await params;
  const config = resources[resource];

  if (!config) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  }

  try {
    const queryText = `SELECT * FROM ${config.table} WHERE ${config.primaryKey} = $1`;
    const res = await query(queryText, [id]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const { resource, id } = await params;
  const config = resources[resource];

  if (!config) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    
    // Filter body to only include allowed fields
    const allowedFields = config.fields.map(f => f.key);
    const updates = [];
    const values = [];
    let counter = 1;

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${counter}`);
        values.push(body[field]);
        counter++;
      }
    });

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No valid fields provided' }, { status: 400 });
    }

    values.push(id);
    const queryText = `UPDATE ${config.table} SET ${updates.join(', ')} WHERE ${config.primaryKey} = $${counter} RETURNING *`;
    
    const res = await query(queryText, values);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json(res.rows[0]);

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const { resource, id } = await params;
  const config = resources[resource];

  if (!config) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
  }

  try {
    const queryText = `DELETE FROM ${config.table} WHERE ${config.primaryKey} = $1 RETURNING ${config.primaryKey}`;
    const res = await query(queryText, [id]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });

  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}