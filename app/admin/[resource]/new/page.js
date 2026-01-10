import { notFound } from 'next/navigation';
import { resources } from '@/lib/resources';
import ResourceForm from '@/components/admin/ResourceForm';

export default async function NewResourcePage({ params }) {
  const { resource } = await params;
  const config = resources[resource];

  if (!config) return notFound();

  return (
    <ResourceForm resourceKey={resource} config={config} />
  );
}