
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') },
      { path: '/customers', component: () => import('src/pages/Customers.vue') },
      { path: '/categories', component: () => import('src/pages/Categories.vue') },
      { path: '/products', component: () => import('src/pages/Products.vue') },
      { path: '/sales', component: () => import('src/pages/Sales.vue') }
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
