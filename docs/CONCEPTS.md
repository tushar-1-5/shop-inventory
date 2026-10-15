# Shop Inventory - Concepts Guide

This document covers every concept used to build this app. Each section gives a brief explanation — upload this file to Claude Chat and ask follow-up questions on any topic you want to go deeper on.

---

## Table of Contents
1. [React Fundamentals](#1-react-fundamentals)
2. [React Router v6](#2-react-router-v6)
3. [Vite Build Tool](#3-vite-build-tool)
4. [Supabase Overview](#4-supabase-overview)
5. [Supabase Authentication](#5-supabase-authentication)
6. [PostgreSQL Database Concepts](#6-postgresql-database-concepts)
7. [Row Level Security (RLS)](#7-row-level-security-rls)
8. [Database Triggers and Functions](#8-database-triggers-and-functions)
9. [Supabase Realtime](#9-supabase-realtime)
10. [PostgREST Query Syntax](#10-postgrest-query-syntax)
11. [CSS Modules](#11-css-modules)
12. [CSS Custom Properties](#12-css-custom-properties)
13. [date-fns Library](#13-date-fns-library)
14. [JavaScript Patterns Used](#14-javascript-patterns-used)
15. [Architecture Decisions](#15-architecture-decisions)

---

## 1. React Fundamentals

### What is React?
React is a JavaScript library for building user interfaces. Instead of manipulating the DOM directly, you describe what the UI should look like (using JSX), and React efficiently updates the real DOM to match.

### Functional Components
Every piece of UI in this app is a **functional component** — a JavaScript function that returns JSX.

```jsx
function StatsCard({ icon, label, value }) {
  return (
    <div className="card">
      <span>{icon}</span>
      <p>{value}</p>
      <p>{label}</p>
    </div>
  );
}
```

### JSX
JSX looks like HTML but is actually JavaScript. The curly braces `{}` let you embed expressions. Key differences from HTML: `className` instead of `class`, `htmlFor` instead of `for`, all tags must be closed.

### Props
Props are how parent components pass data to children. They are read-only — a child never modifies its own props.

### useState
Manages local state within a component. Returns a pair: the current value and a setter function.

```jsx
const [count, setCount] = useState(0);
// setCount(5) — replaces the value
// setCount(prev => prev + 1) — functional update, safer when depending on previous state
```

### useEffect
Runs side effects (data fetching, subscriptions, DOM updates) after the component renders.

```jsx
useEffect(() => {
  fetchData(); // runs after render
  return () => cleanup(); // runs on unmount or before re-running
}, [dependency]); // only re-runs when dependency changes
```

The dependency array is crucial: `[]` means "run once on mount", `[x]` means "re-run when x changes", and omitting it means "run after every render" (usually a bug).

### useContext
Accesses shared state without passing props through every component layer. This app uses it for auth state and toast notifications.

```jsx
const { user, signOut } = useContext(AuthContext);
```

### useCallback
Memoizes a function so it doesn't get recreated on every render. Important for functions passed to realtime subscriptions — without it, the subscription would restart on every render.

```jsx
const handleInsert = useCallback((newItem) => {
  setItems(prev => [...prev, newItem]);
}, []); // empty deps = function never changes
```

### Custom Hooks
Functions prefixed with `use` that compose built-in hooks. They let you extract and reuse stateful logic.

```jsx
// useProducts.js — encapsulates all product CRUD + real-time sync
function useProducts() {
  const [products, setProducts] = useState([]);
  // ... fetch, create, update, delete logic
  return { products, createProduct, updateProduct, deleteProduct };
}
```

### Conditional Rendering
Showing different UI based on state:

```jsx
{loading && <Spinner />}
{!loading && products.length === 0 && <EmptyState />}
{!loading && products.length > 0 && <ProductTable />}
```

### Lists and Keys
When rendering arrays, each element needs a unique `key` prop so React can efficiently track additions/removals:

```jsx
{products.map(p => <ProductRow key={p.id} product={p} />)}
```

### Controlled Forms
Form inputs whose values are controlled by React state. The input's `value` comes from state, and `onChange` updates that state:

```jsx
<input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
```

---

## 2. React Router v6

React Router handles navigation in single-page apps — instead of the browser loading a new HTML page, React swaps out components.

### Key Concepts

- **BrowserRouter** — wraps your app, enables URL-based routing
- **Routes / Route** — defines which component renders at which URL path
- **Link / NavLink** — `<a>` tags that navigate without page reload. `NavLink` adds an `isActive` prop for styling the current page
- **useNavigate** — programmatic navigation (e.g., after form submission: `navigate('/products')`)
- **useParams** — reads URL parameters (e.g., `/products/:id/edit` gives you `{ id: '...' }`)
- **Navigate** — component that redirects (e.g., `<Navigate to="/login" />` if not authenticated)

### Nested Routes
This app uses a nested route pattern where all authenticated routes are wrapped in `ProtectedRoute` and `Layout`:

```jsx
<Route path="/*" element={<ProtectedRoute><Layout><Routes>...</Routes></Layout></ProtectedRoute>} />
```

---

## 3. Vite Build Tool

### What it is
Vite (French for "fast") is a build tool and development server. It replaced Create React App as the standard way to start React projects.

### Why it's fast
- **Dev mode**: Uses native ES modules — your browser loads individual files directly, so Vite doesn't need to bundle everything on each change
- **Hot Module Replacement (HMR)**: When you save a file, only that module is replaced, not the entire page

### Key Features Used
- **Environment variables**: Prefixed with `VITE_`, accessed via `import.meta.env.VITE_SUPABASE_URL`
- **CSS Modules**: Files named `*.module.css` are automatically scoped to their component
- **Build command**: `npm run build` creates an optimized production bundle in `dist/`

---

## 4. Supabase Overview

Supabase is an open-source alternative to Firebase. It provides:
- **PostgreSQL database** — a real relational database, not a NoSQL document store
- **Authentication** — email/password, OAuth, magic links
- **Realtime** — WebSocket subscriptions that push database changes to clients
- **REST API** — automatically generated from your database schema (via PostgREST)

### Client Initialization
```javascript
import { createClient } from '@supabase/supabase-js';
export const supabase = createClient(url, anonKey);
```

The **anon key** is safe to expose in frontend code — it only grants access allowed by your RLS policies. The **service role key** (never used in this app) bypasses RLS and should never be in frontend code.

---

## 5. Supabase Authentication

### How it works
Supabase Auth uses JSON Web Tokens (JWTs). When a user signs in, they receive a JWT that the Supabase client automatically includes in every request. The JWT contains the user's ID, which the database uses for RLS policies.

### Methods used
- `supabase.auth.signUp({ email, password, options })` — creates an account
- `supabase.auth.signInWithPassword({ email, password })` — logs in
- `supabase.auth.signOut()` — ends the session
- `supabase.auth.getSession()` — checks for an existing session (persisted in localStorage)
- `supabase.auth.onAuthStateChange(callback)` — listener for session changes (login, logout, token refresh)

### User Metadata
On signup, we pass `options: { data: { display_name: '...' } }`. This is stored in `auth.users.raw_user_meta_data`, and our database trigger reads it to populate the `profiles` table.

---

## 6. PostgreSQL Database Concepts

### Data Types Used
- **uuid** — Universally Unique Identifier (128-bit random ID like `550e8400-e29b-41d4-a716-446655440000`)
- **text** — variable-length string
- **numeric(10,2)** — exact decimal number with up to 10 total digits and 2 decimal places. Used for money because `float` has rounding errors (0.1 + 0.2 = 0.30000000000000004)
- **integer** — whole numbers
- **boolean** — true/false
- **jsonb** — binary JSON. Stores structured data within a single column (we use it for change details in the activity log)
- **timestamptz** — timestamp with time zone, stored in UTC

### Constraints
- **PRIMARY KEY** — uniquely identifies each row. We use UUIDs, not auto-incrementing integers
- **FOREIGN KEY** — references a row in another table (e.g., `category_id` references `categories.id`)
- **NOT NULL** — column cannot be empty
- **UNIQUE** — no two rows can have the same value (e.g., product SKU)
- **CHECK** — validates a condition (e.g., `quantity >= 0`)
- **DEFAULT** — value used when none is provided (e.g., `now()` for timestamps)

### ON DELETE behavior
- **CASCADE** — when the referenced row is deleted, delete this row too (profiles when auth user is deleted)
- **SET NULL** — when the referenced row is deleted, set this column to NULL (products when category is deleted)

### Why UUID instead of auto-increment?
1. No sequential ID leaking — can't guess how many records exist
2. Safe for distributed systems — IDs can be generated anywhere without collision
3. Natural fit for Supabase's `gen_random_uuid()` default

---

## 7. Row Level Security (RLS)

### What it is
RLS is a PostgreSQL feature that adds per-row access control at the database level. Even if someone intercepts the API key, they can only access rows that the policies allow.

### How it works
Every query goes through RLS policies before returning results:
- **USING clause** — filters which rows a user can SELECT, UPDATE, or DELETE
- **WITH CHECK clause** — validates which rows a user can INSERT or UPDATE to

### Our policies
Since this is a team app where everyone shares the same inventory, all policies simply check `TO authenticated` — any logged-in user can see and modify everything:

```sql
CREATE POLICY "Authenticated users can view all products"
  ON public.products FOR SELECT TO authenticated USING (true);
```

The activity log only allows SELECT and INSERT (no UPDATE or DELETE), making it an append-only audit trail.

### auth.uid()
A built-in Supabase function that returns the current user's ID from their JWT. Used in RLS policies and trigger functions.

---

## 8. Database Triggers and Functions

### What is a Trigger?
A trigger is code that runs automatically when data changes. Think of it as a database-level event listener.

```
INSERT into products → trigger fires → log_product_changes() runs → activity_log row inserted
```

### BEFORE vs AFTER
- **BEFORE** triggers run before the change is committed — can modify the data (we use this for `updated_at`)
- **AFTER** triggers run after the change is committed — used for logging (the data is final)

### PL/pgSQL
The procedural language used to write trigger functions. Key concepts:
- `NEW` — the new row (available in INSERT and UPDATE)
- `OLD` — the old row (available in UPDATE and DELETE)
- `TG_OP` — the operation: 'INSERT', 'UPDATE', or 'DELETE'
- `IS DISTINCT FROM` — like `!=` but handles NULL correctly (`NULL != NULL` is NULL, but `NULL IS DISTINCT FROM NULL` is false)

### SECURITY DEFINER
The function runs with the permissions of the user who created it (the database admin), not the calling user. This is necessary because the trigger function needs to insert into `activity_log` even though RLS might restrict direct inserts.

### Why triggers over app-level logging?
If logging is done in the app code, a bug could skip the logging call. Triggers fire no matter how the data changes — from the app, from the SQL editor, from another service. 100% audit coverage guaranteed.

---

## 9. Supabase Realtime

### How it works
When Realtime is enabled on a table, Supabase opens a WebSocket connection. The server pushes events (INSERT, UPDATE, DELETE) to connected clients instantly.

### Postgres Changes
```javascript
supabase
  .channel('products-changes')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'products' },
    (payload) => console.log('New product:', payload.new)
  )
  .subscribe();
```

### Channels
Each subscription lives on a named channel. When a component unmounts, it removes the channel to prevent memory leaks:

```javascript
return () => supabase.removeChannel(channel);
```

### Why not polling?
Polling (fetching data every N seconds) wastes bandwidth and has latency. Realtime pushes changes instantly with minimal overhead.

---

## 10. PostgREST Query Syntax

Supabase's JS client translates method chains into REST API calls:

```javascript
// SELECT * FROM products WHERE category_id = '...' ORDER BY name LIMIT 10
supabase.from('products').select('*').eq('category_id', id).order('name').limit(10);

// Foreign key join — fetches category name alongside each product
supabase.from('products').select('*, categories(name)');

// INSERT
supabase.from('products').insert({ name: 'Widget', sku: 'WDG-001' }).select().single();

// UPDATE
supabase.from('products').update({ quantity: 50 }).eq('id', productId);

// DELETE
supabase.from('products').delete().eq('id', productId);

// Pagination
supabase.from('activity_log').select('*').range(0, 49); // rows 0-49
```

Every call returns `{ data, error }` — always check `error` before using `data`.

---

## 11. CSS Modules

### What they are
CSS Modules are CSS files where class names are scoped to the component that imports them. A class `.button` in `Button.module.css` becomes something like `.Button_button_a1b2c` in the browser, preventing name collisions.

### How to use
```jsx
import styles from './Button.module.css';
// styles.button → the hashed class name
<button className={styles.button}>Click</button>
```

### Multiple classes
```jsx
<button className={`${styles.button} ${styles.primary}`}>
```

### Why not Tailwind CSS?
CSS Modules keep styling in standard CSS files (easier to learn, no utility class memorization). Tailwind is powerful but adds a learning layer on top of CSS. For a learning project, understanding raw CSS is more valuable.

---

## 12. CSS Custom Properties

### What they are
CSS variables defined with `--` prefix, used with `var()`:

```css
:root {
  --color-primary: #2563eb;
  --spacing-button: 12px;
}

.button {
  background: var(--color-primary);
  gap: var(--spacing-button);
}
```

### Why we use them
- **Consistency** — change a color in one place, it updates everywhere
- **Requirements** — the 12px button spacing is defined once as `--spacing-button: 12px`
- **Theming** — could easily add dark mode by redefining variables

---

## 13. date-fns Library

### What it is
A modern JavaScript date utility library. Unlike the older Moment.js, date-fns is:
- **Tree-shakable** — you import only the functions you use, keeping bundle size small
- **Immutable** — functions return new Date objects instead of modifying the original

### Functions we use
```javascript
import { format, formatDistanceToNow } from 'date-fns';

format(new Date(), 'dd MMM yyyy, hh:mm a');
// → "14 Oct 2026, 03:30 PM"

formatDistanceToNow(new Date('2026-10-14T15:00:00'), { addSuffix: true });
// → "5 minutes ago"
```

---

## 14. JavaScript Patterns Used

### Async/Await
Modern way to handle promises (asynchronous operations like API calls):

```javascript
async function fetchProducts() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) throw error;
  return data;
}
```

### Destructuring
Extract values from objects/arrays in one step:

```javascript
const { data, error } = await supabase.from('products').select('*');
const [first, ...rest] = items;
```

### Optional Chaining (?.)
Safely access nested properties that might be null:

```javascript
profile?.display_name?.charAt(0) // returns undefined instead of throwing if profile is null
```

### Spread Operator
Copy and extend objects:

```javascript
setForm(prev => ({ ...prev, name: newName })); // copy all fields, override name
```

### Debouncing
Delay an action until the user stops typing (used in search):

```javascript
useEffect(() => {
  const timer = setTimeout(() => onChange(value), 300);
  return () => clearTimeout(timer); // cancel if user types again before 300ms
}, [value]);
```

### Functional State Updates
When the new state depends on the previous state, use a function:

```javascript
setItems(prev => [...prev, newItem]); // ✅ always uses the latest state
setItems([...items, newItem]); // ❌ might use stale closure value
```

---

## 15. Architecture Decisions

### Database triggers for logging
Logging in the app code is fragile — a missing await, a caught exception, or a code path that bypasses the logging function means lost audit data. Database triggers are guaranteed to fire on every change.

### NUMERIC(10,2) for money
Floating point numbers (`float`, `double`) can't exactly represent all decimal values. `0.1 + 0.2 = 0.30000000000000004` in JavaScript. NUMERIC stores exact decimal values, critical for financial calculations.

### Context API over Redux
Redux is a powerful state management library, but for a small team app with simple state needs, React's built-in Context API is sufficient and doesn't add another dependency.

### Separate quantity_changed action
Stock movements (receiving shipments, sales) are the most common and important operations. Having a dedicated action type lets you filter the activity log to see "what moved" separately from "what was edited" (name changes, price updates).

### Append-only activity_log
No UPDATE or DELETE policies. Once a log entry is created, it can never be modified or removed. This guarantees a tamper-proof audit trail.

---

## What to Explore Next

- **Supabase Storage** — upload product images directly instead of using URLs
- **Supabase Edge Functions** — server-side logic (e.g., send email alerts for low stock)
- **Dark mode** — redefine CSS custom properties under `@media (prefers-color-scheme: dark)`
- **Export/Import** — CSV export of inventory data
- **Barcode scanning** — integrate a barcode reader for faster stock management
- **Role-based access** — admin vs. staff permissions using RLS
- **Charts** — add inventory value trends using a charting library like Recharts

---

*Upload this file to Claude Chat and ask "Explain [topic] in more detail" or "Give me a hands-on exercise for [concept]" to go deeper on anything.*
