'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { RoleGuard } from '@/components/auth/role-guard'
import { UserRole } from '@/lib/types/user'
import { User, Check, ChevronsUpDown, Search } from 'lucide-react'
import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useDebounce } from '@/hooks/use-debounce'
import { logger } from '@/lib/logger'
import { cn } from '@/lib/utils'

interface SimpleUser {
  id: string
  name: string
  email: string
}

interface UserSelectorProps {
  onUserChange: (userId: string) => void
  selectedUserId?: string
}

export function UserSelector({ onUserChange, selectedUserId }: UserSelectorProps) {
  const [users, setUsers] = useState<SimpleUser[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { data: session } = useSession()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const currentUserId = selectedUserId || session?.user?.id || ''
  const debouncedSearch = useDebounce(searchQuery, 300)

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users')
        if (response.ok) {
          const data = await response.json()
          setUsers(data)
        }
      } catch (error) {
        logger.error('Error loading users', { error })
      } finally {
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    if (!debouncedSearch) return users
    const query = debouncedSearch.toLowerCase()
    return users.filter(
      (u) => u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query),
    )
  }, [users, debouncedSearch])

  const selectedUser = useMemo(
    () => users.find((u) => u.id === currentUserId),
    [users, currentUserId],
  )

  const handleSelect = useCallback(
    (userId: string) => {
      setOpen(false)
      setSearchQuery('')

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        if (userId === session?.user?.id) {
          url.searchParams.delete('userId')
        } else {
          url.searchParams.set('userId', userId)
        }
        router.push(url.pathname + url.search)
      }

      onUserChange(userId)
    },
    [session?.user?.id, router, onUserChange],
  )

  const displayLabel = loading
    ? 'Chargement...'
    : selectedUser
      ? selectedUser.name
      : session?.user?.name || 'Utilisateur actuel'

  return (
    <RoleGuard requiredRole={UserRole.DEV}>
      <div className="flex items-center space-x-3">
        <div className="text-muted-foreground flex items-center space-x-2 text-sm">
          <User className="h-4 w-4" />
          <span>Projets de :</span>
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={loading}
              className={cn(
                'border-input bg-background ring-offset-background flex h-10 w-72 items-center justify-between rounded-md border px-3 py-2 text-sm',
                'placeholder:text-muted-foreground focus:ring-ring focus:ring-2 focus:ring-offset-2 focus:outline-none',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              <span className="truncate">{displayLabel}</span>
              <ChevronsUpDown className="text-muted-foreground ml-2 h-4 w-4 shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-0" align="start">
            <div className="border-b p-2">
              <div className="flex items-center gap-2 px-1">
                <Search className="text-muted-foreground h-4 w-4 shrink-0" />
                <Input
                  ref={inputRef}
                  placeholder="Rechercher un utilisateur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 border-0 p-0 shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              {filteredUsers.length === 0 ? (
                <div className="text-muted-foreground py-4 text-center text-sm">
                  Aucun utilisateur trouvé
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleSelect(user.id)}
                    className={cn(
                      'hover:bg-accent flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm',
                      user.id === currentUserId && 'bg-accent',
                    )}
                  >
                    <Check
                      className={cn(
                        'h-4 w-4 shrink-0',
                        user.id === currentUserId ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{user.name}</div>
                      <div className="text-muted-foreground truncate text-xs">{user.email}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </RoleGuard>
  )
}
