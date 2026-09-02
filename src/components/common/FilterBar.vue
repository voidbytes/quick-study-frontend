<template>
  <div class="filter-bar">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  margin-bottom: var(--space-5);
}
</style>
