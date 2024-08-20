<template lang="pug">
div.wysiwyg(
  v-if='text'
  v-html='text'
)
div.wysiwyg(
  v-else
)
  slot
</template>

<script>
export default {
  name: 'Wysiwyg',
  props: {
    text: {
      type: String,
      default: null,
    },
  },
}
</script>

<style lang="scss">
.wysiwyg {
  /* stylelint-disable
    selector-max-type,
    a11y/content-property-no-static-value,
    no-descending-specificity */

  h2,
  h3 {
    &:nth-child(n+2) {
      margin-top: 1.5em;
    }
  }

  a {
    color: var(--c-primary);

    &:hover,
    &:focus {
      color: var(--c-primary-dark);
    }
  }

  p {
    &:nth-child(n+2) {
      margin-top: 1em;
    }
  }

  ul,
  ol {
    font-weight: 600;

    &:nth-child(n+2) {
      margin-top: 1em;
    }

    li {
      margin-left: 1.5em;

      &:nth-child(n+2) {
        margin-top: 0.5em;
      }
    }
  }

  ul {
    li {
      &::before {
        float: left;
        content: '';
        display: block;
        margin: 0.65em 0 0 -1em;
        width: 6px;
        height: 6px;
        border-radius: var(--bdrs-round);
        border: 3px solid;
      }
    }
  }

  ol {
    counter-reset: list;

    li {
      counter-increment: list;

      &::before {
        float: left;
        content: counter(list) '.';
        display: block;
        margin: 0 0 0 -1.5em;
      }
    }
  }

  table {
    width: 100%;
    border-spacing: 0;
    border-collapse: collapse;
    font-size: var(--fz-sm);

    &:nth-child(n+2) {
      margin-top: 1em;
    }

    @media (min-width: 1200px) {
      font-size: var(--fz-md);
    }

    td {
      border: 1px solid var(--c-gray-10);
      padding: 5px 9px;

      @media (min-width: 1200px) {
        padding: 5px 15px;
      }
    }
  }

  img {
    display: block;
    max-width: 100%;
    height: auto;

    &:nth-child(n+2) {
      margin-top: 1em;
    }
  }

  code {
    display: block;
    overflow-x: auto;
    white-space: pre;

    &:nth-child(n+2) {
      margin-top: 1em;
    }
  }

  /* stylelint-enable */
}
</style>
