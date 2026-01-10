import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import { resources } from '@/lib/resources';
import ResourceForm from '@/components/admin/ResourceForm';

export default async function EditResourcePage({ params }) {
  const { resource, id } = await params;
  const config = resources[resource];

  if (!config) return notFound();

  const res = await query(`SELECT * FROM ${config.table} WHERE ${config.primaryKey} = $1`, [id]);
  
  if (res.rows.length === 0) return notFound();

  return (
    <ResourceForm 
      resourceKey={resource} 
      config={config} 
      initialData={res.rows[0]} 
    />
  );
}