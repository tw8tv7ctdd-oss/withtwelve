# Fix auth page label-to-input spacing

## Problem
After the last spacing change, the `Email address` label sits in the outer `space-y-4` container, so the gap between the label and the input is 16px. The user wants it to match the 8px gap between the input and the helper text below it.

## Change
Move the `<Label htmlFor="email">` back inside the inner `space-y-2` container in `src/routes/auth.tsx`, so the label, input, and helper text all share the same 8px vertical rhythm.

```text
Before:
  <div className="space-y-4">
    <Label htmlFor="email">Email address</Label>
    <div className="space-y-2">
      <Input />
      <p>We will never share your email...</p>
    </div>
    ...
  </div>

After:
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="email">Email address</Label>
      <Input />
      <p>We will never share your email...</p>
    </div>
    ...
  </div>
```

## Verification
- Inspect the rendered `/auth` page to confirm the label sits closer to the input.
- Confirm no other spacing or layout regressions in the form.
