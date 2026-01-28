That error happens because your file is **not in `<script setup>` mode**, so Vue’s template type-checker thinks `props` should be a component instance property (Options API), but it isn’t.

In your screenshot, your component has:

```html
<script lang="ts">
  const props = defineProps(...)
</script>
```

✅ `defineProps()` only works in **`<script setup>`**.
So TypeScript says: **“Property 'props' does not exist”**.

---

## Fix (recommended): switch to `<script setup>` and use props correctly

### `PageLoader.vue` (working version)

```vue
<script setup lang="ts">
type ValidationErrors = Record<string, string[]> | null

const props = defineProps<{
  busy: boolean
  error: string | null
  validationErrors?: ValidationErrors
  loadingText?: string
}>()
</script>

<template>
  <div class="page-loader">
    <div v-if="props.error" class="error">
      {{ props.error }}
    </div>

    <div v-if="props.validationErrors && Object.keys(props.validationErrors).length" class="validation">
      <div class="validation-title">Please fix the following:</div>
      <ul>
        <li v-for="(msgs, key) in props.validationErrors" :key="key">
          <strong>{{ key }}:</strong> {{ msgs.join(', ') }}
        </li>
      </ul>
    </div>

    <div v-if="props.busy" class="loading">
      {{ props.loadingText ?? 'Loading...' }}
    </div>

    <div class="content" :aria-busy="props.busy ? 'true' : 'false'">
      <slot />
    </div>
  </div>
</template>
```

### Even cleaner: don’t use `props.` in template

Vue auto-exposes props in `<script setup>`, so you can do:

```vue
<script setup lang="ts">
type ValidationErrors = Record<string, string[]> | null
const { busy, error, validationErrors, loadingText } = defineProps<{
  busy: boolean
  error: string | null
  validationErrors?: ValidationErrors
  loadingText?: string
}>()
</script>

<template>
  <div v-if="error">{{ error }}</div>
  <div v-if="busy">{{ loadingText ?? 'Loading...' }}</div>
</template>
```

---

## Alternative fix (if you do NOT want script setup)

Then you must define props via Options API:

```vue
<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    busy: { type: Boolean, required: true },
    error: { type: String, required: false, default: null },
    validationErrors: { type: Object, required: false, default: null },
    loadingText: { type: String, required: false, default: 'Loading...' },
  },
})
</script>

<template>
  <div v-if="error">{{ error }}</div>
</template>
```

But for your architecture, **`<script setup>` is the right move**.

---

## Quick checklist

* ✅ Ensure the tag is exactly: `<script setup lang="ts">`
* ✅ Keep `defineProps` inside it
* ✅ Restart VS Code TS server if it still shows old errors:

  * Command Palette → **TypeScript: Restart TS Server**

If you paste your current `PageLoader.vue` content, I’ll edit it exactly to match your styling + existing components (and avoid breaking your SCSS pipeline).
