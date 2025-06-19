<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watchEffect, computed } from 'vue'
import * as monaco from 'monaco-editor';
import { useEditor } from '@/assets/composables/useEditor.js'

// Props for customization
defineProps({
  height: {
    type: String,
    default: '300px',
  },
  availableLanguages: {
    type: Array,
    default: () => ['HTML', 'CSS', 'JavaScript', 'TypeScript', 'Python', 'Java'],
  },
  availableThemes: {
    type: Array,
    default: () => ['Light', 'Dark'],
  },
  showShareButton: {
    type: Boolean,
    default: true,
  },
});

// Editor store
const editorStore = useEditor();
const editorContainer = ref(null);
let editor = null;

// Dropdown visibility
const showLanguages = ref(false);
const showThemes = ref(false);

// Close dropdowns when clicking outside
const closeDropdowns = () => {
  showLanguages.value = false;
  showThemes.value = false;
};

// Initialize the editor
onMounted(async () => {
  await nextTick();

  if (editorContainer.value) {
    try {
      // Configure Monaco Editor worker
      self.MonacoEnvironment = {
        getWorkerUrl: function (moduleId, label) {
          if (label === 'json') {
            return './vs/language/json/json.worker.js';
          }
          if (label === 'css' || label === 'scss' || label === 'less') {
            return './vs/language/css/css.worker.js';
          }
          if (label === 'html' || label === 'handlebars' || label === 'razor') {
            return './vs/language/html/html.worker.js';
          }
          if (label === 'typescript' || label === 'javascript') {
            return './vs/language/typescript/ts.worker.js';
          }
          return './vs/editor/editor.worker.js';
        }
      };

      editor = monaco.editor.create(editorContainer.value, {
        value: editorStore.defaultCode.value,
        language: editorStore.currentLanguage.value,
        theme: editorStore.currentTheme.value,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        automaticLayout: true,
        lineNumbers: 'on',
        roundedSelection: true,
        renderLineHighlight: 'all',
        fontSize: 14,
        wordWrap: 'on',
        folding: true,
        bracketMatching: 'always',
        mouseWheelZoom: true,
      });

      // Update store when editor content changes
      editor.onDidChangeModelContent(() => {
        editorStore.setCode(editor.getValue());
      });

      // Watch for theme changes
      watchEffect(() => {
        if (editor) {
          monaco.editor.setTheme(editorStore.currentTheme.value);
        }
      });

      // Watch for language changes
      watchEffect(() => {
        if (editor && editor.getModel()) {
          monaco.editor.setModelLanguage(editor.getModel(), editorStore.currentLanguage.value);
        }
      });

    } catch (error) {
      console.error('Failed to initialize Monaco Editor:', error);
    }
  }

  // Add click listener to close dropdowns
  document.addEventListener('click', closeDropdowns);
});

// Clean up the editor on component unmount
onBeforeUnmount(() => {
  if (editor) {
    editor.dispose();
  }
  document.removeEventListener('click', closeDropdowns);
});

// Change language handler
const changeLanguage = (language) => {
  editorStore.setLanguage(language);
  showLanguages.value = false;
};

// Change theme handler
const changeTheme = (theme) => {
  editorStore.setTheme(theme);
  showThemes.value = false;
};

// Share code functionality
const shareCode = async () => {
  if (editor) {
    const code = editor.getValue();
    console.log('Sharing code:', code);
    try {
      await navigator.clipboard.writeText(code);
      // You might want to show a toast notification instead of alert
      alert('Code copied to clipboard!');
    } catch (err) {
      console.error('Error copying code:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Code copied to clipboard!');
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        alert('Failed to copy code. Please copy it manually.');
      }
      document.body.removeChild(textArea);
    }
  }
};

// Prevent dropdown clicks from closing the dropdown
const stopPropagation = (event) => {
  event.stopPropagation();
};
const dynamicColor = computed(() => {
  return editorStore.currentTheme.value === 'vs-dark' ? '#1e1e1e' : '#fff';
});
</script>

<template>
  <div class="rounded-xl shadow-lg w-full" :style="{ backgroundColor: dynamicColor }">
    <!-- Code display area -->
    <div class="p-6 font-mono text-sm text-left">
      <div
        id="editor-container"
        ref="editorContainer"
        :style="{ height: height }"
        class="rounded border border-gray-700"
      ></div>
    </div>

    <!-- Footer with options -->
    <div class="flex items-center justify-between px-6 py-4">
      <div class="flex space-x-2">
        <!-- Language selector dropdown -->
        <div class="relative" @click="stopPropagation">
          <button
            @click="showLanguages = !showLanguages"
            class="px-3 py-1 bg-gray-200 rounded-full text-xs font-medium text-gray-700 flex items-center hover:bg-gray-300 transition-colors"
          >
            {{ availableLanguages.find(lang => lang.toLowerCase() === editorStore.currentLanguage.value) || editorStore.currentLanguage.value }}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <!-- Language dropdown menu -->
          <div
            v-if="showLanguages"
            class="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg z-20 max-h-48 overflow-y-auto border border-gray-200"
          >
            <div class="py-1">
              <button
                v-for="language in availableLanguages"
                :key="language"
                @click="changeLanguage(language.toLowerCase())"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                :class="{ 'bg-blue-50 text-blue-700': language.toLowerCase() === editorStore.currentLanguage.value }"
              >
                {{ language }}
              </button>
            </div>
          </div>
        </div>

        <!-- Theme selector dropdown -->
        <div class="relative" @click="stopPropagation">
          <button
            @click="showThemes = !showThemes"
            class="px-3 py-1 bg-gray-200 rounded-full text-xs font-medium text-gray-700 flex items-center hover:bg-gray-300 transition-colors"
          >
            {{ editorStore.currentTheme.value === 'vs' ? 'Light' : 'Dark' }}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <!-- Theme dropdown menu -->
          <div
            v-if="showThemes"
            class="absolute top-full left-0 mt-1 bg-white rounded-md shadow-lg z-20 border border-gray-200"
          >
            <div class="py-1">
              <button
                v-for="theme in availableThemes"
                :key="theme"
                @click="changeTheme(theme)"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
                :class="{ 'bg-blue-50 text-blue-700': (theme === 'Dark' && editorStore.currentTheme.value === 'vs-dark') || (theme === 'Light' && editorStore.currentTheme.value === 'vs') }"
              >
                {{ theme }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <button
        v-if="showShareButton"
        @click="shareCode"
        class="px-6 py-2 bg-blue-500 text-white rounded-full text-sm font-medium flex items-center hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share
      </button>
    </div>
  </div>
</template>

<style scoped>
#editor-container {
  min-height: 300px;
  border-radius: 0.25rem;
  overflow: hidden;
}
</style>
