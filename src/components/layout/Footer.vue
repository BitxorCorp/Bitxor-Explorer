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
	<div class="page-footer">
		<footer class="footer">
			<div class="width-limiter2">
				<b-container fluid>
					
                    <b-row class="footer-row">
                         <b-col sm="3" class="vertical-center">
							<LanguageSelector class="d-none d-md-block language-selector"/>
						</b-col>
                        <b-col sm="6" class="vertical-center">
							<ul class="social-icon">
								<li
									v-for="item in footerItems"
									:key="item.text"
									class="social-icon-item"
								>
									<a target="_blank" :href="item.href">
										<component :is="item.icon" />
										<span>{{item.text}}</span>
									</a>
								</li>
							</ul>
						</b-col>
                       
						<b-col sm="3" class="vertical-center">
							<NodeSelector class="horisontal-center"/>
						</b-col>
                            	</b-row>
					<BitxorCopyRight />
				</b-container>
			</div>
		</footer>
	</div>
</template>

<script>
import BitxorCopyRight from '@/components/BitxorCopyRight.vue';
import NodeSelector from '@/components/controls/NodeSelector.vue';

import LanguageSelector from '@/components/controls/LanguageSelector.vue';
import IconGithub from 'vue-material-design-icons/Gitlab.vue';
import IconNewspaper from 'vue-material-design-icons/Newspaper.vue';
import IconFacebook from 'vue-material-design-icons/Facebook.vue';
import IconDiscord from 'vue-material-design-icons/Discord.vue';
import IconTwitter from 'vue-material-design-icons/Twitter.vue';
import IconTelegram from 'vue-material-design-icons/Send.vue';
import IconForum from 'vue-material-design-icons/Forum.vue';
import IconReddit from 'vue-material-design-icons/Reddit.vue';
import IconInstagram from 'vue-material-design-icons/Instagram.vue';
import IconHomeCurrencyUsd from 'vue-material-design-icons/CurrencyUsd.vue';
import globalConfig from '../../config/globalConfig';

export default {
	components: {
		BitxorCopyRight,
		NodeSelector,
LanguageSelector,
		IconGithub,
        IconInstagram,
        IconReddit,
        IconTelegram,
		IconNewspaper,
		IconDiscord,
        IconForum,
		IconHomeCurrencyUsd,
		IconTwitter,
        IconFacebook
	},

	computed: {
		footerItems () {
			if (this.$store.getters['api/isTestnet'])
				return globalConfig.footer.link;

			return globalConfig.footer.link.filter(item => 'Faucet' !== item.text);
		}
	}
};
</script>

<style lang="scss" scoped>
.page-footer {
    width: 100%;
}

.footer {
    padding: 50px 0 0;
    width: 100%;
    position: relative;

    .footer-row {
        .footer-description {
            margin-top: -40px;
        }
    }
}

.footer::before {
    content: '';
   
    position: absolute;
    z-index: 0;
    bottom: 0;
    right: 0;
    width: 100%;
    height: 100%;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
}

.social-icon {
    list-style: none;
    justify-content: center;
    flex-wrap: wrap;
    display: flex;
    padding: 0;
    margin: 0 -15px;

    .social-icon-item {
        margin: 5px 10px;
        text-transform: uppercase;

        a {
            color: var(--clickable-text);
            text-decoration: none;

            span {
                margin-left: 5px;
            }

            i {
                font-size: 15px;
            }
        }
    }
}

.vertical-center {
    margin-top: 5px;
    display: flex;
    justify-content: center;
}

.horisontal-center {
    display: block;
    margin-left: auto;
    margin-right: auto;
}

.width-limiter {
  /*  display: block;
    width: 100%;
    max-width: $footer-max-width;
    margin-left: auto;
    margin-right: auto;*/
}

@media (max-width: 764px) {
    .social-icon {
        justify-content: center;
    }
}
</style>
