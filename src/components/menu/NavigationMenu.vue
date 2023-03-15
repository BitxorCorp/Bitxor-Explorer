<template>
	<header
		class="ex-menu"
		:class="{'ex-menu-fixed': fixed }"
		ref="DesktopMenu"
	>
		<div sm="6" class="width-limiter2">
			<router-link to="/" :class="{'hide': !fixed}">
				<img src="../../styles/img/bitxor_logo_200px.png" class="menu-logo" width="30px" height="30px"/>
			</router-link>
			<router-link
				v-for="item in items"
				:key="'dsktp_mn_'+getNameByKey(item.text)"
				class="ex-menu-item"
				:to="item.to" exact active-class="active"
			>
				<img v-if="iconUrl(item.icon)" width="20px" height="20px" :src="iconUrl(item.icon)" class="menu-icon" alt="menu icon"/>
				<span>{{getNameByKey(item.text)}}</span>
			</router-link>
			
		</div>
        <ThemeToggle sm="6"  />
     			
	</header>
    
</template>

<script>
import { pageMenu } from '../../config/';
import SearchBox from '@/components/controls/SearchBox.vue';
import ThemeToggle from '../ThemeToggle.vue';
import MenuComponent from './MenuComponent.vue';

export default {
	extends: MenuComponent,

	components: {
        
		SearchBox,
		ThemeToggle
	},

	mounted () {
		let { DesktopMenu } = this.$refs;

		let offset = DesktopMenu.offsetTop;

		// window.onscroll = () => {
		// 	if (window.pageYOffset > offset) {
		// 		this.fixed = true;
        //     }
        //     else {
		// 		this.fixed = false;
        //     }
		// };
	},

	computed: {
		isTestnet () {
			return this.$store.getters['api/isTestnet'];
		}
	},

	data () {
		return {
			items: pageMenu.items,
			fixed: false,
			scrollListener: {}
		};
	}
};
</script>

<style lang="scss" scoped>
.header-gradinet {
    background: var(--navigation-bg);
}

.ex-menu {
    padding: 0 0px;
    position: relative;

    .width-limiter {
     /*   display: block;
        width: 100%;
        max-width: $navmenu-max-width;
        margin-left: auto;
        margin-right: auto;*/
    }

    .menu-logo {
        width: 30px;
        margin-right: 15px;
    }

    .ex-menu-item {
        padding: 0 20px;
        color: var(--light);
        margin-left: 8px;

        text-decoration: none;
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        letter-spacing: 1px;
        position: relative;
        transition: all 0.1s ease-in-out;
        width: auto;
        display: inline-block;
        font-size: 13px;
        line-height: 40px;
        background: linear-gradient(#735ca4, #000000);
        font-weight: 600;
        opacity: 0.8;
        text-transform: uppercase;

        .menu-icon {
            margin-right: 10px;
        }
    }

    .ex-menu-item.active {
        color: var(--white);
        font-weight: 600;
        opacity: 1;
        background-color: #082b32;
    }

    .ex-menu-item::before {
        opacity: 0;
        content: '';
        position: absolute;
        left: 0;
        width: 100%;
        height: 4px;
        background: var(--light);
        transition: all 0.2s ease-in-out;
        bottom: 0;
    }

    .ex-menu-item.active::before {
        background-color: #fff;
        opacity: 1;
    }
}

.ex-menu-fixed {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
}

.hide {
    display: none;
}
</style>
