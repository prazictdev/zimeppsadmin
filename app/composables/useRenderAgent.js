/**
 * Drives the data-driven render loop: given a report payload, expose the
 * sections in render order and resolve each one's component from the registry.
 * No section logic lives in the viewer page — it just iterates these.
 *
 * @param {import('vue').Ref} payload Ref<ReportPayload|null>
 */
export const useRenderAgent = (payload) => {
  const { componentRegistry } = useReportRegistry()

  const sortedSections = computed(() =>
    payload.value
      ? [...payload.value.sections].sort((a, b) => a.order - b.order)
      : [],
  )

  const resolveComponent = (componentKey) => componentRegistry[componentKey] ?? null

  return { sortedSections, resolveComponent }
}
