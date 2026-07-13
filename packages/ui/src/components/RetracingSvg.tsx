import { motion, useReducedMotion } from 'framer-motion'
import type { ElementType } from 'react'

export type SvgTag = 'path' | 'circle' | 'ellipse' | 'line' | 'polyline' | 'polygon' | 'rect'

export type SvgElementAttrs = Record<string, string | number> & { key?: string }

export type SvgElementDef = [SvgTag, SvgElementAttrs]

export type RetraceTrigger = 'hover' | 'mount' | 'inview' | 'loop'

export interface AnimationDef {
  pathLength: number[]
  times?: number[]
  duration?: number
  ease?: string | number[]
  repeat?: number
  repeatType?: 'loop' | 'reverse' | 'mirror'
}

export interface ChoreographyDef {
  animateIndices?: number[]
  order?: number[]
  staggerStep?: number
}

export interface RetracingSvgProps {
  elements: SvgElementDef[]
  viewBox?: string
  width?: number | string
  height?: number | string
  strokeWidth?: number
  stroke?: string
  className?: string
  trigger?: RetraceTrigger
  animation?: AnimationDef
  choreography?: ChoreographyDef
}

const MOTION_TAG: Record<SvgTag, ElementType> = {
  path: motion.path,
  circle: motion.circle,
  ellipse: motion.ellipse,
  line: motion.line,
  polyline: motion.polyline,
  polygon: motion.polygon,
  rect: motion.rect,
}

export const RETRACE: AnimationDef = {
  pathLength: [1, 0, 1],
  times: [0, 0.45, 1],
  duration: 0.6,
  ease: 'easeInOut',
}

export const DRAW_IN: AnimationDef = {
  pathLength: [0, 1],
  times: [0, 1],
  duration: 0.7,
  ease: [0.23, 1, 0.32, 1],
}

export function RetracingSvg({
  elements,
  viewBox = '0 0 24 24',
  width = 24,
  height = 24,
  strokeWidth = 2,
  stroke = 'currentColor',
  className,
  trigger = 'hover',
  animation = RETRACE,
  choreography = {},
}: RetracingSvgProps) {
  const reducedMotion = useReducedMotion()

  const animateIndices = choreography.animateIndices ?? elements.map((_, i) => i)
  const order = choreography.order ?? [...animateIndices]
  const staggerStep =
    choreography.staggerStep ?? Math.min(0.06, 0.5 / Math.max(animateIndices.length, 1))

  const isLoop = trigger === 'loop'

  const svgProps =
    trigger === 'hover'
      ? { initial: 'rest', whileHover: 'animate' }
      : trigger === 'inview'
        ? { initial: 'rest', whileInView: 'animate', viewport: { once: true, amount: 0.3 } }
        : { initial: 'rest', animate: 'animate' }

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={width}
      height={height}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...svgProps}
    >
      {elements.map(([tag, attrs], i) => {
        const { key, ...rest } = attrs
        const Tag = MOTION_TAG[tag]
        const shouldAnimate = animateIndices.includes(i) && !reducedMotion

        if (!shouldAnimate) {
          return <Tag key={key ?? i} {...rest} />
        }

        const delay = order.indexOf(i) * staggerStep

        return (
          <Tag
            key={key ?? i}
            {...rest}
            variants={{
              rest: { pathLength: animation.pathLength[0] },
              animate: {
                pathLength: animation.pathLength,
                transition: {
                  duration: animation.duration ?? 0.6,
                  times: animation.times,
                  ease: animation.ease ?? 'easeInOut',
                  delay,
                  repeat: isLoop ? Infinity : (animation.repeat ?? 0),
                  repeatType: animation.repeatType ?? 'loop',
                },
              },
            }}
          />
        )
      })}
    </motion.svg>
  )
}
