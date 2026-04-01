import { Metadata } from 'next';
import BatchPrintClient from '@/components/app/batches/BatchPrintClient';

interface PageProps {
  params: Promise<{ batchId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { batchId } = await params;
  return {
    title: `Evidence Report – ${batchId} – EcoWeave`,
    description: `Printable evidence report for batch ${batchId}.`,
  };
}

export default async function BatchPrintPage({ params }: PageProps) {
  const { batchId } = await params;
  return <BatchPrintClient batchId={batchId} />;
}
