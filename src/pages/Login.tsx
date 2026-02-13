import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { InfluurPulseLogo } from '@/components/InfluurPulseLogo';
import loginBg from '@/assets/login-bg.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — background image */}
      <div className="hidden lg:block lg:w-3/5 relative">
        <img
          src={loginBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/80" />
      </div>

      {/* Right — login form */}
      <div
        className="w-full lg:w-2/5 flex flex-col items-center justify-center px-6 relative"
        style={{ background: 'hsl(220 20% 7%)' }}
      >
        {/* Mobile-only bg image */}
        <img
          src={loginBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20 lg:hidden pointer-events-none"
        />

        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-primary/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-[360px] space-y-10">
          {/* Logo */}
          <div className="flex justify-center">
            <InfluurPulseLogo size="lg" />
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-border/40 bg-card/60 backdrop-blur-xl p-8 space-y-6 shadow-2xl shadow-black/30">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-foreground">Welcome back</h2>
              <p className="text-sm text-muted-foreground">Sign in to your dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={255}
                  className="bg-background/60 border-border/40 focus:border-primary/60 h-11 text-sm placeholder:text-muted-foreground/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  maxLength={128}
                  className="bg-background/60 border-border/40 focus:border-primary/60 h-11 text-sm placeholder:text-muted-foreground/40"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 font-semibold text-sm tracking-wide mt-1"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {loading ? 'Signing in…' : 'Sign In'}
              </Button>
            </form>
          </div>

          <p className="text-center text-[11px] text-muted-foreground/40 tracking-wide">
            Powered by Influur
          </p>
        </div>
      </div>
    </div>
  );
}
