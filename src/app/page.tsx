import React from 'react';
import { getHtmlFileContent } from '../lib/readHtmlFile';

export default function HomePage() {
  const htmlContent = getHtmlFileContent();

  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}
