@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

body {
  @apply bg-brand-950 text-slate-100 antialiased;
}

* {
  box-sizing: border-box;
}

button,
input,
textarea,
select {
  font: inherit;
}
