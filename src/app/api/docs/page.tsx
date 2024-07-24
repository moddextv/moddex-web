import { getApiDocs } from '@/misc/Swagger';
import 'swagger-ui-react/swagger-ui.css';
import './docs.css';
import SwaggerUI from 'swagger-ui-react';

export default async function SwaggerDocsPage() {
  const spec = await getApiDocs();

  return <SwaggerUI spec={spec} />;
}
