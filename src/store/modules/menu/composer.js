import lazyLoading from './lazyLoading'

export default {
  name: 'Composer',
  meta: {
    expanded: false,
    title: 'menu.composer',
    iconClass: 'vuestic-icon vuestic-icon-statistics'
  },

  children: [
    {
      name: 'menu.composer.flow',
      path: '/composer/flow',
      component: lazyLoading('experiences/flow/Flow'),
      meta: {
        // title: 'menu.charts'
        title: 'menu.flow'
      }
    },
    {
      name: 'menu.composer.experiences',
      path: '/composer/experiences',
      component: lazyLoading('experiences/performance/Performance'),
      meta: {
        // title: 'menu.progressBars'
        title: 'menu.experiences'
      }
    }
  ]
}
