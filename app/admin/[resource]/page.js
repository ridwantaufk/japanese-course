import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import { resources } from '@/lib/resources';
import ResourceList from '@/components/admin/ResourceList';

export default async function ResourcePage({ params, searchParams }) {
  const { resource } = await params;
  
  // Await searchParams (Next.js 15 requirement)
  const sp = await searchParams;
  
  const config = resources[resource];
  if (!config) return notFound();

  // --- 1. PARSE PARAMETERS ---
  const page = parseInt(sp.page || '1');
  const limitParam = sp.limit || '25';
  const limit = limitParam === 'all' ? null : parseInt(limitParam);
  const offset = limit ? (page - 1) * limit : 0;
  
  const sortCol = sp.sort || config.primaryKey;
  const sortOrder = sp.order === 'asc' ? 'ASC' : 'DESC';
  const search = sp.search || '';

  // --- 2. BUILD QUERY ---
  let queryText = `SELECT * FROM ${config.table}`;
  let countQueryText = `SELECT COUNT(*) FROM ${config.table}`;
  
  const conditions = [];
  const values = [];
  let paramCounter = 1;

  // A. Specific Column Filters
  config.columns.forEach(col => {
    const val = sp[col.key];
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
         // Default to Case-Insensitive partial match for text
         conditions.push(`${col.key}::text ILIKE $${paramCounter}`);
         values.push(`%${val}%`);
         paramCounter++;
      }
    }
  });

  // B. Global Search
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

  // C. Apply WHERE
  if (conditions.length > 0) {
    const whereClause = ` WHERE ${conditions.join(' AND ')}`;
    queryText += whereClause;
    countQueryText += whereClause;
  }

  // D. Order By (Security Check)
  const validCols = [...config.columns.map(c => c.key), config.primaryKey, 'created_at', 'updated_at'];
  const safeSortCol = validCols.includes(sortCol) ? sortCol : config.primaryKey;
  queryText += ` ORDER BY ${safeSortCol} ${sortOrder}`;

  // E. Limit & Offset
  if (limit) {
    queryText += ` LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    values.push(limit, offset);
  }

  // --- 3. EXECUTE ---
  // Count first (exclude limit/offset params)
  const countRes = await query(countQueryText, values.slice(0, paramCounter - 1));
  const total = parseInt(countRes.rows[0].count);
  
  // Data fetch
  const dataRes = await query(queryText, values);

  return (
    <ResourceList 
      resourceKey={resource} 
      config={config} 
      data={dataRes.rows} 
      meta={{
        total,
        page,
        limit: limit || total, // if all, limit is total
        totalPages: limit ? Math.ceil(total / limit) : 1
      }} 
    />
  );
}