<template>
  <div
    class="layout"
  >
    <header>
      <span>
        Pinceau 🖌
      </span>
    </header>

    <slot />

    <footer>
      <span>
        {{ 'Footer' }}
      </span>

      <span>Built with @nuxtjs/design-tokens</span>
    </footer>
  </div>
</template>

<style lang="postcss">
html, body, #app, #__nuxt {
  min-height: 100vh;
  width: 100vw;
  font-family: $dt('fonts.primary') !important;

  @light {
    color: black;
    background-color: red;
  }

  @dark {
    color: white;
    background-color: black;
  }
}
</style>

<style lang="postcss">
.layout {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  overflow-y: auto;
  color: white;
  margin: 0;
  padding: 0;

  header {
    flex: 0;
    display: flex;
    align-items: center;
    padding: 1rem 2rem;
    position: sticky;
    top: 0;
    width: 100%;
    background-color: $dt('colors.black');
    z-index: 50;
    span {
      font-weight: bold;
    }
  }

  footer {
    flex: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    position: sticky;
    top: 0;
    width: 100%;
    background-color: $dt('colors.black');
    z-index: 50;
    span {
      font-weight: bold;
    }
  }
}
</style>

