import React from 'react'

export const AdminUser = () => {
  return (
    <div className="flex flex-col gap-10 pt-10 ">
      <div className="flex flex-row px-4 sm:px-8 md:px-12 lg:px-20 ">
        <h1 className="font-mono text-2xl">Manage user</h1>
      </div>

      <div className="overflow-y-auto pb-10">
          <table className="w-full border-collapse ">
              <thead>
                <tr className="text-left border theme-border-2">
                    <th className="py-2 pr-4">User</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Last active</th>
                    <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
          </table>
        </div>
    </div>
  )
}
