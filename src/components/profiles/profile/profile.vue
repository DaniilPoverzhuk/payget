<template>
    <div class="profile-settings__wrap profile">
        <div class="profile-settings__col">
            <div class="profile-settings__row">
                <h3 class="profile-settings__subtitle">{{ $t('user.avatarBanner') }}</h3>
                <ProfilePhoto></ProfilePhoto>
            </div>
            <hr class="profile-settings__hr" />
            <div class="profile-settings__row color-theme">
                <h3 class="profile-settings__subtitle">{{ $t('user.colorThemes') }}</h3>
                <div class="color-theme__wrap"><button class="color-theme__btn" :class="{'color-theme__btn--selected': color_theme === 'light'}" @click="updateColorTheme('light')"><svg class="color-theme__icon" v-svg size="24" symbol="sun-outline"></svg>{{ $t('user.lightVersion') }}</button><button class="color-theme__btn profile-settings__theme-button" :class="{'color-theme__btn--selected': color_theme == 'dark'}" @click="updateColorTheme('dark')"><svg class="color-theme__icon" v-svg size="24" symbol="moon-outline"></svg>{{ $t('user.darkVersion') }}</button></div>
            </div>
        </div>
        <div class="profile-settings__col">
            <div class="profile-settings__row profile-settings__row--right">
                <PersonalData></PersonalData>
            </div>
            <hr class="profile-settings__hr" />
        </div>
    </div>
</template>

<script>
import { useStore } from 'vuex'

import ProfilePhoto from 'src/components/profile-photo/profile-photo.vue'
import PersonalData from 'src/components/personal-data/personal-data.vue'
import {computed} from 'vue'
export default {
  name: 'Profile',
  components: {
    ProfilePhoto,
    PersonalData,
  },
  setup() {
    const $store = useStore()
    const color_theme = computed(() => $store.state.user.color_theme)
    const updateColorTheme = (theme) => {
      if(theme !== $store.state.user.color_theme) {
        $store.commit('user/setTheme', theme)
        $store.dispatch('user/update', {
          color_theme: color_theme.value,
        })
      }
    }
    return {
      updateColorTheme,
      color_theme
    }
  },
}
</script>
