import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { TOKEN_KEY } from '@/utils/constants'
import { createLogger } from '@/utils/logger'

const log = createLogger('router')

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/layout/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'LoginPage',
        component: () => import('@/views/Login.vue')
      }
    ],
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/layout/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'RegisterPage',
        component: () => import('@/views/Register.vue')
      }
    ],
    meta: { requiresAuth: false }
  },
  {
    // 注意：父路由不能声明 requiresAuth: false，否则 vue-router 会把父 meta
    // 合并进所有未显式声明 meta 的子路由，导致 /statistics 等页面游客可访问
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'banks',
        name: 'BankList',
        component: () => import('@/views/bank/BankList.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'banks/:id',
        name: 'BankDetail',
        component: () => import('@/views/bank/BankDetail.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'banks/:id/questions',
        name: 'QuestionList',
        component: () => import('@/views/question/QuestionList.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'questions',
        name: 'QuestionManage',
        component: () => import('@/views/question/QuestionManage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'banks/:bankId/questions/:questionId',
        name: 'QuestionDetail',
        component: () => import('@/views/question/QuestionDetail.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'banks/:id/questions/create',
        name: 'QuestionCreate',
        component: () => import('@/views/question/QuestionForm.vue')
      },
      {
        path: 'banks/:id/questions/:qid/edit',
        name: 'QuestionEdit',
        component: () => import('@/views/question/QuestionForm.vue')
      },
      {
        path: 'papers',
        name: 'PaperList',
        component: () => import('@/views/paper/PaperList.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'papers/:id',
        name: 'PaperDetail',
        component: () => import('@/views/paper/PaperDetail.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'papers/create',
        name: 'PaperCreate',
        component: () => import('@/views/paper/PaperForm.vue')
      },
      {
        path: 'papers/:id/edit',
        name: 'PaperEdit',
        component: () => import('@/views/paper/PaperForm.vue')
      },
      {
        path: 'papers/:id/exam',
        name: 'ExamPage',
        component: () => import('@/views/exam/ExamPage.vue')
      },
      {
        path: 'exam/sessions/:id/result',
        name: 'ExamResult',
        component: () => import('@/views/exam/ExamResult.vue')
      },
      {
        path: 'exam-records',
        name: 'ExamRecords',
        component: () => import('@/views/exam/ExamRecords.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'grading',
        name: 'GradingList',
        component: () => import('@/views/grading/GradingList.vue')
      },
      {
        path: 'grading/sessions/:id',
        name: 'GradingDetail',
        component: () => import('@/views/grading/GradingDetail.vue')
      },
      {
        path: 'practice',
        name: 'PracticeList',
        component: () => import('@/views/practice/PracticeList.vue')
      },
      {
        path: 'practice/sessions/:id',
        name: 'PracticePage',
        component: () => import('@/views/practice/PracticePage.vue')
      },
      {
        path: 'playground',
        name: 'Playground',
        component: () => import('@/views/practice/Playground.vue')
      },
      {
        path: 'wrong-questions',
        name: 'WrongQuestionList',
        component: () => import('@/views/wrongquestion/WrongQuestionList.vue')
      },
      {
        path: 'wrong-questions/snapshot/:id',
        name: 'WrongQuestionSnapshot',
        component: () => import('@/views/wrongquestion/WrongQuestionSnapshot.vue')
      },
      {
        path: 'favorites',
        name: 'FavoriteList',
        component: () => import('@/views/favorite/FavoriteList.vue')
      },
      {
        path: 'records',
        name: 'RecordList',
        component: () => import('@/views/record/RecordList.vue')
      },
      {
        path: 'search',
        name: 'SearchPage',
        component: () => import('@/views/search/SearchPage.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'notifications',
        name: 'NotificationList',
        component: () => import('@/views/notification/NotificationList.vue')
      },
      {
        path: 'statistics',
        name: 'StatisticsPage',
        component: () => import('@/views/statistics/StatisticsPage.vue')
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/profile/Profile.vue')
      },
      {
        path: 'admin/users',
        name: 'AdminUserList',
        component: () => import('@/views/admin/UserList.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'admin/reviews',
        name: 'ReviewList',
        component: () => import('@/views/admin/ReviewList.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'admin/invite-codes',
        name: 'AdminInviteCodeList',
        component: () => import('@/views/admin/InviteCodeList.vue'),
        meta: { requiresAdmin: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem(TOKEN_KEY)
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !token) {
    log.info(`访问受限页面 ${to.fullPath} → 重定向登录`)
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  if (!requiresAuth && token && (to.name === 'Login' || to.name === 'Register')) {
    log.info('已登录访问认证页 → 回首页')
    next({ name: 'Home' })
    return
  }

  // 检查管理员权限
  if (to.meta.requiresAdmin) {
    const authStore = useAuthStore()
    if (!authStore.isAdmin) {
      log.warn(`非管理员访问管理页 ${to.fullPath}，拦截`)
      next({ name: 'Home' })
      return
    }
  }

  next()
})

router.afterEach(to => {
  log.debug(`导航完成 → ${to.fullPath}`)
})

export default router