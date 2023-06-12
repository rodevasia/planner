import { Dropdown } from 'solid-bootstrap'
import { createStore } from 'solid-js/store'

function SelectBox(props: any) {
  const [selected, setSelected] = createStore<any>(props.selected)

  return (
    <>
      <Dropdown class="col-12 w-100 bg-secondary">
        <Dropdown.Toggle class="text-white selectBox w-100" variant="transparent">
          {selected.label ?? props.placeholder ?? 'Select Item'}
        </Dropdown.Toggle>

        <Dropdown.Menu class="options-cont p-0" variant="dark">
          {props.items &&
            props.items.map((t: any, i: number) => (
              <Dropdown.Item
                class={selected.index === i ? 'selected' : ''}
                onClick={(e) => {
                  setSelected({ ...t, index: i })
                  if (props.onSelect) {
                    props.onSelect(t.value)
                  }
                }}
              >
                {t.label}
              </Dropdown.Item>
            ))}
        </Dropdown.Menu>
      </Dropdown>
      <style>
        {`
                        .selectBox::after {
  display: none;
}
.selectBox::before {
  position: absolute;
  content: "";
  right: 5%;
  top: 33.33%;
  border-style: solid;
  border-width: 0.12em 0.12em 0 0;
  display: inline-block;
  height: 0.5em;
  width: 0.5em;
  transform: rotate(135deg);
  vertical-align: top;
  transition: 200ms;
}

.selectBox[aria-expanded="true"]::before {
  transform: rotate(-45deg) !important;
  top: 50%;
}
.selectBox{
    font-size:normal;
}
.options-cont{
    margin-top:5px !important;
    margin-bottom:5px !important;
}
.selected{
    background-color:var(--bs-primary) !important;
}
 `}
      </style>
    </>
  )
}

export default SelectBox

export function SelectOption(props: any) {
  return (
    <Dropdown.Item
      onClick={() => {
        if (props.onSelect) {
          props.onSelect(props.value)
        }
      }}
    >
      {props.children}
    </Dropdown.Item>
  )
}
