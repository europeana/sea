<script setup>
useHead({
  link: [
    // Version is locked, re-implement version lookup via pkg-versions.js.
    {
      rel: "preload",
      as: "style",
      href: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css`,
    },
    {
      rel: "stylesheet",
      href: `https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css`,
    },
  ],
  meta: [{ hid: "robots", name: "robots", content: "noindex" }],
});
</script>

<template>
  <div>
    <main role="main">
      <slot />
    </main>
  </div>
</template>
