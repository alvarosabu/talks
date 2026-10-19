import { useSlideContext } from '@slidev/client'
import { computed, reactive } from 'vue'

// Keyed by page because the footer (slide-top) is a sibling of the slide content,
// so provide/inject cannot reach it. Slidev also mounts neighbouring slides at once.
const hiddenPages = reactive(new Set<number>())

/**
 * Lets a slide hide its chrome (footer and anything in <ChromeFade>), e.g. while a
 * full-bleed scene has the audience's attention.
 */
export function useSlideChrome() {
  const { $page } = useSlideContext()
  const hidden = computed(() => hiddenPages.has($page.value))

  function setHidden(value: boolean) {
    if (value) { hiddenPages.add($page.value) }
    else { hiddenPages.delete($page.value) }
  }

  return { hidden, setHidden }
}
