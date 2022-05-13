
const simpleCrudRoutersPath = [
  'customers',
  'expense-products',
  'products',
  'categories'
]

const crudRouterNames = [
  '',
  'add',
  'view',
  'edit'
]
const crudRoutersObjects = simpleCrudRoutersPath.reduce((acc, path) => {
  return [
    ...acc,
    ...crudRouterNames.map(name => {
      return {
        path: `/${path}/${(!name || name === 'add') ? name : `${name}/:id`}`,
        name: `${path}${(!name) ? '' : `.${name}`}`,
        component: () => import('src/pages/CRUDPages.vue')
      }
    })
  ]
}, [])

const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: {
      requiresAuth: true
    },
    children: [
      ...crudRoutersObjects,
      {
        path: '',
        component: () => import('pages/Index.vue')
      },
      {
        path: '/products/stock-history/:id',
        name: 'products.stockHistory',
        component: () => import('src/pages/ProductStockHistory.vue')
      },
      {
        path: '/sales',
        component: () => import('src/pages/Sales.vue')
      },
      {
        path: '/expenses',
        name: 'expenses',
        component: () => import('src/pages/Expenses.vue')
      },
      {
        path: '/cart-shop',
        component: () => import('src/pages/CartShop.vue')
      },
      {
        path: '/cash-flow',
        component: () => import('src/pages/CashFlow.vue')
      },
      {
        path: '/customers/cash-flow/:id',
        name: 'customer.cashFlow',
        component: () => import('src/pages/CashFlowCustomer.vue')
      },
      {
        path: '/customers/cart-shop/:customerId',
        name: 'customer.cartShop',
        component: () => import('src/pages/CartShop.vue')
      }
    ]
  },

  {
    path: '/',
    component: () => import('layouts/EmptyLayout.vue'),
    children: [
      { path: 'login', component: () => import('src/pages/Login.vue') },
      {
        path: '/sales/:id/print',
        props: true,
        component: () => import('src/pages/SalePrint.vue'),
        meta: {
          requiresAuth: true
        }
      }
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
