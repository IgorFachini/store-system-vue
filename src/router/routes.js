const simpleCrudRoutersPath = [
  'customers',
  'expense-products',
  'products',
  // 'categories',
  'expenses',
  'suppliers'
];

const crudRouterNames = [
  '',
  'add',
  'view',
  'edit'
];
const crudRoutersObjects = simpleCrudRoutersPath.reduce((acc, path) => {
  return [
    ...acc,
    ...crudRouterNames.map(name => {
      return {
        path: `/${path}/${(!name || name === 'add') ? name : `${name}/:id`}`,
        name: `${path}${(!name) ? '' : `.${name}`}`,
        component: () => import('src/pages/CRUDPages.vue')
      };
    })
  ];
}, []);

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
        component: () => import('pages/Index.vue'),
        meta: {
          title: 'Dashboard'
        }
      },
      {
        path: '/products/stock-history/:id',
        name: 'products.stockHistory',
        component: () => import('src/pages/StockHistory.vue')
      },
      {
        path: '/expense-products/stock-history/:id',
        name: 'expenseProducts.stockHistory',
        component: () => import('src/pages/StockHistory.vue')
      },
      // {
      //   path: '/sales',
      //   component: () => import('src/pages/Sales.vue')
      // },
      {
        path: '/cart-shop',
        meta: {
          title: 'Carinho de compras'
        },
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
];

export default routes;
