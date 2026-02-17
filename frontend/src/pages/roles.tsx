import { useState, useEffect } from 'react' // useEffect eklendi
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Shield } from 'lucide-react'
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
import { Separator } from '@/components/ui/separator'

// --- TİP TANIMLARI ---
interface Role {
  _id: string
  role_name: string
  is_active: boolean
  created_at: string
}

const roleSchema = z.object({
  role_name: z.string().min(2, 'Rol adı en az 2 karakter olmalıdır'),
  permissions: z.array(z.string()).min(1, 'En az bir yetki seçilmelidir'),
  is_active: z.boolean().default(true),
})

type RoleFormData = z.infer<typeof roleSchema>

export default function RolesPage() {
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [deletingRole, setDeletingRole] = useState<Role | null>(null)
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])

  // Mevcut sistem yetkilerini çek
  const { data: systemPermissionsData } = useQuery({
    queryKey: ['system-permissions'],
    queryFn: () => roleApi.getPermissions(),
  })

  // Backend'den gelen yetki listesini formatla
  const AVAILABLE_PERMISSIONS = (systemPermissionsData?.privileges || []).map((p: any) => ({
      value: p.key,
      label: p.name,
      category: p.group || "Diğer"
  }));

  const groupedPermissions = AVAILABLE_PERMISSIONS.reduce((acc: any, perm: any) => {
    if (!acc[perm.category]) {
      acc[perm.category] = []
    }
    acc[perm.category].push(perm)
    return acc
  }, {} as Record<string, typeof AVAILABLE_PERMISSIONS>)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      is_active: true,
      permissions: [],
    },
  })

  // --- KRİTİK DÜZELTME: State değişince formu güncelle ---
  // Biz checkbox'ları manuel yönetiyoruz, bu yüzden react-hook-form'a 
  // "bak permissions alanı değişti" dememiz lazım.
  useEffect(() => {
    setValue('permissions', selectedPermissions, { 
      shouldValidate: true, // Validasyonu tetikle (hata varsa silsin)
      shouldDirty: true 
    })
  }, [selectedPermissions, setValue])

  // Fetch roles
  const { data: rolesData, isLoading } = useQuery({
    queryKey: ['roles', { page }],
    queryFn: () => roleApi.getRoles({ page, limit: 10 }),
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: any) => roleApi.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Rol başarıyla oluşturuldu')
      handleCloseDialog()
    },
    onError: () => {
      toast.error('Rol oluşturulurken bir hata oluştu')
    },
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      roleApi.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Rol başarıyla güncellendi')
      handleCloseDialog()
    },
    onError: () => {
      toast.error('Rol güncellenirken bir hata oluştu')
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => roleApi.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] })
      toast.success('Rol başarıyla silindi')
      setDeletingRole(null)
    },
    onError: () => {
      toast.error('Rol silinirken bir hata oluştu')
    },
  })

  const onSubmit = (data: RoleFormData) => {
    const submitData = {
      role_name: data.role_name,
      is_active: data.is_active,
      permissions: selectedPermissions, // State'den alıyoruz
    }

    if (editingRole) {
      updateMutation.mutate({ id: editingRole._id, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  const handleEdit = async (role: Role) => {
    setEditingRole(role)
    setValue('role_name', role.role_name)
    setValue('is_active', role.is_active)
    
    // Yetkileri yükle
    try {
        // Eğer api/roles.ts güncellenmezse burası hata verir
        const privileges = await roleApi.getRolePrivileges(role._id);
        const perms = privileges.map(p => p.permission);
        setSelectedPermissions(perms);
    } catch (e) {
        toast.error("Rol yetkileri yüklenemedi");
        setSelectedPermissions([]);
    }
  }

  const handleCloseDialog = () => {
    setIsCreateOpen(false)
    setEditingRole(null)
    reset()
    setSelectedPermissions([])
  }

  const togglePermission = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    )
  }

  const toggleCategoryPermissions = (category: string) => {
    const categoryPerms = groupedPermissions[category].map((p: any) => p.value)
    const allSelected = categoryPerms.every((p: string) => selectedPermissions.includes(p))
    
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !categoryPerms.includes(p)))
    } else {
      setSelectedPermissions((prev) => [...new Set([...prev, ...categoryPerms])])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rol Yönetimi</h1>
          <p className="text-muted-foreground mt-2">
            Rolleri ve yetkilerini yönetin
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Rol
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Roller ({rolesData?.pagination?.total || 0})
          </CardTitle>
          <CardDescription>
            Sistemdeki tüm rollerin listesi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rol Adı</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Oluşturulma</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : rolesData?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Rol bulunamadı
                  </TableCell>
                </TableRow>
              ) : (
                rolesData?.data.map((role) => (
                  <TableRow key={role._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        {role.role_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.is_active ? 'default' : 'secondary'}>
                        {role.is_active ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(role.created_at).toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleEdit(role)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeletingRole(role)}
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

          {/* Pagination */}
          {rolesData?.pagination && rolesData.pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
              Sayfa {rolesData.pagination.page} / {rolesData.pagination.totalPages}
               </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= rolesData.pagination.totalPages}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || !!editingRole} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? 'Rol Düzenle' : 'Yeni Rol'}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? 'Rol bilgilerini güncelleyin'
                : 'Yeni bir rol oluşturun'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role_name">Rol Adı *</Label>
                <Input id="role_name" {...register('role_name')} />
                {errors.role_name && (
                  <p className="text-sm text-destructive">{errors.role_name.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  {...register('is_active')}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Aktif
                </Label>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base">Yetkiler *</Label>
                <Badge variant="outline">
                  {selectedPermissions.length} seçili
                </Badge>
              </div>
              
              {errors.permissions && (
                <p className="text-sm text-destructive">{errors.permissions.message}</p>
              )}

              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([category, perms]: [string, any]) => {
                  const allSelected = perms.every((p: any) =>
                    selectedPermissions.includes(p.value)
                  )

                  return (
                    <Card key={category}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium">
                            {category}
                          </CardTitle>
                          <Button
                            type="button"
                            variant={allSelected ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleCategoryPermissions(category)}
                          >
                            {allSelected ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {perms.map((perm: any) => (
                            <div
                              key={perm.value}
                              className="flex items-center space-x-2"
                            >
                              <input
                                type="checkbox"
                                id={perm.value}
                                checked={selectedPermissions.includes(perm.value)}
                                onChange={() => togglePermission(perm.value)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                              <Label
                                htmlFor={perm.value}
                                className="cursor-pointer text-sm font-normal"
                              >
                                {perm.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                İptal
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {editingRole ? 'Güncelle' : 'Oluştur'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Modal aynı kaldı... */}
      <AlertDialog
        open={!!deletingRole}
        onOpenChange={() => setDeletingRole(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rolü sil?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{deletingRole?.role_name}</strong> adlı rolü silmek
              istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingRole && deleteMutation.mutate(deletingRole._id)}
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