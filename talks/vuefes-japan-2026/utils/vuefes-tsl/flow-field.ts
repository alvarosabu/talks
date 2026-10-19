import { add, float, Fn, mul } from 'three/tsl'
import type { Node } from 'three/webgpu'
import { fbm, flowField } from './noise'

// Three flow layers, each one sampled at a position already pushed by the
// previous one, then two fbm reads through the combined warp. Returns [0, 1].
export const generateSumiPattern = Fn(([uvNode, t, scale]: [Node, Node, Node]) => {
  const timeScale = t.mul(0.15)
  const st = uvNode.mul(scale)

  const flow = flowField(st.mul(2.0), timeScale)
  const flow2 = flowField(add(st.mul(4.0), flow.mul(0.2)), timeScale.mul(1.2))
  const flow3 = flowField(add(st.mul(8.0), flow2.mul(0.15)), timeScale.mul(0.9))

  const finalFlow = flow.mul(0.5).add(flow2.mul(0.3)).add(flow3.mul(0.2))

  const marbleNoise = fbm(add(st, finalFlow.mul(0.8)), float(0.6), float(2.0), float(1.8), float(0.5), 6)
  const sumiPattern = fbm(add(add(st, finalFlow).mul(3.0), t.mul(0.05)), float(0.6), float(2.0), float(1.8), float(0.5), 6)

  return marbleNoise.mul(0.5).add(sumiPattern.mul(0.5))
})

// Higher-frequency variant used only inside the narrow ink band.
export const generateSumiDetail = Fn(([uvNode, t]: [Node, Node]) => {
  const st = uvNode
  const timeScale = t.mul(0.15)

  const flow = flowField(mul(st, 2.0), timeScale)
  const flow2 = flowField(add(mul(st, 4.0), flow.mul(0.2)), timeScale.mul(1.2))
  const flow3 = flowField(add(mul(st, 8.0), flow2.mul(0.15)), timeScale.mul(0.9))

  const finalFlow = flow.mul(0.5).add(flow2.mul(0.3)).add(flow3.mul(0.2))

  return fbm(add(add(st, finalFlow).mul(6.0), t.mul(0.02)), float(0.8), float(4.0), float(2.2), float(0.7), 4)
})
