import { Card } from 'solid-bootstrap'

export default function AttachmentsView(props: any) {
  const fileType = props.src.split('.')[1]
  return (
    <Card
      class="position-relative overflow-hidden col-md-2 p-0 m-3"
      style={{ height: '200px', cursor: 'pointer' }}
    >
      {/(gif|jpe?g|tiff?|png|webp|bmp)$/.test(fileType) && (
        <img
          src={'http://localhost:6453/' + props.src}
          class="col-md-12"
          height={'200'}
          width="200"
        />
      )}
      {!/(gif|jpe?g|tiff?|png|webp|bmp)$/.test(fileType) && <span>Document</span>}
      <a
        download
        link={false}
        target='_blank'
        href={'http://localhost:6453/' + props.src}
        class="position-absolute btn btn-opacity bi bi-download text-primary"
      />

      <style>
        {`
                    .btn-opacity{
                        background: rgba(196, 196, 196, 0.44);
                        backdrop-filter: blur(2px);
                        bottom:10px;
                        right:10px;
                    }
                `}
      </style>
    </Card>
  )
}
