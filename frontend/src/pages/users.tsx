import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userApi } from '@/api/users'
import { roleApi } from '@/api/roles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Search, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// --- TİP TANIMLARI ---
interface Role {
  _id: string
  role_name: string
}

interface User {
  _id: string
  first_name: string
  last_name: string
  email: string
  is_active: boolean
  created_at: string
  roles: Role[]
}

const userSchema = z.object({
  first_name: z.string().min(2, 'Ad en az 2 karakter olmalıdır'),
  last_name: z.string().min(2, 'Soyad en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir email adresi giriniz'),
  password: z.string().optional(),
  roleId: z.string().min(1, 'Rol seçimi zorunludur'),
  isActive: z.boolean().default(true),
})

type UserFormData = z.infer<typeof userSchema>

export default function UsersPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [searchEmail, setSearchEmail] = useState('')
  const [searchName, setSearchName] = useState('')
  const [filterActive, setFilterActive] = useState<string>('')
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      isActive: true,
    },
  })

  // Kullanıcıları Getir
  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['users', { page, searchEmail, searchName, filterActive }],
    queryFn: () =>
      userApi.getUsers({
        page,
        limit: 10,
        email: searchEmail || undefined,
        first_name: searchName || undefined,
        is_active: filterActive ? filterActive === 'true' : undefined,
      }),
  })

  const users: User[] = Array.isArray(usersResponse?.data) 
    ? usersResponse.data 
    : (usersResponse?.data?.data || [])

  // Rolleri Getir
  const { data: rolesResponse } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleApi.getRoles({ limit: 100 }),
  })

  const roles: Role[] = Array.isArray(rolesResponse?.data)
    ? rolesResponse.data
    : (rolesResponse?.data?.data || [])

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => userApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Kullanıcı oluşturuldu')
      handleCloseDialog()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Kullanıcı oluşturulamadı')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      userApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Kullanıcı güncellendi')
      handleCloseDialog()
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Güncelleme hatası')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Kullanıcı silindi')
      setDeletingUser(null)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error?.message || 'Silme hatası')
    },
  })

  const onSubmit = (data: UserFormData) => {
    // Temel verileri hazırla
    const submitData: any = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      roles: [data.roleId] // Backend array bekliyor
    }

    // Şifre varsa ekle
    if (data.password && data.password.length >= 6) {
      submitData.password = data.password
    }

    if (editingUser) {
      // Güncelleme işleminde is_active gönderiyoruz
      submitData.is_active = data.isActive; 
      updateMutation.mutate({ id: editingUser._id, data: submitData })
    } else {
      // Yeni kayıtta şifre zorunlu
      if (!data.password) {
        toast.error("Yeni kullanıcı için şifre zorunludur")
        return
      }
      submitData.password = data.password
      createMutation.mutate(submitData)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setValue('first_name', user.first_name)
    setValue('last_name', user.last_name)
    setValue('email', user.email)
    setValue('isActive', user.is_active) // Backend is_active -> Form isActive
    
    // Rol seçimini ayarla (İlk rolü seçili yap)
    if (user.roles && user.roles.length > 0) {
      setValue('roleId', user.roles[0]._id) 
    }
    setValue('password', '') // Şifre alanını temizle
  }

  const handleCloseDialog = () => {
    setIsCreateOpen(false)
    setEditingUser(null)
    reset()
  }

  const clearFilters = () => {
    setSearchEmail('')
    setSearchName('')
    setFilterActive('')
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground mt-2">
            Kullanıcıları görüntüleyin, ekleyin ve düzenleyin
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Kullanıcı
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label>İsim</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="İsim ara..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Email ara..."
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Durum</Label>
              <div className="flex gap-2">
                <Select value={filterActive} onValueChange={setFilterActive}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tümü" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Aktif</SelectItem>
                    <SelectItem value="false">Pasif</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Kullanıcılar ({usersResponse?.pagination?.total || 0})
          </CardTitle>
          <CardDescription>
            Sistemdeki tüm kullanıcıların listesi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roller</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Oluşturulma</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                    Kullanıcı bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <Badge key={role._id} variant="outline">
                              {role.role_name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('tr-TR') : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeletingUser(user)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {usersResponse?.pagination && usersResponse.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Sayfa {usersResponse.pagination.page} / {usersResponse.pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= usersResponse.pagination.totalPages}
                >
                  Sonraki
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || !!editingUser} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}
            </DialogTitle>
            <DialogDescription>
              {editingUser
                ? 'Kullanıcı bilgilerini güncelleyin'
                : 'Yeni bir kullanıcı oluşturun'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Ad *</Label>
                <Input id="first_name" {...register('first_name')} />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Soyad *</Label>
                <Input id="last_name" {...register('last_name')} />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                Şifre {editingUser ? '(Boş bırakılırsa değişmez)' : '*'}
              </Label>
              <Input
                id="password"
                type="password"
                placeholder={editingUser ? '••••••' : 'Şifre giriniz'}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roleId">Rol *</Label>
              <Select
                value={watch('roleId')}
                onValueChange={(value) => setValue('roleId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Rol seçiniz" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role._id} value={role._id}>
                      {role.role_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.roleId && (
                <p className="text-sm text-destructive">{errors.roleId.message}</p>
              )}
            </div>

            {/* Checkbox sadece düzenleme modunda görünür */}
            {editingUser && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register('isActive')}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Aktif
                </Label>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                İptal
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingUser ? 'Güncelle' : 'Oluştur'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingUser}
        onOpenChange={() => setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullanıcıyı sil?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletingUser?.first_name} {deletingUser?.last_name}</strong> adlı kullanıcıyı silmek
              istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingUser && deleteMutation.mutate(deletingUser._id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}