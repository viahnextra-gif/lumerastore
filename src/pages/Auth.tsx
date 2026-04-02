import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';
import { z } from 'zod';

export default function Auth() {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { signIn, signUp, user, isAdmin, isAdminOrModerator, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const loginSchema = z.object({
    email: z.string().email(t('auth.invalidEmail')),
    password: z.string().min(6, t('auth.passwordMin')),
  });

  const signupSchema = loginSchema.extend({
    fullName: z.string().min(2, t('auth.nameMin')),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('auth.passwordMismatch'),
    path: ['confirmPassword'],
  });

  useEffect(() => {
    if (user && !isLoading) {
      if (isAdmin || isAdminOrModerator) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  }, [user, isAdmin, isAdminOrModerator, isLoading, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast({ title: t('auth.attention'), description: t('auth.enterEmailFirst'), variant: 'destructive' });
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: t('auth.emailSent'), description: t('auth.checkEmail') });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsSubmitting(true);

    try {
      if (isLogin) {
        const result = loginSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }

        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({ title: t('auth.authError'), description: t('auth.invalidCredentials'), variant: 'destructive' });
          } else {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
          }
        } else {
          toast({ title: t('auth.welcome'), description: t('auth.welcomeDesc') });
        }
      } else {
        const result = signupSchema.safeParse(formData);
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.errors.forEach((err) => {
            if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
          });
          setErrors(fieldErrors);
          setIsSubmitting(false);
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({ title: t('auth.alreadyRegistered'), description: t('auth.alreadyRegisteredDesc'), variant: 'destructive' });
          } else {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
          }
        } else {
          toast({ title: t('auth.accountCreated'), description: t('auth.accountCreatedDesc') });
        }
      }
    } catch (error) {
      toast({ title: 'Error', description: t('auth.unexpectedError'), variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('auth.backToStore')}
          </Link>

          <div className="text-center mb-8">
            <Link to="/" className="font-display text-3xl font-bold text-primary">MECA</Link>
            <h1 className="mt-4 font-display text-2xl font-bold text-foreground">
              {isLogin ? t('auth.signIn') : t('auth.createAccount')}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isLogin ? t('auth.signInSubtitle') : t('auth.createAccountSubtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="fullName" name="fullName" type="text" placeholder={t('auth.namePlaceholder')} value={formData.fullName} onChange={handleChange} className="pl-10" />
                </div>
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" name="email" type="email" placeholder="tu@email.com" value={formData.email} onChange={handleChange} className="pl-10" />
              </div>
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.password} onChange={handleChange} className="pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} className="pl-10" />
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
              </div>
            )}

            {isLogin && (
              <div className="text-right">
                <button type="button" onClick={handleForgotPassword} className="text-sm text-primary hover:underline">
                  {t('auth.forgotPassword')}
                </button>
              </div>
            )}

            <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={isSubmitting}>
              {isSubmitting ? t('auth.loading') : isLogin ? t('auth.signIn') : t('auth.createAccount')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground">
              {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setErrors({}); setFormData({ email: '', password: '', confirmPassword: '', fullName: '' }); }}
                className="ml-2 text-primary hover:underline font-medium"
              >
                {isLogin ? t('auth.register') : t('auth.login')}
              </button>
            </p>
          </div>
        </motion.div>
      </div>

      <div className="hidden lg:block lg:flex-1 bg-muted relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-rose-dark/30" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white">
            <h2 className="font-display text-4xl font-bold mb-4">{t('auth.heroTitle')}</h2>
            <p className="text-lg opacity-90">{t('auth.heroSubtitle')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
