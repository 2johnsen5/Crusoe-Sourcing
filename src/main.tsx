**File 3 — type this exact name:** `src/main.tsx`

(When you type the `/` it will automatically create the `src` folder for you)

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

Commit it, then tell me when done.
  
