<template>
	<div class="tabs-badges mb-6">
		<div class="line-bottom ">
			<q-tabs
				no-caps
				align="left"
				class="justify-between"
				active-color="primary"
			>
				<template v-for="(item, key) in labels" :key="key">
					<q-route-tab v-if="isExcludeRole(item)" class="px-1" :to="{ query: { tab: key } }" exact replace :label="$t(item.text)" @click="navPass(key)">
						<button v-if="tabsData !== null"
							class="border-0 bg-gray-100 dark:bg-gray-800 xs:hidden ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium inline-block"
							:class="{ 'text-primary': getActive(key) && !showSettings, 'dark:bg-red text-gray-900 dark:text-white': !getActive(key) }">
							{{ tabsData[key] }}
						</button>
					</q-route-tab>
				</template>
				<div v-if="isSlot" class="ml-auto">
					<slot />
				</div>
			</q-tabs>
		</div>
	</div>
</template>

<script>
import {useRoute, useRouter} from 'vue-router'
import {ref, computed} from 'vue'
import { useStore } from 'vuex'
export default {
  props: {
    labels: {
      type: Object,
      default: null,
    },
    tabsData: {
      type: Object,
      default: null,
    },
    showSettings: {
      type: Boolean,
      default: false,
    },
    firstTab: {
      type: String,
      default: 'all',
    },
    noSetPath: {
      type: Boolean,
      default: false,
    },
  },
  setup (props, {emit, slots}) {
    const route = useRoute()
    const $store = useStore()
    const router = useRouter()
    const isSlot = computed(() => !!slots.default)
    const activeTab = ref(props.firstTab)
    const toDefault = props.labels && !!route.query.tab ? !Object.keys(props.labels).includes(route.query.tab) : true
    if(!route.query.tab || toDefault) {
      if (!props.noSetPath) {
        router.push({ query: { tab: activeTab.value } })
        emit('setPath', activeTab.value)
      }
    }

    function navPass (e) {
      activeTab.value = e
      emit('setPath', e)
    }

    function isExcludeRole(label) {
      if (label.excludeRole) {
        return label.excludeRole.includes($store.state.user.role)
      }
      return true
    }

    function getActive(key) {
      return (route.query.tab ? route.query.tab : activeTab.value) == key
    }

    return { activeTab, navPass, getActive, isSlot, isExcludeRole }
  }
}
</script>

<style lang="scss">
.tabs-badges {
	.line-bottom {
		box-shadow: inset 0px -1px 0px rgba(229, 231, 235, 1);
	}
	.q-tab__label {
		font-size: 16px;
	}
	.q-tabs__content {
		gap: 32px;
	}
	.q-tab__content {
		flex-direction: row;
	}
}
</style>