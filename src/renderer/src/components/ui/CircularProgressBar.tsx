import { Component, createEffect, createSignal, onMount } from 'solid-js'
import { Color } from './BottomBar'

const CircularProgressBar: Component<{
  percentage: number
  sqSize: number
  strokeWidth: number
  color: Color
}> = (props) => {
  const [percentage, setPercent] = createSignal(0)
  onMount(() => {
    const intervale = setInterval(() => {
      if (percentage() < props.percentage) {
        setPercent((prev) => (prev += 1))
      } else {
        clearInterval(intervale)
      }
    }, 20)
  })

  const sqSize = props.sqSize
  // SVG centers the stroke width on the radius, subtract out so circle fits in square
  const radius = (props.sqSize - props.strokeWidth) / 2
  // Enclose circle in a circumscribing square
  const viewBox = `0 0 ${sqSize} ${sqSize}`
  // Arc length at 100% coverage is the circle circumference
  const dashArray = radius * Math.PI * 2
  // Scale 100% coverage overlay with the actual percent
  const [dashOffset, setDashOffset] = createSignal(1000)

  createEffect(() => {
    setDashOffset(dashArray - (dashArray * percentage()) / 100)
  })

  return (
    <>
      <svg width={props.sqSize} height={props.sqSize} viewBox={viewBox}>
        <circle
          class="circle-background"
          cx={props.sqSize / 2}
          cy={props.sqSize / 2}
          r={radius}
          stroke-width={`${props.strokeWidth}px`}
        />
        <circle
          class="circle-progress"
          cx={props.sqSize / 2}
          cy={props.sqSize / 2}
          r={radius}
          stroke-width={`${props.strokeWidth}px`}
          // Start progress marker at 12 O'Clock
          transform={`rotate(-90 ${props.sqSize / 2} ${props.sqSize / 2})`}
          style={{
            'stroke-dasharray': dashArray,
            'stroke-dashoffset': dashOffset().toString()
          }}
        />
        <text class="circle-text" x="50%" y="50%" dy=".3em" text-anchor="middle">
          {`${percentage()}%`}
        </text>
      </svg>
      <style>
        {`
                    #app {
margin-top: 40px;
}

#progressInput {
margin: 20px auto;
width: 30%;
}

.circle-background,
.circle-progress {
fill: none;
}

.circle-background {
stroke: #ddd;
}

.circle-progress {
stroke: ${props.color};
stroke-linecap: round;
stroke-linejoin: round;
}

.circle-text {
font-size: ${props.sqSize / 6 / 16}em;
font-weight: bold;
fill: #fff;
},`}
      </style>
    </>
  )
}

export default CircularProgressBar
