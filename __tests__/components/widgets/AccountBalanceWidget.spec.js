import Vuex from 'vuex';
import { createLocalVue, mount } from '@vue/test-utils'
import AccountBalanceWidget from '@/components/widgets/AccountBalanceWidget.vue';
import { i18n } from '@/config';

const setupStoreMount = (token) => {
  const accountModule = {
    namespaced: true,
    getters: {
        OwnedToken:() => ({
            loading: false,
            error: false
        }),
        balanceWidget: () => ({
          address: "TDS44G6KUHO7MODUB6E6WVJOK277QY65XCBJX5Y",
          token,
          alias: ["N/A"],
        })
    },
  };

  const uiModule = {
    namespaced: true,
    getters: {
      getNameByKey: state => key => i18n.getName(key),
    },
  };

  const store = new Vuex.Store({
    modules: {
        account: accountModule,
        ui:uiModule
    },
  });

  const propsData = {
    managerGetter: "account/OwnedToken",
    dataGetter: "account/balanceWidget",
    title: 'accountBalanceTitle'
  }

  return mount(AccountBalanceWidget, {
    store,
    localVue,
    propsData,
    stubs: {
      "b-card": true,
    }
  });
}

const localVue = createLocalVue();
localVue.use(Vuex);

describe('Create AccountBalanceWidget', () => {
  describe("computed", () => {
    it('renders loading and error status', () => {
      // Arrange + Act:
      const wrapper = setupStoreMount();

      // Assert:
      expect(wrapper.vm.loading).toBe(false);
      expect(wrapper.vm.error).toBe(false);
    })

    it('renders address', () => {
      // Arrange + Act:
      const wrapper = setupStoreMount();

      // Assert:
      expect(wrapper.vm.address).toBe('BXR44G6KUHO7MODUB6E6WVJOK277QY65XCBJX5Y');
    })

    it('renders tokenName', () => {
      // Arrange + Act:
      const wrapper = setupStoreMount();

      // Assert:
      expect(wrapper.vm.tokenName).toBe('bxr');
    })

    it('renders bxr amount', () => {
      // Arrange + Act:
      const wrapper = setupStoreMount({
        amount: "1,000.000000",
        tokenAliasNames: ["bitxor"],
        tokenId: "6BED913FA20223F8"
      });

      // Assert:
      expect(wrapper.vm.balance).toBe('1,000.000000');
    })

    it('renders 0 bxr if token is not native currency', () => {
      // Arrange + Act:
      const wrapper = setupStoreMount({
        amount: "1,000.000000",
        tokenAliasNames: ["cat"],
        tokenId: "FFFFFFFFFFFFFFFF"
      });

      // Assert:
      expect(wrapper.vm.balance).toBe('0');
    })

    it('renders 0 BXR amount when token is empty', () => {
      // Arrange + Act:
      const wrapper = setupStoreMount();

      // Assert:
      expect(wrapper.vm.balance).toBe('0');
    })
  })
})
