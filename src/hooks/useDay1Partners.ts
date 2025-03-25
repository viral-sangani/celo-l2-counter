import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';

interface Partner {
  name: string;
  status: boolean;
}

interface UseDay1PartnersReturn {
  completedPartners: string[];
  pendingPartners: string[];
  isLoading: boolean;
  error: Error | null;
}

export const useDay1Partners = (): UseDay1PartnersReturn => {
  const [completedPartners, setCompletedPartners] = useState<string[]>([]);
  const [pendingPartners, setPendingPartners] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const partnersRef = ref(database, 'Day1Partners');

    const unsubscribe = onValue(
      partnersRef,
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const data = snapshot.val();
            const completed: string[] = [];
            const pending: string[] = [];

            // Process partners data
            Object.values(data).forEach((partner: any) => {
              if (partner.status === true) {
                completed.push(partner.name);
              } else {
                pending.push(partner.name);
              }
            });

            // Sort alphabetically
            setCompletedPartners(completed.sort());
            setPendingPartners(pending.sort());
          } else {
            // No data available
            setCompletedPartners([]);
            setPendingPartners([]);
          }
          setIsLoading(false);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setIsLoading(false);
        }
      },
      (err) => {
        setError(err);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  return { completedPartners, pendingPartners, isLoading, error };
};