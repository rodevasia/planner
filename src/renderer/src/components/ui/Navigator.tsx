export default function Navigator(props: { label: string }) {
  const goBack = () => window.history.back()
  return (
    <div class="col-md-12 d-flex my-2">
      <i
        onClick={goBack}
        class="bi bi-arrow-left-circle-fill m-auto cursor-pointer text-white h3"
      />
      <p class="col-11 m-auto h5 text-white">{props.label}</p>
      <style>
        {`
                i{
                    cursor:pointer;
                }
                i:active{
                    color:#30A3B2 !important;
                }
               
                `}
      </style>
    </div>
  )
}
