# Supabase Realtime Setup for Activity Logs

## 1. Enable Realtime on activity_logs Table

✅ **Already Done!** - Realtime is already enabled for `activity_logs` table.

If needed, the command would be:
```sql
-- Enable Realtime for activity_logs table (SKIP - already enabled)
ALTER PUBLICATION supabase_realtime ADD TABLE activity_logs;
```

## 2. RLS Policies for activity_logs (Security)

Your activity_logs table should have RLS policies to control who can read logs via Realtime.

### Check Current RLS Status:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'activity_logs';
```

### Enable RLS (if not already enabled):

```sql
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
```

### Create SELECT Policy for Authenticated Users:

```sql
-- Allow authenticated users to read their own activity logs
CREATE POLICY "Users can view their own activity logs"
ON activity_logs
FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

### Create SELECT Policy for Service Role (Admin Operations):

```sql
-- Service role (backend) can read all logs
CREATE POLICY "Service role can view all logs"
ON activity_logs
FOR SELECT
TO service_role
USING (true);
```

## 3. Verify Realtime is Working

### Check Realtime Publications:

```sql
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' AND tablename = 'activity_logs';
```

You should see `activity_logs` in the results.

## 4. Test Realtime Subscription

Once deployed, check browser console for:
- `✅ Realtime subscription active for activity logs`
- `🔔 Activity log realtime event: INSERT` (when new log is added)

## Security Notes

1. **RLS is enforced on Realtime** - users only receive updates for rows they can SELECT
2. **Service role bypasses RLS** - only use server-side (API routes)
3. **Client uses authenticated user** - limited to their own logs
4. **No sensitive data in logs** - avoid logging passwords, tokens, etc.

## Performance

- Realtime subscriptions are lightweight (WebSocket)
- Only sends changes, not full table scans
- Automatic reconnection on network issues
- Memory efficient (no polling)

## Troubleshooting

If Realtime not working:
1. Check Supabase Dashboard → Database → Replication
2. Ensure `activity_logs` is checked under "Tables" → Realtime
3. Check browser console for subscription errors
4. Verify RLS policies allow SELECT for your user
