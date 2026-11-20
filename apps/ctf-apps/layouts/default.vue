<script setup>
useHead({
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
