import { Metadata } from 'next';
import BatchDetailsClient from '@/components/app/batches/BatchDetailsClient';

interface PageProps {
  params: Promise<{ batchId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { batchId } = await params;
  return {
    title: `Batch ${batchId} – EcoWeave`,
    description: `Detailed compliance analysis for batch ${batchId}`,
  };
}

export default async function BatchDetailPage({ params }: PageProps) {
  const { batchId } = await params;
  return <BatchDetailsClient batchId={batchId} />;
}
