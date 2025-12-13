# Error Boundaries Documentation

## Overview

Error boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI instead of crashing the entire application.

## Available Error Boundaries

### 1. RootErrorBoundary

**Location**: `components/root-error-boundary.tsx`

**Purpose**: Catches critical application-level errors at the root level.

**Usage**: Already integrated in `app/layout.tsx` - wraps the entire application.

**Features**:

- Full-page error display
- Options to refresh page or go home
- Logs critical errors with context
- Styled with HandcraftedHub theme

### 2. PageErrorBoundary

**Location**: `components/page-error-boundary.tsx`

**Purpose**: Catches errors at the page level, allowing other parts of the app to continue functioning.

**Usage**:

```tsx
import PageErrorBoundary from "@/components/page-error-boundary";

export default function MyPage() {
  return (
    <PageErrorBoundary pageName="My Page">
      <PageContent />
    </PageErrorBoundary>
  );
}
```

**Features**:

- Page-level error display
- Options to try again or go back
- Logs errors with page context
- Doesn't crash the entire app

### 3. FormErrorBoundary

**Location**: `components/form-error-boundary.tsx`

**Purpose**: Catches errors in forms, preventing form crashes from affecting the rest of the page.

**Usage**:

```tsx
import FormErrorBoundary from "@/components/form-error-boundary";

export default function MyFormPage() {
  return (
    <FormErrorBoundary formName="Product Form">
      <MyForm />
    </FormErrorBoundary>
  );
}
```

**Features**:

- Form-specific error display
- Options to reload form or refresh page
- Logs errors with form context
- Preserves page navigation and other components

**Currently Used In**:

- Login page (`app/(auth)/login/page.tsx`)
- Signup page (`app/(auth)/signup/page.tsx`)
- Add Product page (`app/(seller)/products/add/page.tsx`)
- Edit Product page (`app/(seller)/products/[id]/edit/page.tsx`)

### 4. CartErrorBoundary

**Location**: `components/cart-error-boundary.tsx`

**Purpose**: Catches errors in the shopping cart, allowing users to continue shopping even if cart has issues.

**Usage**:

```tsx
import CartErrorBoundary from "@/components/cart-error-boundary";

export default function CartPage() {
  return (
    <CartErrorBoundary>
      <CartContent />
    </CartErrorBoundary>
  );
}
```

**Features**:

- Cart-specific error display
- Options to reload cart or continue shopping
- Logs errors with cart context
- Prevents cart errors from breaking the entire app

**Currently Used In**:

- Cart page (`app/cart/page.tsx`)

### 5. ErrorBoundary (Base Component)

**Location**: `components/error-boundary.tsx`

**Purpose**: Base error boundary component that all other error boundaries extend.

**Usage**:

```tsx
import ErrorBoundary from "@/components/error-boundary";

// With custom fallback
<ErrorBoundary
  fallback={(error, reset) => <CustomErrorUI error={error} onReset={reset} />}
  onError={(error, errorInfo) => console.log(error)}
  level="component"
>
  <MyComponent />
</ErrorBoundary>

// With default fallback
<ErrorBoundary level="component">
  <MyComponent />
</ErrorBoundary>
```

**Props**:

- `children`: React nodes to wrap
- `fallback`: Optional custom fallback UI function
- `onError`: Optional error handler callback
- `level`: Error boundary level ("root" | "page" | "component")

## Error Logging

All error boundaries use the centralized error logger located at `lib/error-logger.ts`.

### Error Logger Features

- **Development**: Logs detailed errors to console with grouping
- **Production**: Ready for integration with error tracking services (Sentry, LogRocket, etc.)
- **Context Enrichment**: Automatically adds timestamp, URL, user agent
- **User-Friendly Messages**: Converts technical errors to user-friendly messages

### Using the Error Logger

```tsx
import {
  logError,
  logWarning,
  getUserFriendlyErrorMessage,
} from "@/lib/error-logger";

// Log an error
try {
  // some code
} catch (error) {
  logError({
    error: error as Error,
    context: {
      component: "MyComponent",
      action: "submitForm",
      userId: user?.uid,
    },
    level: "error",
  });
}

// Get user-friendly message
const friendlyMessage = getUserFriendlyErrorMessage(error);
```

## Integration with Error Tracking Services

To integrate with services like Sentry, update `lib/error-logger.ts`:

```typescript
// In production block
if (process.env.NODE_ENV === "production") {
  if (typeof window !== "undefined" && window.Sentry) {
    window.Sentry.captureException(error, {
      level,
      extra: {
        ...enrichedContext,
        componentStack: errorInfo?.componentStack,
      },
    });
  }
}
```

## Best Practices

1. **Granular Boundaries**: Use specific error boundaries (Form, Cart) for critical components
2. **Page-Level Protection**: Wrap page content with PageErrorBoundary for isolation
3. **Root-Level Safety**: RootErrorBoundary is already in place as last resort
4. **Error Context**: Always provide meaningful context (page name, form name, etc.)
5. **User Experience**: Error boundaries show user-friendly messages, not technical details
6. **Logging**: All errors are logged for debugging and monitoring

## Testing Error Boundaries

To test error boundaries in development:

```tsx
// Create a component that throws an error
function BuggyComponent() {
  throw new Error("Test error!");
  return <div>This won't render</div>;
}

// Wrap it in an error boundary
<ErrorBoundary level="component">
  <BuggyComponent />
</ErrorBoundary>;
```

## Future Enhancements

- [ ] Integrate with Sentry or similar error tracking service
- [ ] Add error recovery strategies (retry logic)
- [ ] Implement error reporting to backend API
- [ ] Add user feedback mechanism for errors
- [ ] Create error analytics dashboard
- [ ] Add A/B testing for error messages
