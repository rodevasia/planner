import { notify } from '@renderer/components/ui/notify'
import { Card } from 'solid-bootstrap'
import { createSignal } from 'solid-js'

export function AttachmentsCard(props: any) {
  let ref
  const [file, setFile] = createSignal<any>()

  return (
    <Card class="position-relative col-md-3 p-0 m-3" style={{ height: '100px', cursor: 'pointer' }}>
      <div
        class="col-12 h-100 w-100 text-center"
        onClick={() => {
          ref.click()
        }}
      >
        {!file() && (
          <i style={{ 'font-size': '4.1rem' }} class="bi m-auto text-center bi-plus text-dark"></i>
        )}
        {file() && (
          <div class="d-flex col-12 m-auto h-100 justify-content-around flex-column align-items-center">
            <p class="text-dark h5">{file()?.type?.split('/')[1].toUpperCase()}</p>
            {/* <p>{file.name}</p> */}
          </div>
        )}
        <input
          ref={ref}
          class="file__picker"
          onChange={(e) => {
            if (e.target.files != null && e.target.files.length > 0) {
              setFile(e.target.files[0])
              props.onChange(e.target.files[0])
            } else notify.error('No file picked')
          }}
          type="file"
          accept="image/*"
        />
      </div>
      {file() && (
        <i
          onClick={() => {
            setFile(undefined)
            props.onChange(undefined)
          }}
          class="bi bi-trash m-auto text-center reset text-danger"
        ></i>
      )}
      <style>
        {`
                    input.file__picker{
                        visibility:hidden;
                    }
                    .reset{
                        position:absolute;
                        top:5px;
                        right:10px;
                        z-index:10;
                        height:24px;
                        width:24px;
                        border-radius:50px;
                        transition:1s background;
                    }
                    .reset:hover{
                        background:var(--bs-danger);
                        color:white !important;
                        
                    }
                `}
      </style>
    </Card>
  )
}
