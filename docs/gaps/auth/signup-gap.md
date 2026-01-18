# Gap: User signup (self-serve)

## Legacy reference (old project)
- old/src/app/(auth)/signup/page.tsx
- old/src/app/(auth)/signup/SignupClient.tsx

## New project status (orgcentral)
- No /signup route under orgcentral/src/app/(auth)
- Only admin bootstrap exists at orgcentral/src/app/(auth)/admin-signup

## Impact
- End users cannot create accounts without an admin bootstrap path.

## TODO
- [ ] Analyze and design a self-serve signup flow that fits the new auth stack and org provisioning rules.
