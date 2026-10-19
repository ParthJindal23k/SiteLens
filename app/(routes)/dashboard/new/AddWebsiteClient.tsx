"use client"

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import React from 'react'
import WebsiteForm from './_components/WebsiteForm'
import InstallScript from './_components/InstallScript'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function AddWebsiteClient() {
  const searchParams = useSearchParams()
  const step = searchParams.get("step") ?? "form"

  return (
    <div className="flex items-center w-full justify-center mt-10">
      <div className="max-w-lg flex flex-col items-start w-full">
        <Link href="/dashboard">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Dashboard
          </Button>
        </Link>

        <div className="mt-10 w-full">
          {step === "form" && <WebsiteForm />}
          {step === "script" && <InstallScript />}
        </div>
      </div>
    </div>
  )
}
