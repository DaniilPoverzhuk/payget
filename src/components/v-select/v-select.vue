<template>
  <!-- eslint-disable no-use-before-define: 0 -->
  <div :dir="dir" class="v-input__container" :class="stateClasses">
    <div class="v-input__label-container">
      <label :for='`vs${uid}__combobox`'>{{ title }}</label>
    </div>
    <slot name="header" v-bind="scope.header" />
    <div :id="`vs${uid}__combobox`" ref="toggle" @mousedown="toggleDropdown($event)" class="v-input__input vs__dropdown-toggle" role="combobox" :aria-expanded="dropdownOpen.toString()" :aria-owns="`vs${uid}__listbox`" aria-label="Search for option">

      <div class="vs__selected-options" ref="selectedOptions">
        {{ selectedValue.length === 0 ?  $t('status.all') : `${$t('filter.selected')}: ${selectedValue.length}` }}

        <slot name="search" v-bind="scope.search">
          <input class="vs__search" v-bind="scope.search.attributes" v-on="scope.search.events">
        </slot>
      </div>

      <div class="vs__actions" ref="actions">
        <slot name="open-indicator" v-bind="scope.openIndicator">
          <svg width="9" height="6" viewBox="0 0 9 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 1.38618L1.35199 0L4.5 3.22763L7.64801 0L9 1.38618L4.5 6L0 1.38618Z" fill="#9A4FD5"/>
          </svg>
        </slot>
      </div>
    </div>
    <transition :name="transition">
      <ul ref="dropdownMenu" v-if="dropdownOpen" :id="`vs${uid}__listbox`" :key="`vs${uid}__listbox`" class="vs__dropdown-menu" role="listbox" tabindex="-1" v-append-to-body>
        <slot name="list-header" v-bind="scope.listHeader" />
        <li
          role="option"
          v-for="(option, index) in filteredOptions"
          :key="getOptionKey(option)"
          :id="`vs${uid}__option-${index}`"
          class="vs__dropdown-option"
          :class="{ 'vs__dropdown-option--selected': isOptionSelected(option), 'vs__dropdown-option--highlight': index === typeAheadPointer, 'vs__dropdown-option--disabled': !selectable(option) }"
          :aria-selected="index === typeAheadPointer ? true : null"
          @mouseover="selectable(option) ? typeAheadPointer = index : null"
          @mousedown.prevent.stop="selectable(option) ? select(option) : deselect(option)"
        >
          <input type="checkbox"
                 class="dropdown-checkbox mr-2"
                 :id="`vs${uid}__checkbox-${index}`"
                 name="status"
                 :value="getOptionKey(option)"
                 :checked="isOptionSelected(option)"
                 @mousedown.prevent.stop="selectable(option) ? select(option) : deselect(option)"
            />{{$t(getOptionLabel(option))}}
        </li>
        <li v-if="filteredOptions.length === 0" class="vs__no-options">
          <slot name="no-options" v-bind="scope.noOptions">Sorry, no matching options.</slot>
        </li>
        <slot name="list-footer" v-bind="scope.listFooter" />
      </ul>
      <ul v-else :id="`vs${uid}__listbox`" role="listbox" style="display: none; visibility: hidden;"></ul>
    </transition>
    <slot name="footer" v-bind="scope.footer" />
  </div>
</template>

<script>
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css'

export default {
  name: 'VSelect',
  mixins: [vSelect],
  props: {
    title: {
      type: String,
      default: () => '',
    },
    searchable: {
      type: Boolean,
      default: () => false,
    }
  },
  methods: {
    check(event) {
      event.preventDefault()
    },
    toggleOption(option) {
      if (this.isOptionSelected(option)) {
        this.deselect(option)
      } else {
        this.select(option)
      }
    },
  }
}
</script>

<style lang="scss">
.vs__dropdown-option {
  padding: 3px 8px;
}
.dropdown-checkbox {
  pointer-events: none;
}
.vs__dropdown-toggle {
  background: var(--c-white);
  padding: 10px 15px 4px;
  border-radius: var(--bdrs-default);
}
.vs__actions {
  margin-top: -10px;
}
</style>
