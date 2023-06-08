export function ProgressBar({
  progress,
  captions = false
}: {
  progress: Progress[]
  captions?: boolean
}) {
  return (
    <div class="col-md-12">
      {' '}
      <div class="progress">
        {progress.map((item, index) => {
          return (
            <div
              class={'progress-bar ' + item.color}
              role="progressbar"
              style={{ width: `${item.value * 100}%` }}
              aria-valuenow={item.value}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          )
        })}
      </div>
      {captions && (
        <div class="row m-0 mt-2">
          {progress.map((item, index) => {
            return (
              <div class="col  row">
                <div class={'label-box p-0 my-auto col-md-1 ' + item.color}></div>
                <small class="col px-1">{item.caption}</small>
              </div>
            )
          })}
        </div>
      )}
      <style>
        {`
                .label-box{
                    height:15px;
                    width:15px;
                    border-radius:4px;
                }
            `}
      </style>
    </div>
  )
}

interface Progress {
  color: 'bg-primary' | 'bg-secondary' | 'bg-success' | 'bg-danger' | 'bg-warning'|"bg-dark"|"bg-light"
  caption: string
  value: number
}
