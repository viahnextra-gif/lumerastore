import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

interface CountdownTimerProps {
  targetDate: Date;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const { t } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calc = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) { setIsExpired(true); return; }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (isExpired) return null;

  const units = [
    { value: timeLeft.days, label: t('countdown.days') },
    { value: timeLeft.hours, label: t('countdown.hours') },
    { value: timeLeft.minutes, label: t('countdown.minutes') },
    { value: timeLeft.seconds, label: t('countdown.seconds') },
  ];

  return (
    <div className="text-center">
      <div className="flex justify-center gap-3 sm:gap-4">
        {units.map((unit, i) => (
          <motion.div key={unit.label} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-bold text-primary font-display">{String(unit.value).padStart(2, '0')}</span>
            </div>
            <span className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">{unit.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
