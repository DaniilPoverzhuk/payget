<template>
    <div class="editor-hint">
        <div class="editor-hint__wrap"><svg class="editor-hint__icon" v-svg aria-hidden="true" size="16" symbol="info"></svg>
            <p class="editor-hint__text" :class="{'editor-hint__text--error': error}">{{label}}<a class="editor-hint__href" v-if="hrefText" :href="href" :target="target">&nbsp;{{hrefText}}</a></p>
        </div>
    </div>
</template>

<script>
export default {
  name: 'EditorHint',
  props: {
    label: {
      type: String,
      default: '',
    },
    href: {
      type: String,
      default: '',
    },
    hrefText: {
      type: String,
      default: '',
    },
    error: {
      type: Boolean,
      default: false,
    },
    target: {
      type: String,
      default: '_self',
    },
  },
}
</script>

<style lang="scss">
.editor-hint {
  &__wrap {
    display: flex;
    align-items: flex-start;
  }

  &__icon {
    margin-right: 8px;
    flex-shrink: 0;
    margin-top: 5px;
  }

  &__text {
    font-size: 16px;
    color: var(--c-gray-70);

    &--error {
       color: var(--c-red-70);
    }
  }

  &__href {
    color: var(--c-primary);
    text-decoration: none;
    font-weight: var(--fw-600);
  }
}
</style>
