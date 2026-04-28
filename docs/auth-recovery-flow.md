# Supabase Recovery Session Flow

## Overview
Supabase automatically creates a special "recovery session" when a user clicks a password reset link with `type=recovery` parameter. This session allows passwordless authentication for the password update operation.

## How It Works

### 1. Email Link Generation
```typescript
// User initiates password reset
await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${origin}/auth/reset-password`
})
```

**Generated Email Link Format:**
```
https://salonrink.com/auth/reset-password#type=recovery&code=...&refresh_token=...
```

### 2. Recovery Session Creation
When user clicks the email link:
- Supabase automatically detects `type=recovery` in URL hash
- Creates temporary recovery session using provided code/token
- **No login credentials needed** - the user is authenticated via the token

### 3. Getting User Email
```typescript
// Inside recovery session
const { data: { user } } = await supabase.auth.getUser()
// → user.email is available from recovery session
// → No need to ask user for email again
```

### 4. Password Update
```typescript
// Update password while in recovery session
const { error } = await supabase.auth.updateUser({ password: newPassword })
```

**Important:** After `updateUser()` succeeds:
- The recovery session is **automatically upgraded** to a regular authenticated session
- User is now fully authenticated with new password
- Session persists in browser localStorage
- **No need to redirect to login** - user can go directly to protected routes like `/dashboard`

## Implementation in SalonRink

### File: `app/auth/reset-password/reset-password-content.tsx`

**Step Detection:**
```typescript
const hasRecoveryToken = searchParams.has('type') && searchParams.get('type') === 'recovery'
const [step, setStep] = useState<'email' | 'password'>(hasRecoveryToken ? 'password' : 'email')
```

**Email Retrieval:**
```typescript
useEffect(() => {
  if (step === 'password' && !email) {
    const fetchEmail = async () => {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        setEmail(user.email)  // Email from recovery session
      }
    }
    fetchEmail()
  }
}, [step, email])
```

**Password Update & Auto-Redirect:**
```typescript
const { error } = await supabase.auth.updateUser({ password })

if (!error) {
  // Session is now authenticated with new password
  setMessage({ ok: true, text: 'パスワードを更新しました。ダッシュボードへ移動します...' })
  setIsRedirecting(true)
  
  // Redirect directly to dashboard - user is already authenticated
  setTimeout(() => {
    router.push('/dashboard')
  }, 800)
}
```

## Flow Diagram

```
User clicks email link
     ↓
type=recovery detected
     ↓
Recovery session created (Supabase automatic)
     ↓
getUser() returns email from recovery session
     ↓
User enters new password
     ↓
updateUser({ password: newPassword }) called
     ↓
Recovery session → Regular authenticated session (automatic)
     ↓
Auto-redirect to /dashboard
     ↓
User enters dashboard - already authenticated ✓
```

## Key Points

1. **No Manual Login Needed** - Supabase handles session upgrade automatically
2. **Email Available** - User's email is in the recovery session, no need to ask again
3. **Direct Dashboard Access** - After password update, user can go straight to protected routes
4. **Secure** - Recovery tokens are one-time use and short-lived
5. **UX Friendly** - Minimal steps, no redirect loops

## Related Files

- `app/auth/reset-password/page.tsx` - Server component wrapper
- `app/auth/reset-password/reset-password-content.tsx` - Client component with flow logic
- `app/api/auth/callback/route.ts` - Handles OAuth callbacks (separate from recovery flow)
