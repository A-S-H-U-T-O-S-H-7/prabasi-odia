import AdminUsersPage from '@/components/admin/users/Users'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Joined Members | Prabasi Odia Admin',
}

function page() {
  return (
    <div>
      <AdminUsersPage/>
    </div>
  )
}

export default page
