import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddressData {
  address: string | null;
  city: string | null;
}

export default function AccountAddresses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [addressData, setAddressData] = useState<AddressData>({
    address: '',
    city: '',
  });

  useEffect(() => {
    if (user) {
      fetchAddress();
    }
  }, [user]);

  const fetchAddress = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('address, city')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setAddressData({
          address: data.address || '',
          city: data.city || '',
        });
      }
    } catch (error) {
      console.error('Error fetching address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user?.id,
          ...addressData,
        });

      if (error) throw error;

      toast({
        title: 'Endereço salvo',
        description: 'Seu endereço foi atualizado com sucesso',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o endereço',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Endereço de Entrega</CardTitle>
          <CardDescription>
            Este será seu endereço padrão para envios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg border border-border bg-muted/30">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço Completo</Label>
                  <Input
                    id="address"
                    value={addressData.address || ''}
                    onChange={(e) => setAddressData({ ...addressData, address: e.target.value })}
                    placeholder="Rua, número, bairro, complemento..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={addressData.city || ''}
                    onChange={(e) => setAddressData({ ...addressData, city: e.target.value })}
                    placeholder="Ex: São Paulo, Rio de Janeiro..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvar Endereço
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
