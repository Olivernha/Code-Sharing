import { ref } from 'vue'

export const useEditor = () => {
  const currentLanguage = ref('html')
  const currentTheme = ref('vs-dark')
  const currentLink = ref('')

  const defaultCode = ref(`<html>
  <head>
    <title>HTML Sample</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <style type="text/css">
      h1 {
        color: #cca3a3;
      }
    </style>
    <script type="text/javascript">
      alert("I am a sample... visit devChallengs.io for more projects");
    </script>
  </head>
  <body>
    <h1>Heading No.1</h1>
    <input disabled type="button" value="Click me" />
  </body>
</html>`)

  const setLanguage = (language) => {
    currentLanguage.value = language.toLowerCase()
  }

  const setTheme = (theme) => {
    currentTheme.value = theme === 'Dark' ? 'vs-dark' : 'vs'
  }

  const setLink = (link) => {
    currentLink.value = link
  }

  const setCode = (newCode) => {
    defaultCode.value = newCode
  }

  // Return reactive references, not their values
  return {
    defaultCode,
    currentLanguage,
    currentTheme,
    currentLink,
    setLanguage,
    setTheme,
    setLink,
    setCode
  }
}
