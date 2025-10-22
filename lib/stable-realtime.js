/**
 * 🔒 Stable Realtime Subscription Manager
 * 
 * Prevents re-subscriptions on component re-renders/navigation.
 * Maintains subscription cache globally.
 */

const subscriptionCache = new Map();

export const useStableRealtimeSubscription = (
  tableName,
  onDataReceived,
  orderByField = 'created_at',
  orderByDirection = 'desc'
) => {
  const [data, setData] = window.React ? window.React.useState([]) : [[], () => {}];
  const [loading, setLoading] = window.React ? window.React.useState(true) : [true, () => {}];
  const [error, setError] = window.React ? window.React.useState(null) : [null, () => {}];
  const isMountedRef = window.React ? window.React.useRef(true) : { current: true };

  window.React?.useEffect(() => {
    isMountedRef.current = true;

    if (typeof window === 'undefined') {
      return () => {
        isMountedRef.current = false;
      };
    }

    const setupSubscription = async () => {
      try {
        const cacheKey = `${tableName}-subscription`;

        // If subscription already exists, just sync state
        if (subscriptionCache.has(cacheKey)) {
          console.log(`📚 Reusing existing ${tableName} subscription`);
          
          const { supabaseClient } = await import('@/lib/supabase');
          const { data: fetchedData, error: fetchError } = await supabaseClient
            .from(tableName)
            .select('*')
            .order(orderByField, { ascending: orderByDirection === 'asc' });

          if (fetchError) throw fetchError;
          if (isMountedRef.current) {
            setData(fetchedData || []);
            setLoading(false);
          }
          return;
        }

        console.log(`🎬 Setting up ${tableName} subscription...`);

        const { supabaseClient } = await import('@/lib/supabase');

        // Initial fetch
        const { data: initialData, error: fetchError } = await supabaseClient
          .from(tableName)
          .select('*')
          .order(orderByField, { ascending: orderByDirection === 'asc' });

        if (fetchError) throw fetchError;

        if (!isMountedRef.current) return;

        setData(initialData || []);
        setLoading(false);

        console.log(`✅ Fetched ${tableName}:`, initialData?.length || 0);

        // Create and cache subscription
        const channelId = `admin-${tableName}-${Date.now()}`;
        const subscription = supabaseClient
          .channel(channelId)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: tableName
            },
            (payload) => {
              console.log(`⚡ ${tableName} realtime event:`, payload.eventType);
              if (!isMountedRef.current) return;
              onDataReceived(payload, setData);
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log(`✅ ${tableName} subscription active`);
            }
          });

        subscriptionCache.set(cacheKey, subscription);

      } catch (err) {
        console.error(`❌ ${tableName} realtime setup error:`, err);
        if (isMountedRef.current) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    setupSubscription();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { data, loading, error };
};
