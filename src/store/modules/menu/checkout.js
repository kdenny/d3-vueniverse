import lazyLoading from './lazyLoading'

export default {
  name: 'Checkout',
  meta: {
    expanded: false,
    title: 'menu.checkout',
    iconClass: 'vuestic-icon vuestic-icon-statistics'
  },

  children: [
    {
      name: 'menu.sourcing',
      path: '/checkout/sourcing',
      component: lazyLoading('checkout/sourcing/Sourcing'),
      meta: {
        title: 'menu.sourcing'
      }
    },
    {
      name: 'menu.checkoutExp',
      path: '/checkout/experience',
      component: lazyLoading('checkout/experience/CheckoutExperience'),
      meta: {
        title: 'menu.checkoutExp'
      }
    },
    {
      name: 'menu.purchase',
      path: '/checkout/purchase',
      component: lazyLoading('checkout/purchase/Purchase'),
      meta: {
        title: 'menu.purchase'
      }
    }
  ]
}
