<template>
	<div class="tabs-badges mb-6">
		<div class="flex lg:hidden">
			<label for="tabs" class="sr-only">Select a tab</label>
			<select id="tabs" v-model="activeTab" name="tabs"
				class="block w-full border-2 border-gray-300 dark:border-primary dark:bg-gray-900 shadow-none focus:shadow-none ring-offset-0 outline-none rounded-md pl-3 pr-10 py-2 text-left focus:border-primary  focus:outline-none focus:ring-offset-0 ring-transparent">
				<option :key="list" v-for="(list, key) in labels" :some-data="key" :value="key">
					{{ $t(list.text) }}
				</option>
			</select>
			<slot />
		</div>
		<div class="xs:hidden">
			<div class="border-b border-gray-200 dark:border-gray-700 flex justify-between">
				<ul class="-mb-px flex space-x-8 lg:items-end" :class="{ 'justify-between w-full': stretch }"
					aria-label="Tabs">
					<template v-for="(list, key) in labels">
						<li :key="list" v-if="isExcludeRole(list)" :some-data="key">
							<input :id="list.value" v-model="activeTab" class="hidden" type="radio" name="request-filter">
							<label :for="list.value"
								:class="{ 'border-primary dark:border-primary hover:border-primary dark:hover:border-primary text-primary dark:text-primary hover:text-primary dark:hover:text-primary': getActive(key), 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-300 hover:border-primary dark:hover:border-primary': !getActive(key) }"
								class="cursor-pointer whitespace-nowrap flex py-4 px-1 border-b-2 font-medium text-base"
								@click="activeTab = key, $emit('back')"> {{ $t(list.text) }}
								<button v-if="tabsData !== null"
									class="border-0 bg-gray-100 dark:bg-gray-800 xs:hidden ml-3 py-0.5 px-2.5 rounded-full text-xs font-medium inline-block"
									:class="{ 'text-primary': getActive(key) && !showSettings, 'dark:bg-red text-gray-900 dark:text-white': !getActive(key) }">
									{{ tabsData[key] }}
								</button>
							</label>
						</li>
					</template>
				</ul>
				<slot />
			</div>
		</div>
	</div>
</template>

<script>
import { createNamespacedHelpers } from 'vuex'

const { mapState: mapUserState } = createNamespacedHelpers('user')

export default {
  name: 'TabsBadges',
  props: {
    labels: {
      type: Object,
      default: null,
    },
    tabsData: {
      type: Object,
      default: null,
    },
    firstTab: {
      type: String,
      default: 'all',
    },
    showSettings: {
      type: Boolean,
      default: false,
    },
    stretch: {
      type: Boolean,
      default: false,
    },
    noSetPath: {
      type: Boolean,
      default: false,
    },
  },
  data: () => ({
    activeTab: '',
  }),
  created() {
    this.activeTab = this.firstTab
  },
  computed: {
    ...mapUserState(['role']),
  },
  watch: {
    activeTab(newValue, oldValue) {
      this.setParamsPath()
    },
  },
  methods: {
    isExcludeRole(list) {
      if (list.excludeRole) {
        return list.excludeRole.includes(this.role)
      }
      return true
    },
    setParamsPath() {
      if (this.$route.query.tab !== this.activeTab) {
        if (!this.noSetPath) this.$router.push({ query: { tab: this.activeTab } })
        this.$emit('setPath', this.activeTab)
      }
    },
    getActive(key) {
      return (this.$route.query.tab ? this.$route.query.tab : this.activeTab) == key
    },
  },
}
</script>
