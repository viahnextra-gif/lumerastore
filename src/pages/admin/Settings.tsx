import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, CreditCard, Store, Key, Eye, EyeOff, AlertCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface Setting { id: string; key: string; value: string | null; description: string | null; is_secret: boolean; }

export default function Settings() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => { fetchSettings(); }, []);

  const fetchSettings = async () => {
    try { const { data, error } = await supabase.from('settings').select('*').order('key'); if (error) throw error; setSettings(data || []); } catch (error) { console.error('Error:', error); } finally { setIsLoading(false); }
  };

  const handleSettingChange = (key: string, value: string) => setSettings(settings.map((s) => (s.key === key ? { ...s, value } : s)));

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try { for (const setting of settings) { const { error } = await supabase.from('settings').update({ value: setting.value }).eq('key', setting.key); if (error) throw error; } toast({ title: t('admin.settingsSaved') }); } catch { toast({ title: 'Error', description: t('admin.settingsError'), variant: 'destructive' }); } finally { setIsSaving(false); }
  };

  const getSetting = (key: string) => settings.find((s) => s.key === key);
  const toggleShowSecret = (key: string) => setShowSecrets({ ...showSecrets, [key]: !showSecrets[key] });

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">{t('admin.settingsTitle')}</h1>
        <p className="text-muted-foreground">{t('admin.settingsSubtitle')}</p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList>
          <TabsTrigger value="store" className="flex items-center gap-2"><Store className="h-4 w-4" />{t('admin.tabStore')}</TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2"><CreditCard className="h-4 w-4" />{t('admin.tabPayments')}</TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2"><MessageCircle className="h-4 w-4" />{t('admin.tabWhatsApp')}</TabsTrigger>
          <TabsTrigger value="api" className="flex items-center gap-2"><Key className="h-4 w-4" />{t('admin.tabApi')}</TabsTrigger>
        </TabsList>

        <TabsContent value="store">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader><CardTitle>{t('admin.storeInfo')}</CardTitle><CardDescription>{t('admin.storeInfoDesc')}</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>{t('admin.storeName')}</Label><Input value={getSetting('store_name')?.value || ''} onChange={(e) => handleSettingChange('store_name', e.target.value)} placeholder="Meca Store" /></div>
                  <div className="space-y-2"><Label>{t('admin.contactEmail')}</Label><Input type="email" value={getSetting('store_email')?.value || ''} onChange={(e) => handleSettingChange('store_email', e.target.value)} /></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>{t('admin.phoneLabel')}</Label><Input value={getSetting('store_phone')?.value || ''} onChange={(e) => handleSettingChange('store_phone', e.target.value)} /></div>
                  <div className="space-y-2"><Label>{t('admin.freeShippingFrom')}</Label><Input type="number" value={getSetting('free_shipping_threshold')?.value || ''} onChange={(e) => handleSettingChange('free_shipping_threshold', e.target.value)} /></div>
                </div>
                <div className="flex justify-end"><Button onClick={handleSaveSettings} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}<Save className="h-4 w-4 mr-2" />{t('admin.save')}</Button></div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="payments">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader><CardTitle>{t('admin.stripeConfig')}</CardTitle><CardDescription>{t('admin.stripeConfigDesc')}</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <Alert><AlertCircle className="h-4 w-4" /><AlertTitle>{t('admin.important')}</AlertTitle><AlertDescription>{t('admin.stripeNote')} <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="text-primary underline">dashboard.stripe.com</a></AlertDescription></Alert>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Switch checked={getSetting('stripe_enabled')?.value === 'true'} onCheckedChange={(checked) => handleSettingChange('stripe_enabled', checked ? 'true' : 'false')} />
                  <div><Label className="text-base">{t('admin.enableStripe')}</Label><p className="text-sm text-muted-foreground">{t('admin.enableStripeDesc')}</p></div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2"><Label>{t('admin.publishableKey')}</Label><Input value={getSetting('stripe_publishable_key')?.value || ''} onChange={(e) => handleSettingChange('stripe_publishable_key', e.target.value)} /><p className="text-xs text-muted-foreground">{t('admin.publicKeyNote')}</p></div>
                  <div className="space-y-2">
                    <Label>{t('admin.secretKey')}</Label>
                    <div className="relative"><Input type={showSecrets['stripe_secret_key'] ? 'text' : 'password'} value={getSetting('stripe_secret_key')?.value || ''} onChange={(e) => handleSettingChange('stripe_secret_key', e.target.value)} /><button type="button" onClick={() => toggleShowSecret('stripe_secret_key')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showSecrets['stripe_secret_key'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
                    <p className="text-xs text-muted-foreground">{t('admin.secretKeyNote')}</p>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('admin.webhookSecret')}</Label>
                    <div className="relative"><Input type={showSecrets['stripe_webhook_secret'] ? 'text' : 'password'} value={getSetting('stripe_webhook_secret')?.value || ''} onChange={(e) => handleSettingChange('stripe_webhook_secret', e.target.value)} /><button type="button" onClick={() => toggleShowSecret('stripe_webhook_secret')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showSecrets['stripe_webhook_secret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
                    <p className="text-xs text-muted-foreground">{t('admin.webhookSecretNote')}</p>
                  </div>
                </div>
                <div className="flex justify-end"><Button onClick={handleSaveSettings} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}<Save className="h-4 w-4 mr-2" />{t('admin.save')}</Button></div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="whatsapp">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader><CardTitle>{t('admin.whatsappConfig')}</CardTitle><CardDescription>{t('admin.whatsappConfigDesc')}</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <Alert><AlertCircle className="h-4 w-4" /><AlertTitle>{t('admin.important')}</AlertTitle><AlertDescription>{t('admin.whatsappNote')} <a href="https://developers.facebook.com/apps" target="_blank" rel="noopener noreferrer" className="text-primary underline">Meta for Developers</a></AlertDescription></Alert>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                  <Switch checked={getSetting('whatsapp_enabled')?.value === 'true'} onCheckedChange={(checked) => handleSettingChange('whatsapp_enabled', checked ? 'true' : 'false')} />
                  <div><Label className="text-base">{t('admin.enableWhatsApp')}</Label><p className="text-sm text-muted-foreground">{t('admin.enableWhatsAppDesc')}</p></div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{t('admin.accessToken')}</Label>
                    <div className="relative"><Input type={showSecrets['whatsapp_access_token'] ? 'text' : 'password'} value={getSetting('whatsapp_access_token')?.value || ''} onChange={(e) => handleSettingChange('whatsapp_access_token', e.target.value)} /><button type="button" onClick={() => toggleShowSecret('whatsapp_access_token')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">{showSecrets['whatsapp_access_token'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
                    <p className="text-xs text-muted-foreground">{t('admin.accessTokenNote')}</p>
                  </div>
                  <div className="space-y-2"><Label>{t('admin.phoneNumberId')}</Label><Input value={getSetting('whatsapp_phone_number_id')?.value || ''} onChange={(e) => handleSettingChange('whatsapp_phone_number_id', e.target.value)} /><p className="text-xs text-muted-foreground">{t('admin.phoneNumberIdNote')}</p></div>
                  <div className="space-y-2"><Label>{t('admin.adminPhone')}</Label><Input value={getSetting('whatsapp_admin_phone')?.value || ''} onChange={(e) => handleSettingChange('whatsapp_admin_phone', e.target.value)} /><p className="text-xs text-muted-foreground">{t('admin.adminPhoneNote')}</p></div>
                </div>
                <div className="flex justify-end"><Button onClick={handleSaveSettings} disabled={isSaving}>{isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}<Save className="h-4 w-4 mr-2" />{t('admin.save')}</Button></div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="api">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader><CardTitle>{t('admin.apiKeysTitle')}</CardTitle><CardDescription>{t('admin.apiKeysDesc')}</CardDescription></CardHeader>
              <CardContent>
                <Alert className="mb-6"><AlertCircle className="h-4 w-4" /><AlertTitle>{t('admin.comingSoon')}</AlertTitle><AlertDescription>{t('admin.comingSoonDesc')}</AlertDescription></Alert>
                <div className="text-center py-8 text-muted-foreground"><Key className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>{t('admin.comingSoonDesc')}</p></div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
