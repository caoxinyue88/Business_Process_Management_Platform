import { Card, CardContent, CardHeader, CardTitle } from '../../../app/components/ui/card';

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">系统设置</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>用户管理</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              管理用户账户、权限和访问控制
            </p>
            <button className="text-primary hover:underline">
              管理用户
            </button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>角色与权限</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              设置系统角色和相应的权限
            </p>
            <button className="text-primary hover:underline">
              管理角色
            </button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>系统配置</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              配置系统参数和全局设置
            </p>
            <button className="text-primary hover:underline">
              查看配置
            </button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>日志审计</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              查看系统操作日志和审计记录
            </p>
            <button className="text-primary hover:underline">
              查看日志
            </button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>备份与恢复</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              系统数据备份和恢复管理
            </p>
            <button className="text-primary hover:underline">
              备份管理
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 