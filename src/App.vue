/*
 *
 * Copyright 2022 Bitxor Community
 *
 * Licensed under the Apache License, Version 2.0 (the "License ");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

<template>
	<div id="app">
		<div class="app-content">
			<MobileMenu class="d-block d-md-none"/>
			<Header />
		

			<div class="width-limiter2">
				<div class="px-0 py-0 container-fluid"><div class="row my-4 mx-0 mx-xs-0 mx-md-4 mx-lg-8"><div xs="12" class="col-md-12 col-lg-12" style="display: flex;"><div data-v-68fa2aa6="" data-v-3141ce53="" class="card ex-card" style="width: 100%;"><!----><!----><SearchBox class='search-box card-body' /><!----><!----><!----><!----><!----><!----></div></div></div></div>
				<transition name="view">
					<router-view :key="$route.fullPath"/>
				</transition>
			</div>
		</div>
		<Footer />
	</div>
</template>

<script>
import Footer from '@/components/layout/Footer.vue';
import SearchBox from '@/components/controls/SearchBox.vue';

import MobileMenu from '@/components/menu/MobileMenu.vue';
import Header from '@/components/layout/Header.vue';

export default {
	components: {
		Footer,
		SearchBox,
		MobileMenu,
		Header
	},

	data: () => {
		return {
			info: 1
		};
	},
	created () {
		this.initialize();
	},
	destroyed () {
		this.uninitialize();
	},
	methods: {
		initialize () {
			this.$store.dispatch('api/initialize')
				.catch(error => console.log(error));
		},
		uninitialize () {
			this.$store.dispatch('uninitialize');
		}
	}
};
</script>

<style lang="scss">
html, body, #fullheight {
    min-width: 100% !important;
    width: 100%;
}

#app {
    height: 100vh;
    width: 100%;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: space-between;
    flex-direction: column;
}

.app-content {
    width: 100%;
}

.width-limiter {
    display: block;
    width: 100%;
    max-width: $page-max-width;
    margin-left: auto;
    margin-right: auto;
}

.noselect {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    outline: 0;
}

.pointer {
    cursor: pointer;
}

.view-leave-active {
    transition: opacity 0.15s ease-in-out, transform 0.15s ease;
}

.view-enter-active {
    transition: opacity 0.15s ease-in-out, transform 0.15s ease;
    transition-delay: 0.15s;
}

.view-enter, .view-leave-to {
    opacity: 0;
}

.view-enter-to, .view-leave {
    opacity: 1;
}
</style>
