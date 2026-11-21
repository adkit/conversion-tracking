interface TestRoute {
  path: string
  meta: Record<string, unknown>
}

interface NavigatedTestRoute extends TestRoute {
  fullPath: string
}

type AfterEachCallback = (to: NavigatedTestRoute, from: NavigatedTestRoute, failure?: unknown) => void

let runtimeConfig: Record<string, unknown> = {}
let currentRoute: TestRoute = { path: '/', meta: {} }
let afterEachCallback: AfterEachCallback | undefined

export const defineNuxtPlugin = <T>(plugin: T): T => plugin

export const useRuntimeConfig = () => runtimeConfig

export const useRoute = () => currentRoute

export const useRouter = () => ({
  afterEach(callback: AfterEachCallback) {
    afterEachCallback = callback
  },
})

export const setNuxtAppTestState = (input: {
  config: Record<string, unknown>
  route?: TestRoute
}) => {
  runtimeConfig = input.config
  currentRoute = input.route ?? { path: '/', meta: {} }
  afterEachCallback = undefined
}

const withFullPath = (route: TestRoute): NavigatedTestRoute => ({ ...route, fullPath: route.path })

export const navigateInNuxtAppTest = (route: TestRoute, failure?: unknown) => {
  if (!afterEachCallback) throw new Error('Nuxt afterEach callback was not registered')
  const from = withFullPath(currentRoute)
  if (!failure) currentRoute = route
  afterEachCallback(withFullPath(route), from, failure)
}
