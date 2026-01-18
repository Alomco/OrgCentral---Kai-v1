# Gap: Forgot password / reset flow

## Legacy reference (old project)
- old/src/app/(auth)/forgot-password/page.tsx

## New project status (orgcentral)
- No /forgot-password route under orgcentral/src/app/(auth)
- Login UI still links to /forgot-password in orgcentral/src/components/auth/LoginForm.base.tsx

## Impact
- Users cannot initiate password reset in-app; link is dead.

## TODO
- [ ] Analyze and implement password reset UX and API hooks for the new auth stack.
