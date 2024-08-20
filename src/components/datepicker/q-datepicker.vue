<template>
  <div class="q-datepicker" :class="{ dark: isDark }" :style="{ maxWidth: width }">
    <q-input filled v-model="localValue" :dark="isDark" outlined :dense="false" mask="####-##-##" readonly @click="$refs.popupProxy.show()" class="flex-grow-1">
      <template v-slot:prepend>
        <q-icon name="event" class="cursor-pointer" @click="$refs.popupProxy.show()"> </q-icon>
      </template>
      <template #default>
        <q-popup-proxy ref="popupProxy" no-parent-event cover transition-show="scale" transition-hide="scale">
          <q-date :dark="isDark" v-model="localValue" :locale="currentLocale" mask="YYYY-MM-DD" @update:modelValue="$refs.popupProxy.hide()">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </template>
      <template v-if="localValue" v-slot:append>
        <q-icon @click="clearValue" name="close" class="cursor-pointer"> </q-icon>
      </template>
    </q-input>
  </div>
</template>

<script>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import { useI18n } from 'vue-i18n'

export default {
  props: {
    modelValue: {
      type: String,
      default: '',
      required: true,
    },
    width: {
      type: String,
      default: '100%',
    },
  },
  emits: ['update:modelValue'],
  setup(emits) {
    const $store = useStore()
    const isDark = computed(() => $store.state.user.color_theme === 'dark')
    const { locale } = useI18n({ useScope: 'global' })
    const currentLocale = computed(() => {
      if (locale.value !== 'ru-RU') {
        return {}
      }
      return {
        days: 'Воскресенье_Понедельник_Вторник_Среда_Четверг_Пятница_Суббота_Воскресенье'.split('_'),
        daysShort: 'Вс_Пн_Вт_Ср_Чт_Пт_Сб'.split('_'),
        months: 'Январь_Февраль_Март_Апрель_Май_Июнь_Июль_Август_Сентябрь_Октябрь_Ноябрь_Декабрь'.split('_'),
        monthsShort: 'Янв_Фев_Мар_Апр_Май_Июн_Июл_Авг_Сен_Окт_Ноя_Дек'.split('_'),
      }
    })
    return {
      isDark,
      currentLocale,
    }
  },
  computed: {
    localValue: {
      get() {
        return this.modelValue
      },
      set(value) {
        this.$emit('update:modelValue', value)
      },
    },
  },
  methods: {
    clearValue() {
      this.$emit('update:modelValue', '')
    },
  },
}
</script>

<style lang="scss">
.q-datepicker {
  &.dark {
    .q-field__marginal,
    .q-field__native {
      color: #cecece;
    }
  }
  [type='text'] {
    background-color: inherit;
    max-height: 44px;
    &:focus {
      border-color: inherit;
      box-shadow: none;
    }
  }
  .q-field--filled {
    .q-field__control {
      border-radius: 4px;
      border-width: 2px;
      height: 48px;
      background-color: transparent;
      border-color: #d1d5db;
      &::before {
        border: none;
      }
    }
    .q-field__prepend,
    .q-field__append {
      height: 44px;
      padding-bottom: 0;
    }
  }
}
</style>
