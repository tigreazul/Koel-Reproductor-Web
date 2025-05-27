import type { Ref } from 'vue'
import { isRef } from 'vue'
import type { Placement } from '@floating-ui/dom'
import { arrow as arrowMiddleware, autoUpdate, flip, offset } from '@floating-ui/dom'
import { updateFloatingUi } from '@/utils/floatingUi'

export interface Config {
  placement: Placement
  useArrow: boolean
  autoTrigger: boolean
}

export const useFloatingUi = (
  reference: HTMLElement | Ref<HTMLElement | undefined>,
  floating: HTMLElement | Ref<HTMLElement | undefined>,
  config: Partial<Config> = {},
) => {
  const extractRef = <T extends HTMLElement | Ref<HTMLElement | undefined>> (ref: T): HTMLElement => {
    if (isRef(ref) && !ref.value) {
      throw new TypeError('Reference element is not defined')
    }

    return isRef(ref) ? ref.value! : ref
  }

  const createArrow = (floatingElement: HTMLElement): HTMLElement => {
    const arrow = document.createElement('div')
    arrow.className = 'arrow'
    floatingElement.appendChild(arrow)

    return arrow
  }

  const setupMiddleware = (useArrow: boolean, arrow?: HTMLElement) => {
    const middleware = [
      flip(),
      offset(6),
    ]

    if (useArrow && arrow) {
      middleware.push(arrowMiddleware({
        element: arrow,
        padding: 6,
      }))
    }

    return middleware
  }

  const mergedConfig: Config = Object.assign({
    placement: 'bottom',
    useArrow: true,
    autoTrigger: true,
  }, config)

  let _cleanUp: Closure
  let _show: Closure
  let _hide: Closure
  let _trigger: Closure

  const setup = () => {
    const referenceElement = extractRef(reference)
    const floatingElement = extractRef(floating)

    floatingElement.style.display = 'none'

    const arrow = mergedConfig.useArrow ? createArrow(floatingElement) : undefined
    const middleware = setupMiddleware(mergedConfig.useArrow, arrow)

    const update = async () => await updateFloatingUi(referenceElement, floatingElement, {
      placement: mergedConfig.placement,
      middleware,
    }, arrow)

    _cleanUp = autoUpdate(referenceElement, floatingElement, update)

    _show = async () => {
      floatingElement.style.display = 'block'
      await update()
    }

    _hide = () => (floatingElement.style.display = 'none')
    _trigger = () => floatingElement.style.display === 'none' ? _show() : _hide()

    if (mergedConfig.autoTrigger) {
      referenceElement.addEventListener('mouseenter', _show)
      referenceElement.addEventListener('focus', _show)
      referenceElement.addEventListener('mouseleave', _hide)
      referenceElement.addEventListener('blur', _hide)
    }
  }

  return {
    setup,
    teardown: () => _cleanUp(),
    show: () => _show(),
    hide: () => _hide(),
    trigger: () => _trigger(),
  }
}
