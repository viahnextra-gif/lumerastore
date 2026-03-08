import { useState, useEffect } from 'react';
import { Search, Loader2, Users, Phone, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface Customer { id: string; user_id: string; full_name: string | null; phone: string | null; city: string | null; customer_type: string; company_name: string | null; created_at: string; }

export default function Customers() {
  const { t, language } = useLanguage();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchCustomers(); }, []);

  const fetchCustomers = async () => {
    try { const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }); if (error) throw error; setCustomers(data || []); } catch (error) { console.error('Error:', error); } finally { setIsLoading(false); }
  };

  const locale = language === 'pt' ? 'pt-BR' : language === 'es' ? 'es-PY' : 'en-US';
  const formatDate = (date: string) => new Date(date).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });

  const filteredCustomers = customers.filter((c) =>
    c.full_name?.toLowerCase().includes(search.toLowerCase()) || c.company_name?.toLowerCase().includes(search.toLowerCase()) || c.city?.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">{t('admin.customersTitle')}</h1>
        <p className="text-muted-foreground">{t('admin.customersSubtitle')}</p>
      </div>
      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('admin.searchCustomers')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12"><Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><p className="text-muted-foreground">{t('admin.noCustomers')}</p></div>
          ) : (
            <Table>
              <TableHeader><TableRow>
                <TableHead>{t('admin.customerColumn')}</TableHead>
                <TableHead>{t('admin.contactColumn')}</TableHead>
                <TableHead>{t('admin.cityColumn')}</TableHead>
                <TableHead>{t('admin.typeColumn')}</TableHead>
                <TableHead>{t('admin.registrationColumn')}</TableHead>
              </TableRow></TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-medium">{customer.full_name?.charAt(0).toUpperCase() || '?'}</span>
                        </div>
                        <div>
                          <p className="font-medium">{customer.full_name || t('admin.noName')}</p>
                          {customer.company_name && <p className="text-sm text-muted-foreground flex items-center gap-1"><Building className="h-3 w-3" />{customer.company_name}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.phone ? <p className="text-sm flex items-center gap-1"><Phone className="h-3 w-3 text-muted-foreground" />{customer.phone}</p> : <span className="text-muted-foreground text-sm">-</span>}
                    </TableCell>
                    <TableCell>{customer.city || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={customer.customer_type === 'wholesale' ? 'default' : 'secondary'}>
                        {customer.customer_type === 'wholesale' ? t('admin.wholesaleType') : t('admin.retailType')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(customer.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
