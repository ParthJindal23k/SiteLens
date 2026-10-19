import { PricingTable } from '@clerk/nextjs'
import React from 'react'

function Pricing() {
  return (
    <div className="mx-auto max-w-5xl px-4 mt-16">
      <h2 className="text-center font-bold text-3xl mb-3">
        Upgrade to Sitelens Pro
      </h2>
      <p className="text-center text-neutral-500 mb-12">
        Unlock advanced analytics, higher limits, and priority support
      </p>
        
      <PricingTable />
    </div>
  );
}

export default Pricing