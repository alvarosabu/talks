import { reactive } from 'vue'

/** Every tweakable value of the background shader. Tuned by eye against styles/bg.png. */
export interface ShaderBgSettings {
  /** Noise units per second along the time axis: how fast the bands morph */
  speed: number
  /** Tilt of the noise domain in radians: the direction the bands run */
  angle: number
  /** Broad band frequency across x and y */
  broadFreqX: number
  broadFreqY: number
  /** Detail octave frequency across x and y */
  detailFreqX: number
  detailFreqY: number
  /** Time multiplier for the detail octave, relative to speed */
  detailSpeed: number
  /** Blend between broad (0) and detail (1) */
  detailWeight: number
  /** Perlin rarely leaves [-0.5, 0.5], so the sum is amplified before tone mapping */
  gain: number
  /** smoothstep edges on the amplified noise: below shadeLow is a valley, above shadeHigh a crest */
  shadeLow: number
  shadeHigh: number
  /** Luminance (0..1, sRGB) of valleys and crests */
  lumMin: number
  lumMax: number
  /** Exponent on the shade: above 1 keeps more of the field dark */
  curve: number
  /** Peak-to-peak grain amplitude in luminance */
  grain: number
}

export const SHADER_BG_DEFAULTS: ShaderBgSettings = {
  speed: 0.13,
  angle: 0.139203673205103,
  broadFreqX: 0.8,
  broadFreqY: 5.55,
  detailFreqX: 1.95,
  detailFreqY: 2.4,
  detailSpeed: 0.45,
  detailWeight: 0.25,
  gain: 1.85,
  shadeLow: -0.6,
  shadeHigh: 0.9,
  lumMin: 0.04,
  lumMax: 0.42,
  curve: 2,
  grain: 0.07,
}

// One shared object: every slide instance renders the same look, and the controls panel edits it in place
export const shaderBgSettings = reactive<ShaderBgSettings>({ ...SHADER_BG_DEFAULTS })

export function resetShaderBgSettings() {
  Object.assign(shaderBgSettings, SHADER_BG_DEFAULTS)
}
