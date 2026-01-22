import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, CreditCard, Store, Key, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Setting {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  is_secret: boolean;
}

export default function Settings() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .order('key');

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (key: string, value: string) => {
    setSettings(settings.map((s) => (s.key === key ? { ...s, value } : s)));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      for (const setting of settings) {
        const { error } = await supabase
          .from('settings')
          .update({ value: setting.value })
          .eq('key', setting.key);

        if (error) throw error;
      }
      toast({ title: 'Configuración guardada' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const getSetting = (key: string) => settings.find((s) => s.key === key);

  const toggleShowSecret = (key: string) => {
    setShowSecrets({ ...showSecrets, [key]: !showSecrets[key] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground">Gestiona la configuración de tu tienda</p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList>
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Tienda
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Pagos
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Información de la Tienda</CardTitle>
                <CardDescription>Configuración general de tu tienda</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre de la Tienda</Label>
                    <Input
                      value={getSetting('store_name')?.value || ''}
                      onChange={(e) => handleSettingChange('store_name', e.target.value)}
                      placeholder="Meca Store"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email de Contacto</Label>
                    <Input
                      type="email"
                      value={getSetting('store_email')?.value || ''}
                      onChange={(e) => handleSettingChange('store_email', e.target.value)}
                      placeholder="contacto@mecastore.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input
                      value={getSetting('store_phone')?.value || ''}
                      onChange={(e) => handleSettingChange('store_phone', e.target.value)}
                      placeholder="+595 XXX XXX XXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Envío gratis desde (PYG)</Label>
                    <Input
                      type="number"
                      value={getSetting('free_shipping_threshold')?.value || ''}
                      onChange={(e) =>
                        handleSettingChange('free_shipping_threshold', e.target.value)
                      }
                      placeholder="500000"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
                    {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="payments">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Stripe</CardTitle>
                <CardDescription>
                  Configura tu integración con Stripe para procesar pagos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Importante</AlertTitle>
                  <AlertDescription>
                    Para activar pagos con tarjeta, necesitas configurar tus claves de API de Stripe.
                    Puedes obtenerlas en{' '}
                    <a
                      href="https://dashboard.stripe.com/apikeys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      dashboard.stripe.com
                    </a>
                  </AlertDescription>
                </Alert>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Switch
                    checked={getSetting('stripe_enabled')?.value === 'true'}
                    onCheckedChange={(checked) =>
                      handleSettingChange('stripe_enabled', checked ? 'true' : 'false')
                    }
                  />
                  <div>
                    <Label className="text-base">Habilitar Stripe</Label>
                    <p className="text-sm text-muted-foreground">
                      Activa para procesar pagos con tarjeta
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Publishable Key (pk_...)</Label>
                    <Input
                      value={getSetting('stripe_publishable_key')?.value || ''}
                      onChange={(e) =>
                        handleSettingChange('stripe_publishable_key', e.target.value)
                      }
                      placeholder="pk_live_xxxxx o pk_test_xxxxx"
                    />
                    <p className="text-xs text-muted-foreground">
                      Esta clave es pública y se usa en el frontend
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Secret Key (sk_...)</Label>
                    <div className="relative">
                      <Input
                        type={showSecrets['stripe_secret_key'] ? 'text' : 'password'}
                        value={getSetting('stripe_secret_key')?.value || ''}
                        onChange={(e) => handleSettingChange('stripe_secret_key', e.target.value)}
                        placeholder="sk_live_xxxxx o sk_test_xxxxx"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('stripe_secret_key')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecrets['stripe_secret_key'] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Esta clave es privada y solo se usa en el servidor
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Webhook Secret (whsec_...)</Label>
                    <div className="relative">
                      <Input
                        type={showSecrets['stripe_webhook_secret'] ? 'text' : 'password'}
                        value={getSetting('stripe_webhook_secret')?.value || ''}
                        onChange={(e) =>
                          handleSettingChange('stripe_webhook_secret', e.target.value)
                        }
                        placeholder="whsec_xxxxx"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowSecret('stripe_webhook_secret')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecrets['stripe_webhook_secret'] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Para verificar los webhooks de Stripe
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
                    {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="api">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>API Keys & Integraciones</CardTitle>
                <CardDescription>
                  Gestiona las claves de API para servicios externos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Próximamente</AlertTitle>
                  <AlertDescription>
                    Esta sección permitirá configurar integraciones con otros servicios como:
                    WhatsApp Business, servicios de envío, analytics, etc.
                  </AlertDescription>
                </Alert>

                <div className="text-center py-8 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Las integraciones adicionales estarán disponibles próximamente</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
