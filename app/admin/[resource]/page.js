import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import { resources } from '@/lib/resources';
import ResourceList from '@/components/admin/ResourceList';

export default async function ResourcePage({ params, searchParams }) {
  const { resource } = await params;
  const { page = '1', search = '' } = await searchParams;
  
  const config = resources[resource];
  if (!config) return notFound();

  const limit = 10;
  const offset = (parseInt(page) - 1) * limit;

  // Build query
  let queryText = `SELECT * FROM ${config.table}`;
  let countQueryText = `SELECT COUNT(*) FROM ${config.table}`;
  const queryParams = [];

  if (search) {
    const textColumns = config.columns
      .map(c => c.key)
      .filter(key => !['id', 'created_at'].includes(key));
    
    if (textColumns.length > 0) {
      const conditions = textColumns.map((col, idx) => `${col}::text ILIKE $1`).join(' OR ');
      queryText += ` WHERE ${conditions}`;
      countQueryText += ` WHERE ${conditions}`;
      queryParams.push(`%${search}%`);
    }
  }

  queryText += ` ORDER BY ${config.primaryKey} DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
  
  // Execute queries
  // Note: In a real app, use the API route or a shared service function. 
  // Here we query DB directly in Server Component for efficiency.
  
  const countRes = await query(countQueryText, queryParams.slice(0, 1));
  const total = parseInt(countRes.rows[0].count);
  
  const dataRes = await query(queryText, [...queryParams, limit, offset]);

  return (
    <ResourceList 
      resourceKey={resource} 
      config={config} 
      data={dataRes.rows} 
      meta={{
        total,
        page: parseInt(page),
        limit,
        totalPages: Math.ceil(total / limit)
      }} 
    />
  );
}