import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API Testing - Assessify',
  description: 'Enterprise API Testing Workspace',
};

export default function ApiTestingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
