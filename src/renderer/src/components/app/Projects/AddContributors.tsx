import { createSignal, onCleanup } from 'solid-js'
import { FormControl, Dropdown, Card } from 'solid-bootstrap'
import { network } from '@renderer/api/configuration'
import { createStore } from 'solid-js/store'

function AddContributors({setArgs}) {
  const [suggestions, setSuggestions] = createSignal<any>({});
  const [contributors,setContributors]= createStore<any[]>([])
  const [loading, setLoading] = createSignal(false)
  let delayTimeout;
  const fetchEmailSuggestions = async (input) => {
    setLoading(true)
    const {data} = await network.get('/user/search',{params:{email:input}})
    setLoading(false)
    setSuggestions(data)
  }

  const handleInputChange = (e) => {
    const newEmail:string = e.target.value;
    clearTimeout(delayTimeout);
    const validator = 
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    if (newEmail.match(validator)?.length!>0) {
      delayTimeout = setTimeout(() => {
        fetchEmailSuggestions(newEmail);
      }, 500); // Delay in milliseconds before making the API request
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setContributors(prev=>[...prev,suggestion]);
    setArgs(contributors.map(r=>r.id))
    setSuggestions(null);
  }

  // Cleanup function to cancel any pending API requests
  onCleanup(() => {
    setLoading(false)
  })

  return (
    <div>
      <FormControl
        type="email"
        placeholder="Enter email"
        style={{"background-color":"var(--bs-secondary)"}}
        onInput={handleInputChange}
      />

      {loading() && <p>Loading...</p>}

      {suggestions()?.id&& (
        <Dropdown class='bg-secondary'  show={suggestions()?.id}>
          <Dropdown.Menu class='overflow-hidden p-0' variant='dark'>
              <Dropdown.Item class='text-white p-3' onClick={() => handleSuggestionSelect(suggestions())}>
                {suggestions()?.name}
              </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      )}
      {contributors.length>0 && <div class="d-flex mt-2">
        {contributors.map(t=>{
            return <Card class='p-2 flex-row text-white'>{t.name}
            <i onClick={()=>{
                const filtered = contributors.filter(q=>q.id!==t.id);
                setContributors(prev=>filtered);
                setArgs(filtered.map(r=>r.id))
            }} class="bi bi-x-circle text-danger pointer ms-3"></i>
            </Card>
        })}
        </div>}
    </div>
  )
}

export default AddContributors
