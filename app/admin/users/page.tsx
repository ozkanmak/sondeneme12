import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { sql } from '@/lib/db'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Users } from 'lucide-react'
import Link from 'next/link'

export default async function UsersManagement() {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'admin') {
    redirect('/login')
  }

  // Fetch all users
  const users = await sql`
    SELECT u.*, 
           sp.points, sp.level,
           tp.specialization
    FROM users u
    LEFT JOIN student_profiles sp ON u.id = sp.user_id
    LEFT JOIN teacher_profiles tp ON u.id = tp.user_id
    ORDER BY u.created_at DESC
  `

  const students = users.filter((u: any) => u.role === 'student')
  const teachers = users.filter((u: any) => u.role === 'teacher')
  const admins = users.filter((u: any) => u.role === 'admin')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto p-6 space-y-6">
        <Button asChild variant="ghost">
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard'a Dön
          </Link>
        </Button>

        <header>
          <h1 className="text-3xl font-bold">Kullanıcı Yönetimi</h1>
          <p className="text-muted-foreground">Tüm kullanıcıları görüntüleyin ve yönetin</p>
        </header>

        {/* Admins */}
        <Card>
          <CardHeader>
            <CardTitle>Yöneticiler</CardTitle>
            <CardDescription>{admins.length} yönetici</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {admins.map((admin: any) => (
                <div key={admin.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">{admin.full_name}</div>
                      <div className="text-sm text-muted-foreground">{admin.email}</div>
                    </div>
                  </div>
                  <Badge>Admin</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Teachers */}
        <Card>
          <CardHeader>
            <CardTitle>Öğretmenler</CardTitle>
            <CardDescription>{teachers.length} öğretmen</CardDescription>
          </CardHeader>
          <CardContent>
            {teachers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Henüz öğretmen yok
              </div>
            ) : (
              <div className="space-y-3">
                {teachers.map((teacher: any) => (
                  <div key={teacher.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{teacher.full_name}</div>
                        <div className="text-sm text-muted-foreground">{teacher.email}</div>
                      </div>
                    </div>
                    <Badge variant="secondary">Öğretmen</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Students */}
        <Card>
          <CardHeader>
            <CardTitle>Öğrenciler</CardTitle>
            <CardDescription>{students.length} öğrenci</CardDescription>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Henüz öğrenci yok
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {students.map((student: any) => (
                  <div key={student.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{student.full_name}</div>
                        <div className="text-sm text-muted-foreground">{student.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">Seviye {student.level || 1}</Badge>
                      <div className="text-xs text-muted-foreground mt-1">{student.points || 0} puan</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
