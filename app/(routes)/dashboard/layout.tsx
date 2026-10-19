import React from 'react'
import Dashboardprovider from './provider'

function Dashboardlayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Dashboardprovider>
        {children}
      </Dashboardprovider>
    </div>
  )
}

export default Dashboardlayout