import React, { Suspense } from 'react'
import AddWebsiteClient from './AddWebsiteClient'

export default function Page() {
  return (
    <Suspense fallback={<div className="text-sm text-muted-foreground">Loading...</div>}>
      <AddWebsiteClient />
    </Suspense>
  )
}
