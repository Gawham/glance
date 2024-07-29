// CalloutUsageExample.tsx
import React from 'react';
import { Callout } from '@tremor/react';

interface CalloutUsageExampleProps {
  firmName: string;
  companyQuery: string;
}

export function CalloutUsageExample({ firmName, companyQuery }: CalloutUsageExampleProps) {
  return (
    <div style={{ height: '250px', transform: 'scale(1.1)', transformOrigin: 'center' }}>
      <Callout
        className="mx-auto max-w-lg h-full flex items-center justify-center"
        title="The Glance"
        color="cyan"
      >
        <p style={{ fontSize: '1.2em' }}>{companyQuery}</p>
      </Callout>
    </div>
  );
}
