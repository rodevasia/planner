import { Color } from './BottomBar'

export default function (props: { type: ChipTypeProp; class?: string; onClick?: VoidFunction }) {
  return (
    <ChipBuilder
      onClick={props.onClick}
      class={props.class}
      text={props.type.text}
      borderColor={props.type.borderColor}
      backgroundColor={props.type.backgroundColor}
    />
  )
}

function ChipBuilder(props: {
  text: string
  borderColor: Color
  backgroundColor: Color
  class?: string
  onClick?: VoidFunction
}) {
  return (
    <div
      onClick={props.onClick}
      class={`chips py-1 px-3 ${props.class ?? ''}`}
      style={{
        'background-color': `${props.backgroundColor}`,
        width: 'max-content',
        'border-radius': '16px',
        border: `1px solid ${props.borderColor}`
      }}
    >
      <p class="m-0  text-small text-center" style={{ 'font-size': '12px' }}>
        {props.text}
      </p>
    </div>
  )
}

export const ChipType: ChipType = {
  progress: {
    text: 'IN PROGRESS',
    backgroundColor: 'rgba(188, 108, 251, 0.51)',
    borderColor: '#BC6CFB'
  },
  done: {
    text: 'DONE',
    backgroundColor: 'rgba(75, 235, 158, 0.38)',
    borderColor: '#4BEB9E'
  },
  todo: {
    text: 'TODO',
    backgroundColor: 'rgba(48, 163, 179, 0.43)',
    borderColor: '#30A3B3'
  },
  of(status) {
    if (status === 'progress') {
      return this.progress
    }
    if (status === 'done') {
      return this.done
    }
    if (status === 'todo') {
      return this.todo
    } else {
      return this.progress
    }
  }
}

type ChipType = {
  progress: ChipTypeProp

  done: ChipTypeProp

  todo: ChipTypeProp
  of(status: string): ChipTypeProp
}
interface ChipTypeProp {
  text: string
  borderColor: Color
  backgroundColor: Color
}
