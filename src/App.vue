<template>
  <div
    class="min-h-screen relative overflow-hidden bg-[#406AFF]"
    :style="{ backgroundImage: `url('@/src/assets/resources/Hero-Background-notecode@2x.png')`, backgroundSize: 'cover', backgroundPosition: 'center -200px', backgroundRepeat: 'no-repeat' }"
  >

    <div class="px-4 py-8 flex flex-col items-center justify-center">
      <!-- Header -->
     <TheHeader />

      <!-- Code Editor -->
      <CodeEditor class="max-w-3xl" height="450px"
                  :available-languages="['HTML', 'CSS', 'JavaScript', 'TypeScript', 'Python', 'Java']"
                  :available-themes="['Light', 'Dark']" :show-share-button="true" />
    </div>
  </div>
</template>

<script setup>
// Component logic can be added here if needed
import TheHeader from '@/components/TheHeader.vue'
import CodeEditor from '@/components/CodeEditor.vue'
</script>

<style scoped>
/* Additional custom styles if needed */
</style>
