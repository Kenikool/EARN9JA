# Next.js 15 Async Params Fix

## Issue

Next.js 15 requires that dynamic route params be awaited before accessing their properties. The error message is:

```
Error: Route "/api/properties/[id]" used `params.id`.
`params` should be awaited before using its properties.
```

## Root Cause

In Next.js 15, the `params` object in dynamic routes is now a Promise and must be awaited.

## Solution Pattern

### Before (Next.js 14 and earlier):

```typescript
interface RouteContext {
  params: { id: string };
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const property = await Property.findById(context.params.id);
  // ...
}
```

### After (Next.js 15):

```typescript
interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;

  // Validate MongoDB ObjectId
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid ID" },
      { status: 400 }
    );
  }

  const property = await Property.findById(id);
  // ...
}
```

## Files Fixed

### ✅ Fixed:

1. `client/src/app/api/properties/[id]/route.ts`

   - Added async params
   - Added ObjectId validation
   - Prevents "Cast to ObjectId" errors

2. `client/src/app/api/agents/[id]/route.ts`
   - Added async params
   - Added ObjectId validation

### ⚠️ Need Fixing:

The following files still need to be updated:

3. `client/src/app/api/reviews/[id]/route.ts`
4. `client/src/app/api/inquiries/[id]/route.ts`
5. `client/src/app/api/agents/[id]/properties/route.ts`
6. `client/src/app/api/appointments/[id]/route.ts`

## Benefits of the Fix

1. **Compliance with Next.js 15:**

   - No more warning messages
   - Future-proof code

2. **Better Error Handling:**

   - Validates ObjectId before database query
   - Returns 400 Bad Request for invalid IDs
   - Prevents MongoDB cast errors

3. **Security:**
   - Prevents injection attempts
   - Validates input format
   - Clear error messages

## Implementation Checklist

For each dynamic route file:

- [ ] Update `RouteContext` interface to use `Promise<{ id: string }>`
- [ ] Add `const { id } = await context.params;` at the start of each handler
- [ ] Import `Types` from mongoose: `import { Types } from "mongoose";`
- [ ] Add ObjectId validation:
  ```typescript
  if (!Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { success: false, message: "Invalid ID" },
      { status: 400 }
    );
  }
  ```
- [ ] Replace all `context.params.id` with `id`
- [ ] Test the endpoint

## Testing

### Valid ID:

```bash
curl http://localhost:3000/api/properties/507f1f77bcf86cd799439011
# Should return property or 404
```

### Invalid ID:

```bash
curl http://localhost:3000/api/properties/invalid
# Should return 400 Bad Request with message "Invalid property ID"
```

### Non-existent but valid ID:

```bash
curl http://localhost:3000/api/properties/507f1f77bcf86cd799439999
# Should return 404 Not Found
```

## Error Prevention

The fix prevents these common errors:

1. **Cast to ObjectId failed:**

   ```
   CastError: Cast to ObjectId failed for value "new" (type string)
   at path "_id" for model "Property"
   ```

2. **Sync dynamic APIs warning:**
   ```
   Error: Route "/api/properties/[id]" used `params.id`.
   `params` should be awaited before using its properties.
   ```

## Migration Script

To quickly fix all remaining files, use this pattern:

```typescript
// 1. Update interface
interface RouteContext {
  params: Promise<{ id: string }>;
}

// 2. At start of each handler function
const { id } = await context.params;

// 3. Add validation
if (!Types.ObjectId.isValid(id)) {
  return NextResponse.json(
    { success: false, message: "Invalid ID" },
    { status: 400 }
  );
}

// 4. Replace context.params.id with id
```

## Additional Notes

- This is a breaking change in Next.js 15
- All dynamic routes need this update
- The validation step is optional but highly recommended
- Consider adding this pattern to your code templates
- Update your documentation and onboarding materials

## References

- [Next.js 15 Upgrade Guide](https://nextjs.org/docs/messages/sync-dynamic-apis)
- [Dynamic Routes Documentation](https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes)
- [MongoDB ObjectId Validation](<https://mongoosejs.com/docs/api/mongoose.html#Mongoose.prototype.isValidObjectId()>)
