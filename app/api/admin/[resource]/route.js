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
  
  // Pagination
  const page = parseInt(searchParams.get('page') || '1');
  const limitParam = searchParams.get('limit') || '25';
  const limit = limitParam === 'all' ? null : parseInt(limitParam); // null limit means All in some logic, but usually we need a big number
  const offset = limit ? (page - 1) * limit : 0;

  // Sorting
  const sortCol = searchParams.get('sort') || config.primaryKey;
  const sortOrder = searchParams.get('order') === 'asc' ? 'ASC' : 'DESC';

  // Global Search (Generic)
  const search = searchParams.get('search') || '';

  try {
    let queryText = `SELECT * FROM ${config.table}`;
    let countQueryText = `SELECT COUNT(*) FROM ${config.table}`;
    
    const conditions = [];
    const values = [];
    let paramCounter = 1;

    // 1. Specific Column Filters (Exact or Partial based on config could be better, but generic approach:)
    // We check all query params. If a param matches a column name, we add it to WHERE
    config.columns.forEach(col => {
      const val = searchParams.get(col.key);
      if (val) {
        if (col.type === 'boolean') {
           conditions.push(`${col.key} = $${paramCounter}`);
           values.push(val === 'true');
           paramCounter++;
        } else if (col.type === 'select' || col.key === 'jlpt_level' || col.key === 'category') {
           conditions.push(`${col.key} = $${paramCounter}`);
           values.push(val);
           paramCounter++;
        } else {
           // Default to ILIKE for text fields
           conditions.push(`${col.key}::text ILIKE $${paramCounter}`);
           values.push(`%${val}%`);
           paramCounter++;
        }
      }
    });

    // 2. Global Search (if provided alongside specific filters, we AND it)
    if (search) {
      const textColumns = config.columns
        .filter(c => !['boolean', 'date'].includes(c.type) && c.key !== 'id')
        .map(c => c.key);
      
      if (textColumns.length > 0) {
        const searchConditions = textColumns.map(col => `${col}::text ILIKE $${paramCounter}`).join(' OR ');
        conditions.push(`(${searchConditions})`);
        values.push(`%${search}%`);
        paramCounter++;
      }
    }

    // Construct WHERE clause
    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(' AND ')}`;
      queryText += whereClause;
      countQueryText += whereClause;
    }

    // Order By
    // Security check: ensure sortCol is a valid column to prevent injection
    const validCols = [...config.columns.map(c => c.key), config.primaryKey, 'created_at', 'updated_at'];
    const safeSortCol = validCols.includes(sortCol) ? sortCol : config.primaryKey;
    
    queryText += ` ORDER BY ${safeSortCol} ${sortOrder}`;

    // Limit & Offset
    if (limit) {
      queryText += ` LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
      values.push(limit, offset);
    }

    // Execute
    const countRes = await query(countQueryText, values.slice(0, paramCounter - 1)); // Exclude limit/offset params for count
    const total = parseInt(countRes.rows[0].count);
    const dataRes = await query(queryText, values);

    return NextResponse.json({
      data: dataRes.rows,
      meta: {
        total,
        page,
        limit: limit || total,
        totalPages: limit ? Math.ceil(total / limit) : 1,
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