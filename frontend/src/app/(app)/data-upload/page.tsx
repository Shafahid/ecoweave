import { Metadata } from 'next';
import DataUploadClient from '@/components/app/data-upload/DataUploadClient';

export const metadata: Metadata = {
  title: 'Data Upload – EcoWeave',
  description: 'Upload and manage batch data',
};

export default function DataUploadPage() {
  return <DataUploadClient />;
}
