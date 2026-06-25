import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import logo from '@/assets/logo.png';

export default function Auth() {
  const [requestSuccessOpen, setRequestSuccessOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    navigate('/');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({ email, password });
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
      navigate('/');
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Login failed";
      const isInvalid = /invalid credentials|not found|unauthorized/i.test(msg);
      toast({
        title: isInvalid ? "Unable to sign in" : "Error",
        description: isInvalid
          ? "We couldn't sign you in. If you haven't registered yet, please request access first. New accounts must be approved by an administrator before you can log in."
          : msg,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.requestAccess({ email, password, name, organization });
      setRequestSuccessOpen(true);
      setName(''); setEmail(''); setPassword(''); setOrganization('');
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img src={logo} alt="Logo" className="h-16 w-16 rounded-lg" />
          </div>
          <CardTitle className="text-2xl">M&E Reporting Tool</CardTitle>
          <CardDescription>Sign in to manage your projects</CardDescription>
        </CardHeader>
        
        <Tabs value={isLogin ? "login" : "request"} onValueChange={(v) => setIsLogin(v === "login")}>
          <TabsList className="grid w-full grid-cols-2 px-6">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="request">Request Access</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="mt-0">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input id="login-password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>
                <Button type="button" variant="link" className="text-sm text-muted-foreground" onClick={() => setForgotOpen(true)}>
                  Forgot password?
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="request" className="mt-0">
            <form onSubmit={handleRequest}>
              <CardContent className="space-y-4 pt-6">
                <p className="text-xs text-muted-foreground bg-muted/40 rounded-md p-3 border">
                  Your request will be reviewed by an administrator. You'll be able to log in once approved.
                </p>
                <div className="space-y-2">
                  <Label htmlFor="req-name">Full Name</Label>
                  <Input id="req-name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="req-email">Email</Label>
                  <Input id="req-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="req-password">Choose a Password</Label>
                  <Input id="req-password" type="password" placeholder="Minimum 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="req-org">Organisation (optional)</Label>
                  <Input id="req-org" value={organization} onChange={(e) => setOrganization(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Submitting..." : "Request Access"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              For your security, passwords can no longer be reset from this page. Please contact an
              administrator to have your password reset, or sign in and change it from your account
              settings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" className="w-full" onClick={() => setForgotOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={requestSuccessOpen} onOpenChange={setRequestSuccessOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Registration request submitted</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 pt-2 text-left">
                <p>Thanks for registering. Your request has been sent to the administrators.</p>
                <div className="rounded-md border bg-muted/40 p-3 text-sm">
                  <p className="font-medium text-foreground mb-1">What happens next?</p>
                  <ol className="list-decimal pl-4 space-y-1 text-muted-foreground">
                    <li>An administrator will review your request.</li>
                    <li>Once approved, you can sign in with the email and password you just provided.</li>
                    <li>If you don't hear back within a few days, please contact your administrator.</li>
                  </ol>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" className="w-full" onClick={() => { setRequestSuccessOpen(false); setIsLogin(true); }}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
