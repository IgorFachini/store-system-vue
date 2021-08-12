
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/Index.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/customers',
        component: () => import('src/pages/Customers.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/categories',
        component: () => import('src/pages/Categories.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/products',
        component: () => import('src/pages/Products.vue'),
        meta: {
          requiresAuth: true
        }
      },
      {
        path: '/sales',
        component: () => import('src/pages/Sales.vue'),
        meta: {
          requiresAuth: true
        }
      }
    ]
  },

  {
    path: '/',
    component: () => import('layouts/EmptyLayout.vue'),
    children: [
      { path: 'login', component: () => import('src/pages/Login.vue') }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
