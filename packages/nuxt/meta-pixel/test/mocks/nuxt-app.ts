interface TestRoute {
  path: string
  meta: Record<string, unknown>
}

let runtimeConfig: Record<string, unknown> = {}
let currentRoute: TestRoute = { path: '/', meta: {} }
let afterEachCallback: ((route: TestRoute) => void) | undefined

export const defineNuxtPlugin = <T>(plugin: T): T => plugin

export const useRuntimeConfig = () => runtimeConfig

export const useRoute = () => currentRoute

export const useRouter = () => ({
  afterEach(callback: (route: TestRoute) => void) {
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

export const navigateInNuxtAppTest = (route: TestRoute) => {
  if (!afterEachCallback) throw new Error('Nuxt afterEach callback was not registered')
  afterEachCallback(route)
}
