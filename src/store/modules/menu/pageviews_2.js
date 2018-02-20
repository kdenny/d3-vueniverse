import lazyLoading from './lazyLoading'

export default {
  name: 'Pageviews2',
  meta: {
    expanded: true,
    title: 'menu.pageviews',
    iconClass: 'vuestic-icon vuestic-icon-maps'
  },

  children: [
    {
      name: 'PageviewDashboard',
      path: '/dashboard',
      component: lazyLoading('dashboard/Dashboard'),
      meta: {
        default: true,
        title: 'Dashboard'
      }
    },
    {
      name: 'ContentPage',
      path: '/pageviews/content',
      component: lazyLoading('pageviews/content/Content'),
      meta: {
        title: 'Content'
      }
    },
    // {
    //   name: 'TrafficPage',
    //   path: '/pageviews/traffic-volume',
    //   component: lazyLoading('pageviews/traffic-volume/TrafficVolume'),
    //   meta: {
    //     title: 'Traffic Volume'
    //   }
    // },
    {
      name: 'UserAgentPage',
      path: '/pageviews/user-agent',
      component: lazyLoading('pageviews/user-agent/UserAgent'),
      meta: {
        title: 'User Agent'
      }
    },
    {
      name: 'GeographyPage',
      path: '/pageviews/geography',
      component: lazyLoading('pageviews/geography/Geography'),
      meta: {
        title: 'Geography'
      }
    },
    {
      name: 'ReferrerPage',
      path: '/pageviews/referrer',
      component: lazyLoading('pageviews/referrer/Referrer'),
      meta: {
        title: 'Referrer'
      }
    }
  ]
}
